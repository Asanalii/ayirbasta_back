const Trade = require("../models/tradeModel");
const Counter = require("../models/counterModel");
const User = require("../models/userModel");
const Item = require("../models/itemModel"); // Use Item model directly

exports.createTrade = async (req, res) => {
  const { giver_id, receiver_id } = req.body;
  const userEmail = req.user.email;

  try {
    // Increment the trade counter
    const counterResult = await Counter.findOneAndUpdate(
      { _id: "trades" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counterResult) {
      return res.status(500).json({ message: "Error generating new trade ID" });
    }

    const newTradeId = counterResult.seq;

    // Fetch the giver and receiver items directly from Item model
    const giverItem = await Item.findOne({ id: giver_id });
    const receiverItem = await Item.findOne({ id: receiver_id });

    if (!giverItem || !receiverItem) {
      return res
        .status(404)
        .json({ message: "Giver or receiver item not found" });
    }

    // Ensure the authenticated user owns the giver item
    if (giverItem.user_email !== userEmail) {
      return res.status(403).json({ message: "You do not own the giver item" });
    }

    // Prevent trades on the user's own items
    if (receiverItem.user_email === userEmail) {
      return res
        .status(405)
        .json({ message: "You cannot trade with your own item" });
    }

    // Update item status to "trading"
    giverItem.status = "trading";
    receiverItem.status = "trading";

    await giverItem.save();
    await receiverItem.save();

    // Create the new trade
    const newTrade = new Trade({
      id: newTradeId,
      giver: giverItem,
      receiver: receiverItem,
      status: "waiting_action",
    });

    await newTrade.save();

    res.setHeader("Location", `/v1/trades/${newTrade._id}`);
    res.status(201).json({ trade: newTrade });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.acceptTrade = async (req, res) => {
  const tradeId = req.params.id;
  const userEmail = req.user.email;

  try {
    const trade = await Trade.findOne({ id: tradeId });
    if (!trade || trade.status !== "waiting_action") {
      return res
        .status(405)
        .json({ message: "Trade has ended or does not exist" });
    }

    // Determine if the user is the giver or receiver
    const isGiver = userEmail === trade.giver.user_email;
    const isReceiver = userEmail === trade.receiver.user_email;

    if (!isGiver && !isReceiver) {
      return res
        .status(403)
        .json({ message: "You are not involved in this trade" });
    }

    if (isGiver) {
      trade.giver.status = "Accepted";
    } else if (isReceiver) {
      trade.receiver.status = "Accepted";
    }

    // Check if both parties have accepted
    if (
      trade.giver.status === "Accepted" &&
      trade.receiver.status === "Accepted"
    ) {
      trade.status = "confirmed_trade";

      // Update item statuses to "deleted" in the Item model
      await Item.updateOne(
        { id: trade.giver.id },
        { $set: { status: "deleted" } }
      );
      await Item.updateOne(
        { id: trade.receiver.id },
        { $set: { status: "deleted" } }
      );
    }

    trade.markModified("giver");
    trade.markModified("receiver");
    await trade.save();

    res.status(200).json({ message: "Trade accepted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.declineTrade = async (req, res) => {
  const tradeId = req.params.id;
  const userEmail = req.user.email;

  try {
    const trade = await Trade.findOne({ id: tradeId });

    if (!trade || trade.status !== "waiting_action") {
      return res
        .status(405)
        .json({ message: "Trade has ended or does not exist" });
    }

    if (
      userEmail !== trade.giver.user_email &&
      userEmail !== trade.receiver.user_email
    ) {
      return res
        .status(403)
        .json({ message: "You are not involved in this trade" });
    }

    // Update trade status to "canceled_trade"
    trade.status = "canceled_trade";
    trade.giver.status = "declined";
    trade.receiver.status = "declined";

    // Revert items back to "available" in the Item model
    await Item.updateOne(
      { id: trade.giver.id },
      { $set: { status: "available" } }
    );
    await Item.updateOne(
      { id: trade.receiver.id },
      { $set: { status: "available" } }
    );

    trade.markModified("giver");
    trade.markModified("receiver");
    await trade.save();

    res.status(200).json({ message: "Trade declined successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.showTrade = async (req, res) => {
  const tradeId = req.params.id;

  try {
    const trade = await Trade.findOne({ id: tradeId });
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    res.status(200).json({ trade });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
