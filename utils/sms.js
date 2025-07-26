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
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });
        console.log(`OTP sent`);
        return true;
    } catch (error) {
        console.error("Failed:", error.message);
        return false;
    }
};

module.exports = sendSMS;
