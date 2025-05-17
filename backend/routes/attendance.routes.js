const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Site = require("../models/Site");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Get all attendance records with filtering
router.get("/", auth, async (req, res) => {
  try {
    const { employeeId, siteId, startDate, endDate, status } = req.query;

    let query = {};

    if (employeeId) {
      query.employee = mongoose.Types.ObjectId(employeeId);
    }

    if (siteId) {
      query.site = mongoose.Types.ObjectId(siteId);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    const attendances = await Attendance.find(query)
      .populate("employee", "name nationalId position")
      .populate("site", "name location")
      .sort({ date: -1 });

    res.json(attendances);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get attendance summary by status
router.get("/summary", auth, async (req, res) => {
  try {
    const { startDate, endDate, siteId } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start and end dates are required" });
    }

    let matchStage = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (siteId) {
      matchStage.site = mongoose.Types.ObjectId(siteId);
    }

    const summary = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.json(summary);
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new attendance record
router.post("/", auth, async (req, res) => {
  try {
    const {
      employeeId,
      siteId,
      date,
      status,
      clockIn,
      clockOut,
      hours,
      notes,
    } = req.body;

    // Validate employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Validate site exists
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    // Create attendance record
    const attendance = new Attendance({
      employee: employeeId,
      site: siteId,
      date: new Date(date),
      status,
      clockIn: clockIn ? new Date(clockIn) : undefined,
      clockOut: clockOut ? new Date(clockOut) : undefined,
      hours: hours || 0,
      notes,
    });

    const savedAttendance = await attendance.save();

    // Update employee's present status if today's record
    const today = new Date();
    const recordDate = new Date(date);
    if (
      recordDate.getDate() === today.getDate() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    ) {
      await Employee.findByIdAndUpdate(employeeId, {
        present: status === "present",
        $inc: { hours: hours || 0 },
      });
    }

    const populatedAttendance = await Attendance.findById(savedAttendance._id)
      .populate("employee", "name nationalId position")
      .populate("site", "name location");

    res.status(201).json(populatedAttendance);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "An attendance record already exists for this employee, date, and site",
      });
    }
    console.error("Error creating attendance record:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get attendance record by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("employee", "name nationalId position")
      .populate("site", "name location");

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update attendance record
router.put("/:id", auth, async (req, res) => {
  try {
    const { status, clockIn, clockOut, hours, notes } = req.body;

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        status,
        clockIn: clockIn ? new Date(clockIn) : undefined,
        clockOut: clockOut ? new Date(clockOut) : undefined,
        hours,
        notes,
      },
      { new: true }
    )
      .populate("employee", "name nationalId position")
      .populate("site", "name location");

    if (!updatedAttendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Update employee if today's record
    const today = new Date();
    const recordDate = new Date(updatedAttendance.date);
    if (
      recordDate.getDate() === today.getDate() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    ) {
      const oldAttendance = await Attendance.findById(req.params.id);
      const hoursDiff = (hours || 0) - (oldAttendance.hours || 0);

      await Employee.findByIdAndUpdate(updatedAttendance.employee, {
        present: status === "present",
        $inc: { hours: hoursDiff },
      });
    }

    res.json(updatedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attendance record
router.delete("/:id", auth, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Update employee hours if today's record
    const today = new Date();
    const recordDate = new Date(attendance.date);
    if (
      recordDate.getDate() === today.getDate() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    ) {
      await Employee.findByIdAndUpdate(attendance.employee, {
        $inc: { hours: -(attendance.hours || 0) },
      });
    }

    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk create/update attendance records
router.post("/bulk", auth, async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No records provided" });
    }

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    // Process each record
    for (const record of records) {
      try {
        const {
          employeeId,
          siteId,
          date,
          status,
          clockIn,
          clockOut,
          hours,
          notes,
          id,
        } = record;

        // Update existing record if ID provided
        if (id) {
          await Attendance.findByIdAndUpdate(id, {
            status,
            clockIn: clockIn ? new Date(clockIn) : undefined,
            clockOut: clockOut ? new Date(clockOut) : undefined,
            hours,
            notes,
          });
          results.updated++;
        } else {
          // Check if record already exists
          const existingRecord = await Attendance.findOne({
            employee: employeeId,
            site: siteId,
            date: new Date(date),
          });

          if (existingRecord) {
            await Attendance.findByIdAndUpdate(existingRecord._id, {
              status,
              clockIn: clockIn ? new Date(clockIn) : undefined,
              clockOut: clockOut ? new Date(clockOut) : undefined,
              hours,
              notes,
            });
            results.updated++;
          } else {
            const attendance = new Attendance({
              employee: employeeId,
              site: siteId,
              date: new Date(date),
              status,
              clockIn: clockIn ? new Date(clockIn) : undefined,
              clockOut: clockOut ? new Date(clockOut) : undefined,
              hours: hours || 0,
              notes,
            });

            await attendance.save();
            results.created++;
          }
        }

        // Update employee present status if today's record
        const today = new Date();
        const recordDate = new Date(date);
        if (
          recordDate.getDate() === today.getDate() &&
          recordDate.getMonth() === today.getMonth() &&
          recordDate.getFullYear() === today.getFullYear()
        ) {
          await Employee.findByIdAndUpdate(employeeId, {
            present: status === "present",
            hours: hours || 0,
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          record: record,
          error: error.message,
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error processing bulk attendance:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
