// // testTensor.js
// import dotenv from "dotenv";
// import { RealtimeClient } from "@openai/realtime-api-beta";

// dotenv.config();

// const client = new RealtimeClient({
//   apiKey: process.env.TENSOR_API_KEY,
// });

// async function run() {
//   console.log("Connecting to TensorStudio...");
//   await client.connect();
//   await client.updateSession({
//     instructions: "You are a friendly interviewer.",
//     voice: "monica",
//     language: "en",
//   });

//   console.log("Connected to TensorStudio");

//   client.on("conversation.updated", ({ item, delta }) => {
//     if (item?.formatted?.text) {
//       console.log("AI says:", item.formatted.text);
//     }
//   });

//   client.sendUserMessageContent([
//     { type: "input_text", text: "Hello, can you introduce yourself?" },
//   ]);
// }

// run();
