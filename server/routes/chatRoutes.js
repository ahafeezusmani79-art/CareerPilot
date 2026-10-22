
const express = require("express");
const mongoose = require("mongoose");
const protect = require("../middleware/authMiddleware");
const Chat = require("../models/Chat");

const router = express.Router();

// Every chat-history endpoint requires authentication.
router.use(protect);

// List only the logged-in user's chats.
router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ chats });
  } catch (error) {
    console.error("List chats error:", error.message);
    return res.status(500).json({
      message: "Could not load chat history.",
    });
  }
});

// Create a new chat for the logged-in user.
router.post("/", async (req, res) => {
  try {
    const { title } = req.body || {};

    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim().length > 100)
    ) {
      return res.status(400).json({
        message: "Chat title must be a string of at most 100 characters.",
      });
    }

    const chat = await Chat.create({
      userId: req.userId,
      title: title?.trim() || "New Career Chat",
      messages: [],
    });

    return res.status(201).json({
      message: "Chat created successfully.",
      chat,
    });
  } catch (error) {
    console.error("Create chat error:", error.message);
    return res.status(500).json({
      message: "Could not create chat.",
    });
  }
});

// Save a user message and its AI reply to an owned conversation.
router.post("/:id/messages", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid chat ID." });
  }

  const { userMessage, assistantMessage } = req.body || {};

  if (
    typeof userMessage !== "string" ||
    typeof assistantMessage !== "string" ||
    !userMessage.trim() ||
    !assistantMessage.trim() ||
    userMessage.trim().length > 10000 ||
    assistantMessage.trim().length > 10000
  ) {
    return res.status(400).json({
      message:
        "Both messages must be non-empty strings of at most 10000 characters.",
    });
  }

  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found.",
      });
    }

    // Two messages are saved per exchange; the schema allows 200.
    if (chat.messages.length > 198) {
      return res.status(400).json({
        message: "This conversation has reached its message limit.",
      });
    }

    chat.messages.push(
      { role: "user", content: userMessage.trim() },
      { role: "assistant", content: assistantMessage.trim() }
    );

    // Give a new conversation a useful title from its first message.
    if (chat.messages.length === 2 && chat.title === "New Career Chat") {
      chat.title = userMessage.trim().slice(0, 100);
    }

    await chat.save();

    return res.status(200).json({
      message: "Conversation messages saved successfully.",
      chat,
    });
  } catch (error) {
    console.error("Save chat messages error:", error.message);
    return res.status(500).json({
      message: "Could not save conversation messages.",
    });
  }
});

// Retrieve one chat, but only if it belongs to the logged-in user.
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid chat ID." });
  }

  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found.",
      });
    }

    return res.status(200).json({ chat });
  } catch (error) {
    console.error("Get chat error:", error.message);
    return res.status(500).json({
      message: "Could not load this chat.",
    });
  }
});

// Delete a chat only if it belongs to the logged-in user.
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid chat ID." });
  }

  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found.",
      });
    }

    return res.status(200).json({
      message: "Chat deleted successfully.",
    });
  } catch (error) {
    console.error("Delete chat error:", error.message);
    return res.status(500).json({
      message: "Could not delete chat.",
    });
  }
});

module.exports = router;
