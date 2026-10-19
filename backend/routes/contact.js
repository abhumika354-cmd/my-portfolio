
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const requireAdmin = require("../middleware/auth");

// GET: Admin can view all contact messages
router.get("/", requireAdmin, async (req, res) => {
  try {
    const [messages] = await pool.execute(
      `SELECT id, name, email, message, created_at
       FROM contact_messages
       ORDER BY id DESC`
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Fetch contact messages error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch contact messages.",
    });
  }
});

// POST: Public portfolio contact form can send a message
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    if (
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      cleanMessage.length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    await pool.execute(
      `INSERT INTO contact_messages (name, email, message)
       VALUES (?, ?, ?)`,
      [cleanName, cleanEmail, cleanMessage]
    );

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Save contact message error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to send your message right now.",
    });
  }
});

// DELETE: Only admin can delete a contact message
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM contact_messages WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact message error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to delete contact message.",
    });
  }
});

module.exports = router;
