const twilio = require("twilio");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Welcome to InterviewPrepAI! Your one-time verification code is ${otp}. This code will expire in 5 minutes. Don't share it with anyone.`,
      from: "+18566581375",
      to: phone,
    });
  } catch (error) {
    throw error;
  }
};

module.exports = sendSMS;
