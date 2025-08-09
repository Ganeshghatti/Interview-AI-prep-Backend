import JobRole from "../../models/job-roles.js";

export const createJobRole = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      tools,
      certifications,
      responsibilities,
      educationLevel,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, msg: "Title is required" });
    }

    const jobRole = await JobRole.create({
      title,
      description,
      category,
      skills,
      tools,
      certifications,
      responsibilities,
      educationLevel,
      status,
    });
    res.status(201).json({ success: true, jobRole });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobRoles = async (req, res) => {
  try {
    const jobRoles = await JobRole.find();
    res.status(200).json({ success: true, jobRoles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobRole = await JobRole.findById(id);
    
    if (!jobRole) {
      return res.status(404).json({ 
        success: false, 
        message: "Job role not found" 
      });
    }
    
    res.status(200).json({ success: true, jobRole });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJobRole = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      skills,
      tools,
      certifications,
      responsibilities,
      educationLevel,
      status,
    } = req.body;

    const jobRole = await JobRole.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        skills,
        tools,
        certifications,
        responsibilities,
        educationLevel,
        status,
      },
      { new: true }
    );
    res.status(200).json({ success: true, jobRole });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteJobRole = async (req, res) => {
  try {
    const { id } = req.params;

    const jobRole = await JobRole.findById(id);
    if (!jobRole) {
      return res
        .status(404)
        .json({ success: false, message: "Job role not found" });
    }
    await jobRole.deleteOne();
    res.status(200).json({ success: true, message: "Job role deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
