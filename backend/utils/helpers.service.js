import pubClient, { io } from "../app.js";

const statusMessages = [
  "Hang tight! Your schema is coming together nicely…",
  "Our AI architects are busy crafting the perfect structure for your app.",
  "Turning your app ideas into a fully fleshed-out database… almost there!",
  "Building relationships, aligning fields, and optimizing everything behind the scenes.",
  "Fine-tuning the schema layout for maximum clarity and performance…",
  "Validating all components to make sure everything fits perfectly.",
  "Polishing your database blueprint to be production-ready…",
  "Optimizing for your chosen database so it’s smooth and efficient.",
  "Putting on the final touches to ensure everything is just right…",
  "Almost done! Your schema is looking fantastic.",
  "All set! Your complete, ready-to-use schema is prepared 🎉",
  "Final checks complete — your database architecture is ready for action!",
];

export const sendMessage = async (socket, index) => {
  index = index % statusMessages.length;
  const statusMessage = statusMessages[index];
  console.log(`emiting the msg ${statusMessage}`);

  io.to(socket).emit("statusUpdate", {
    message: statusMessage,
    isScroll: true,
    type: "status",
  });
};
export const sendMessage2 = async (socket, msg) => {
  console.log(`emiting the msg ${msg}`);
  io.to(socket).emit("statusUpdate", { message: msg, isScroll: false });
};
