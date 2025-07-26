const twilio = require("twilio");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: "+18566581375",
      to: phone,
    });
  } catch (error) {
    throw error;
  }
};

module.exports = sendSMS;
