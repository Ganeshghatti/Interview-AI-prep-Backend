const JobRole = require("../../models/job-roles");

exports.getAllActiveJobRoles = async (req, res) => {
  try {
    const jobRoles = await JobRole.find({ status: "Active" });
    res.status(200).json({ success: true, jobRoles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
