const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const offerRoutes = require("./routes/offerRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const conventionRoutes = require("./routes/conventionRoutes");
const supervisorRoutes = require("./routes/supervisorRoutes");
const companyRoutes = require("./routes/companyRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const supervisorMgmtRoutes = require("./routes/supervisorMgmtRoutes");

const app = express();

// ── CORS ──────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ── Body parser ───────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Swagger (FIXED) ───────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Stag.io API",
      version: "1.0.0",
      description: "API documentation for Stag.io platform",
    },
    servers: [
      { url: "http://localhost:5000" }
    ]
  },
  apis: [path.join(__dirname, "/routes/*.js")]
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ── API Routes ────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/conventions", conventionRoutes);
app.use("/api/supervisor", supervisorRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/company", supervisorMgmtRoutes);
app.use("/api/super", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);

// ── Health check ──────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Stag.io backend running" });
});

// ── Global error handler ──────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ── MongoDB ───────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error("❌  Missing MONGO_URI in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅  MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀  Server running on port ${PORT}`);
      console.log(`📚  Swagger docs → http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌  MongoDB Error:", err.message || err);
    console.error("❌  Server startup aborted because MongoDB connection failed.");
    process.exit(1);
  }
}

startServer();