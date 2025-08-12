import JobPosition from "../../models/job-positions.js";

export const getAllActiveJobPositions = async (req, res) => {
  try {
    const jobPositions = await JobPosition.find({ status: "Active" });
    res.status(200).json({ success: true, jobPositions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
