const express = require("express");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const { Client } = require("pg");
const cors = require("cors");
require("dotenv").config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const PORT = process.env.PORT || 80;

const app = express();

app.use(
  cors({
    origin:
      process.env.ENV === "local"
        ? "http://localhost:5173"
        : process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    headers: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(express.json());

// Input validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

const validateUUID = (id) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        status: false,
        message: "Invalid email format",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if user already exists
    const existingUser = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const results = await client.query(
      `INSERT INTO users(email, password) VALUES ($1, $2) RETURNING id, email, created_at`,
      [email, hashedPassword]
    );

    return res.status(201).json({
      status: true,
      message: "signup successful",
      data: results.rows[0],
    });
  } catch (e) {
    return res
      .status(500)
      .json({ status: false, message: "failed to signup", e: e });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        status: false,
        message: "Invalid email format",
      });
    }

    const results = await client.query(
      `SELECT id,email, password from users WHERE email = $1`,
      [email]
    );

    if (results.rowCount === 0) {
      return res.status(404).json({
        status: false,
        message: "user not found",
      });
    }

    const dbPassword = results.rows[0].password;
    const isValidPassword = await bcrypt.compare(password, dbPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        status: false,
        message: "wrong password",
      });
    }

    return res.status(200).json({
      status: true,
      message: "login successful",
      data: {
        id: results.rows[0].id,
        email: results.rows[0].email,
      },
    });
  } catch (e) {
    res.status(500).json({ status: false, message: "login failed" });
  }
});

app
  .route("/api/data")
  .get(async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          status: false,
          message: "User ID is required",
        });
      }

      if (!validateUUID(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid user ID format",
        });
      }

      const results = await client.query(
        `SELECT id, url, created_at, updated_at FROM urls where user_id = $1 and is_active=TRUE`,
        [id]
      );

      return res.status(200).json({
        status: true,
        message: `total records ${results.rowCount}`,
        data: results.rows,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ status: false, message: "error while fetching data" });
    }
  })
  .post(async (req, res) => {
    try {
      const id = req.body.id;
      const url = req.body.url;

      // Validation
      if (!id || !url) {
        return res.status(400).json({
          status: false,
          message: "User ID and URL are required",
        });
      }

      if (!validateUUID(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid user ID format",
        });
      }

      if (!validateUrl(url)) {
        return res.status(400).json({
          status: false,
          message: "Invalid URL format",
        });
      }

      const results = await client.query(
        `INSERT INTO urls (user_id, url) VALUES ($1, $2) RETURNING id,url, created_at`,
        [id, url]
      );

      return res.status(200).json({
        status: true,
        message: `successfully inserted data`,
        data: results.rows[0],
      });
    } catch (e) {
      return res
        .status(500)
        .json({ status: false, message: "error while inserting new records" });
    }
  })
  .patch(async (req, res) => {
    try {
      const id = req.body.id;
      const url = req.body.url;
      const urlId = req.body.url_id;
      if (!id || !url || !urlId) {
        return res.status(400).json({
          status: false,
          message: "User ID, URL ID, and new URL are required",
        });
      }

      if (!validateUUID(id) || !validateUUID(urlId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid ID format",
        });
      }

      if (!validateUrl(url)) {
        return res.status(400).json({
          status: false,
          message: "Invalid URL format",
        });
      }

      const results = await client.query(
        `UPDATE urls SET url = $1 , updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 and id = $3 and is_active = TRUE RETURNING url, updated_at`,
        [url, id, urlId]
      );
      if (results.rows.length === 0) {
        return res.status(404).json({
          status: false,
          message: "URL not found or you don't have permission to update it",
        });
      }

      return res.status(200).json({
        status: true,
        message: `successfully updated data`,
        data: results.rows[0],
      });
    } catch (e) {
      return res
        .status(500)
        .json({ status: false, message: "error while updating data" });
    }
  })
  .delete(async (req, res) => {
    try {
      const { url_id, id } = req.body;

      // Validation
      if (!url_id) {
        return res.status(400).json({
          status: false,
          message: "URL ID is required",
        });
      }

      if (!validateUUID(url_id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid URL ID format",
        });
      }

      // SECURITY FIX: Also check user_id to prevent unauthorized deletion
      if (id && !validateUUID(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid user ID format",
        });
      }

      const results = await client.query(
        `UPDATE urls SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 and user_id=$2 and is_active=TRUE RETURNING url`,
        [url_id, id]
      );

      return res.status(200).json({
        status: true,
        message: `successfully deleted data`,
        data: results.rows[0],
      });
    } catch (e) {
      return res
        .status(500)
        .json({ status: false, message: "error while deleting data" });
    }
  });

app.use((req, res) => {
  res.status(404).json({ status: false, message: "api not found" });
});

// Error handler
app.use((req, res, next) => {
  return res.status(500).json({
    status: false,
    message: "internal server error",
  });
});

app.listen(PORT, async () => {
  console.log(`server running on port ${PORT}`);
  await client.connect();
  console.log(`connected to database`);
});
