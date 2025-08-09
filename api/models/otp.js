import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60,
  },
});

export default mongoose.model("OTP", OtpSchema);
