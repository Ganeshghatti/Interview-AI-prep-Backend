import mongoose from "mongoose";

const jobPositionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  company: {
    type: String,
    required: true,
  },
  jobLink: {
    type: String,
  },
  companyWebsite: {
    type: String,
  },
  location: {
    type: String,
    enum: ["On-site", "Remote", "Hybrid"],
    default: "Remote",
  },
  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Freelance", "Internship"],
    default: "Full-time",
  },
  level: {
    type: String,
    enum: ["Intern", "Junior", "Mid", "Senior", "Lead", "Director", "VP"],
    default: "Junior",
  },
  jobRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobRole",
    required: true,
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: "INR",
    },
    negotiable: {
      type: Boolean,
      default: true,
    },
  },
  equityOffered: {
    type: Boolean,
    default: false,
  },
  bonusIncluded: {
    type: Boolean,
    default: false,
  },
  contractDuration: {
    type: String,
    default: "12-month renewable",
  },
  responsibilities: {
    type: [String],
    default: [],
  },
  requirements: {
    type: [String],
    default: [],
  },
  preferredQualifications: {
    type: [String],
    default: [],
  },
  benefits: {
    type: [String],
    default: [],
  },
  applicationUrl: {
    type: String,
  },
  postedAt: {
    type: Date,
    default: Date.now,
  },
  closingDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
});

export default mongoose.model("JobPosition", jobPositionSchema);
