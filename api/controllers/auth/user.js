const User = require("../../models/user");

exports.UserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication

    // Fetch user details from the database
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
