// models/JobRole.js
const mongoose = require("mongoose");

const jobRoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  category: {
    type: String,
    enum: [
      "Engineering",
      "Product",
      "Design",
      "Marketing",
      "Sales",
      "HR",
      "Finance",
      "Legal",
      "Operations",
      "Other",
    ],
    default: "Other",
  },
  skills: [
    {
      type: String,
    },
  ],
  tools: [
    {
      type: String,
    },
  ],
  certifications: [
    {
      type: String,
    },
  ],
  responsibilities: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("JobRole", jobRoleSchema);
