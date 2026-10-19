
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const requireAdmin = require("../middleware/auth");

// GET: Public can view all projects
router.get("/", async (req, res) => {
  try {
    const [projects] = await pool.query(
      `SELECT id, title, description, tech_stack,
              project_link, image_url, created_at
       FROM projects
       ORDER BY id DESC`
    );

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Fetch projects error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch projects.",
    });
  }
});

// POST: Admin adds a project
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      tech_stack,
      project_link,
      image_url,
    } = req.body || {};

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof tech_stack !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and tech stack are required.",
      });
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanTechStack = tech_stack.trim();

    if (!cleanTitle || !cleanDescription || !cleanTechStack) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    if (
      cleanTitle.length > 255 ||
      cleanDescription.length > 5000 ||
      cleanTechStack.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more project fields exceed the allowed length.",
      });
    }

    const cleanProjectLink = validateOptionalUrl(project_link, "Project link");
    if (cleanProjectLink.error) {
      return res.status(400).json({
        success: false,
        message: cleanProjectLink.error,
      });
    }

    const cleanImageUrl = validateOptionalUrl(image_url, "Image URL");
    if (cleanImageUrl.error) {
      return res.status(400).json({
        success: false,
        message: cleanImageUrl.error,
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO projects
       (title, description, tech_stack, project_link, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [
        cleanTitle,
        cleanDescription,
        cleanTechStack,
        cleanProjectLink.value,
        cleanImageUrl.value,
      ]
    );

    const [rows] = await pool.execute(
      `SELECT id, title, description, tech_stack,
              project_link, image_url, created_at
       FROM projects
       WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Project added successfully.",
      project: rows[0],
    });
  } catch (error) {
    console.error("Add project error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add project.",
    });
  }
});

// PUT: Admin updates a project
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const {
      title,
      description,
      tech_stack,
      project_link,
      image_url,
    } = req.body || {};

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof tech_stack !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and tech stack are required.",
      });
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanTechStack = tech_stack.trim();

    if (!cleanTitle || !cleanDescription || !cleanTechStack) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    if (
      cleanTitle.length > 255 ||
      cleanDescription.length > 5000 ||
      cleanTechStack.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more project fields exceed the allowed length.",
      });
    }

    const cleanProjectLink = validateOptionalUrl(project_link, "Project link");
    if (cleanProjectLink.error) {
      return res.status(400).json({
        success: false,
        message: cleanProjectLink.error,
      });
    }

    const cleanImageUrl = validateOptionalUrl(image_url, "Image URL");
    if (cleanImageUrl.error) {
      return res.status(400).json({
        success: false,
        message: cleanImageUrl.error,
      });
    }

    const [result] = await pool.execute(
      `UPDATE projects
       SET title = ?, description = ?, tech_stack = ?,
           project_link = ?, image_url = ?
       WHERE id = ?`,
      [
        cleanTitle,
        cleanDescription,
        cleanTechStack,
        cleanProjectLink.value,
        cleanImageUrl.value,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, title, description, tech_stack,
              project_link, image_url, created_at
       FROM projects
       WHERE id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: "Project updated successfully.",
      project: rows[0],
    });
  } catch (error) {
    console.error("Update project error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update project.",
    });
  }
});

// DELETE: Admin deletes a project
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM projects WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete project error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete project.",
    });
  }
});

// Validate optional URLs
function validateOptionalUrl(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  if (typeof value !== "string" || value.length > 2048) {
    return { error: `${fieldName} is invalid.` };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return { value: null };
  }

  try {
    const parsed = new URL(trimmed);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { error: `${fieldName} must start with http:// or https://.` };
    }

    return { value: parsed.href };
  } catch {
    return { error: `${fieldName} must be a valid URL.` };
  }
}

module.exports = router;
