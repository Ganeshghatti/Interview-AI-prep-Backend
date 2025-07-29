const JobPosition = require("../../models/job-positions");

exports.createJobPosition = async (req, res) => {
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

    const jobPosition = await JobPosition.create({
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
    });
    
    res.status(201).json({ success: true, jobPosition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobPositions = async (req, res) => {
  try {
    const jobPositions = await JobPosition.find().populate('jobRole', 'title category');
    res.status(200).json({ success: true, jobPositions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobPositionById = async (req, res) => {
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

exports.updateJobPosition = async (req, res) => {
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

exports.deleteJobPosition = async (req, res) => {
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
