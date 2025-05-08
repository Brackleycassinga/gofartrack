const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const app = express();

// Import routes
const employeeRoutes = require("./routes/employee.routes");
const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const paymentRoutes = require("./routes/payment.routes");
const supplierRoutes = require("./routes/supplier.routes");
const siteRoutes = require("./routes/site.routes");
const contractorRoutes = require("./routes/contractor.routes");
const reportRoutes = require("./routes/report.route");
const userRoutes = require("./routes/user.routes");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/gofartrack", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/contractors", contractorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/users", userRoutes); // Register user routes

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// Catch-all route should be last
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Remove the app.listen part and export the app
module.exports = app;
