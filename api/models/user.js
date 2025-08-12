const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({ 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false},

  //Personal Information
  name: { type: String, required: true },
  dateOfBirth: {type: Date, required: false},
  gender: {type: String, enum:['male', 'female', 'other'], required: false},

  //Contact Information
  phone: { type: String, required: false, unique: true, sparse: true }, // since phone is not required, we use sparse: true to avoid unique constraint error
  address: {
    street: {type: String, required: false},
    city: {type: String, required: false},
    state: {type: String, required: false},
    country: {type: String, required: false},
    zipCode: {type: String, required: false}
  },

  //Professional Information
  currentRole: {type: String, required: false},
  currentCompany: {type: String, required: false},
  experience: [{
    jobTitle: {type: String, required: false},
    company: {type: String, required: false},
    location: {type: String, required: false},
    employmentType: {type: String, required: false},
    startDate: {type: Date, required: false},
    endDate: {type: Date, required: false},
    current: {type: Boolean, required: false},
  }],
  skills: {type: [String], required: false},

  //Education
  education: [{
    degree: {type: String, required: false},
    field: {type: String, required: false},
    institution: {type: String, required: false},
    graduationYear: {type: Number, required: false},
    gpa: {type: Number, required: false}
  }],

  //Career Goals
  careerObjective: {type: String, required: false},
  preferredJobRoles: {type: [String], required: false},
  preferredLocation: {type: [String], required: false},
  salaryExpectation: {type: Number, required: false},

  //Social Profiles
  linkedinProfile: {type: String, required: false},
  githubProfile: {type: String, required: false},
  portfolio: {type: String, required: false},

  //Profile Status
  profileCompletion: {type: Number, default: 0, min: 0, max: 100}, //percentage
  isProfileComplete: {type: Boolean, default: false}, //true if profile is complete, false if not



  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  //calculate profile completion percentage
  const totalFields = 18;
  let completedFields = 0;

  if(this.name) completedFields++;
  if(this.email) completedFields++;

  if(this.dateOfBirth) completedFields++;
  if(this.gender) completedFields++;

  if(this.phone) completedFields++;
  // Fix: Check if address has meaningful content
  if(this.address && (this.address.street || this.address.city || this.address.state || this.address.country)) completedFields++;

  if(this.currentRole) completedFields++;
  if(this.currentCompany) completedFields++;
  if(this.experience && this.experience.length > 0) completedFields++;
  if(this.skills && this.skills.length > 0) completedFields++;

  if(this.education && this.education.length > 0) completedFields++;

  if(this.careerObjective) completedFields++;
  if(this.preferredJobRoles && this.preferredJobRoles.length > 0) completedFields++;
  if(this.preferredLocation && this.preferredLocation.length > 0) completedFields++;
  if(this.salaryExpectation) completedFields++;

  if(this.linkedinProfile) completedFields++;
  if(this.githubProfile) completedFields++;
  if(this.portfolio) completedFields++;

  this.profileCompletion = Math.round((completedFields / totalFields) * 100);
  this.isProfileComplete = this.profileCompletion === 100; // Changed from === 100 to >= 80

  next();
});


module.exports = mongoose.model("User", UserSchema);