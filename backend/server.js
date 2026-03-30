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

const app = express();

// ── CORS ──────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow any localhost port in development
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

// ── Swagger ───────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Stag.io API",
      version: "1.0.0",
      description: "API documentation for Stag.io platform",
    },
    servers: [
      { url: "http://localhost:5000", description: "Local development" },
      { url: "https://stagio-backend.onrender.com", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, "/routes/*.js")],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customSiteTitle: "Stag.io API Docs",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
}));

// ── API Routes ────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/offers",       offerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/conventions",  conventionRoutes);
app.use("/api/supervisor",   supervisorRoutes);
app.use("/api/company",      companyRoutes);
app.use("/api/super",        superAdminRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/student",      studentRoutes);

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
mongoose
  .connect(process.env.MONGO_URI || "mongodb+srv://rawanhalbout_db_user:rawannouni19@cluster0.dylysbc.mongodb.net/stagdb?retryWrites=true&w=majority")
  .then(() => console.log("✅  MongoDB connected"))
  .catch((err) => console.log("❌  MongoDB Error:", err.message));

// ── Start server ──────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running on port ${PORT}`);
  console.log(`📚  Swagger docs → http://localhost:${PORT}/api-docs`);
});