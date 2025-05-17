const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Fix deprecation warning
mongoose.set("strictQuery", false);

// Import routes
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const employeeRoutes = require("./routes/employee.routes");
const paymentRoutes = require("./routes/payment.routes");
const supplierRoutes = require("./routes/supplier.routes");
const siteRoutes = require("./routes/site.routes");
const contractorRoutes = require("./routes/contractor.routes");
const reportRoutes = require("./routes/report.route");
const userRoutes = require("./routes/user.routes"); // Add user routes
const attendanceRoutes = require("./routes/attendance.routes");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`, "- Body:", req.body);
  next();
});

// MongoDB Connection URI using your successful connection string
const uri =
  "mongodb+srv://brackley:van%402017@cluster0.72vy5.gcp.mongodb.net/gofar-db?retryWrites=true&w=majority&appName=Cluster0";

// Connect using Mongoose (not MongoDB driver)
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB via Mongoose"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes registration
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/employees", employeeRoutes);
app.use("/payments", paymentRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/sites", siteRoutes);
app.use("/contractors", contractorRoutes);
app.use("/reports", reportRoutes);
app.use("/users", userRoutes); // Register user routes
app.use("/attendances", attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("MongoDB connection closed");
  process.exit(0);
});

// Server startup
const startServer = async () => {
  try {
    const port = process.env.PORT || 5000;
    const alternatePort = 5001; // Fallback port

    const server = app
      .listen(port, () => {
        console.log(`Server running on port ${port}`);
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.log(`Port ${port} is busy, trying ${alternatePort}...`);
          server.close();
          app.listen(alternatePort, () => {
            console.log(`Server running on alternate port ${alternatePort}`);
          });
        } else {
          console.error("Server error:", err);
        }
      });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
