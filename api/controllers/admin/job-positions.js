import JobPosition from "../../models/job-positions.js";
import JobRole from "../../models/job-roles.js";

export const createJobPosition = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      jobLink,
      companyWebsite,
      location,
      type,
      level,
      jobRole,
      salaryRange,
      equityOffered,
      bonusIncluded,
      contractDuration,
      responsibilities,
      requirements,
      preferredQualifications,
      benefits,
      applicationUrl,
      closingDate,
      status,
    } = req.body;

    if (!title || !company || !jobRole) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, company, and job role are required" 
      });
    }

    const role = await JobRole.findOne({title: jobRole} || {_id: jobRole});

    if(role){
      const newJobPosition = await JobPosition.create({
        title,
        description,
        company,
        jobLink,
        companyWebsite,
        location,
        type,
        level,
        jobRole: role._id,
        salaryRange,
        equityOffered,
        bonusIncluded,
        contractDuration,
        responsibilities,
        requirements,
        preferredQualifications,
        benefits,
        applicationUrl,
        closingDate,
        status,
      });
      res.status(201).json({ success: true, message: "Job position in existing job role created successfully", newJobPosition });
    }
    else{
      const newRole = await JobRole.create({title: jobRole});
      const newJobPosition = await JobPosition.create({
        title,
        description,
        company,
        jobLink,
        companyWebsite,
        location,
        type,
        level,
        jobRole: newRole._id,
        salaryRange,
        equityOffered,
        bonusIncluded,
        contractDuration,
        responsibilities,
        requirements,
        preferredQualifications,
        benefits,
        applicationUrl,
        closingDate,
        status,
      });
      res.status(201).json({ success: true, message: "Job position and Job role created successfully", newJobPosition, newRole });
    }
    
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobPositions = async (req, res) => {
  try {
    const jobPositions = await JobPosition.find().populate('jobRole', 'title category');
    res.status(200).json({ success: true, jobPositions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobPosition = await JobPosition.findById(id).populate('jobRole', 'title category');
    
    if (!jobPosition) {
      return res.status(404).json({ 
        success: false, 
        message: "Job position not found" 
      });
    }
    
    res.status(200).json({ success: true, jobPosition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJobPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      company,
      jobLink,
      companyWebsite,
      location,
      type,
      level,
      jobRole,
      salaryRange,
      equityOffered,
      bonusIncluded,
      contractDuration,
      responsibilities,
      requirements,
      preferredQualifications,
      benefits,
      applicationUrl,
      closingDate,
      status,
    } = req.body;

    const jobPosition = await JobPosition.findByIdAndUpdate(
      id,
      {
        title,
        description,
        company,
        jobLink,
        companyWebsite,
        location,
        type,
        level,
        jobRole,
        salaryRange,
        equityOffered,
        bonusIncluded,
        contractDuration,
        responsibilities,
        requirements,
        preferredQualifications,
        benefits,
        applicationUrl,
        closingDate,
        status,
      },
      { new: true }
    ).populate('jobRole', 'title category');

    if (!jobPosition) {
      return res.status(404).json({ 
        success: false, 
        message: "Job position not found" 
      });
    }

    res.status(200).json({ success: true, jobPosition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteJobPosition = async (req, res) => {
  try {
    const { id } = req.params;

    const jobPosition = await JobPosition.findById(id);
    if (!jobPosition) {
      return res.status(404).json({ 
        success: false, 
        message: "Job position not found" 
      });
    }
    
    await jobPosition.deleteOne();
    res.status(200).json({ 
      success: true, 
      message: "Job position deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
