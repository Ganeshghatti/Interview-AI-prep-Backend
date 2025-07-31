const JobPosition = require("../../models/job-positions");
const InterviewPrep = require("../../models/interview-prep");
const User = require("../../models/user");
const JobRole = require("../../models/job-roles");

exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch active job positions
    const jobPositions = await JobPosition.find({ status: "Active" });

    // Fetch active job roles
    const jobRoles = await JobRole.find({ status: "Active" });

    // Fetch interview preparations for the user
    const interviewPreps = await InterviewPrep.find({ userId }).populate(
      "jobRoleId"
    );

    res.status(200).json({
      success: true,
      user,
      jobPositions,
      jobRoles,
      interviewPreps,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
