import User from "../../models/user.js";

export const UserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };

    delete updateData.email;
    delete updateData.createdAt;
    delete updateData.profileCompletion;
    delete updateData.isProfileComplete;
    delete updateData._id;
    delete updateData.__v;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    Object.assign(user, updateData);
    
    if (updateData.skills) user.markModified('skills');
    if (updateData.education) user.markModified('education');
    if (updateData.address) user.markModified('address');
    if (updateData.experience) user.markModified('experience');
    if (updateData.preferredJobRoles) user.markModified('preferredJobRoles');
    if (updateData.preferredLocation) user.markModified('preferredLocation');

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      success: true, 
      msg: "Profile updated successfully", 
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ success: true, msg: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};


