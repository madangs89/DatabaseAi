import pubClient, { io } from "../app.js";

const statusMessages = [
  // Initial steps
  "👋 Welcome! We're starting to design your database schema.",
  "🔍 Analyzing your requirements to ensure every detail is covered.",
  "🗂️ Mapping out tables and fields for seamless data flow.",
  "🔗 Identifying key entities and their relationships.",
  "🛡️ Ensuring referential integrity for robust connections.",
  // Progress updates
  "⚙️ Building relationships, aligning fields, and optimizing everything behind the scenes.",
  "🚀 Reviewing indexes for faster queries and performance.",
  "🔎 Checking for potential bottlenecks and optimizing accordingly.",
  "💡 Applying best practices for scalability and security.",
  "📝 Integrating feedback to refine your schema design.",
  // Validation and optimization
  "✅ Validating all components to make sure everything fits perfectly.",
  "🔄 Testing schema compatibility with your chosen tech stack.",
  "🧩 Optimizing for your chosen database so it’s smooth and efficient.",
  "🎯 Fine-tuning the schema layout for maximum clarity and performance…",
  "✨ Polishing your database blueprint to be production-ready…",
  // Finalization
  "📦 Preparing migration scripts for smooth deployment.",
  "🖌️ Putting on the final touches to ensure everything is just right…",
  "🔔 Final checks complete — your database architecture is ready for action!",
  "🌱 Your database schema is now future-proof and ready to grow with your app.",
  "⏳ Almost done! Your schema is looking fantastic.",
  // Completion
  "🎉 All set! Your complete, ready-to-use schema is prepared!",
  "✅ Your schema is ready! You can now integrate it into your project.",
  "📤 Exporting your schema for easy access and implementation.",
  "🙏 Thank you for your patience! Your database is now ready to use.",
  "🛠️ If you need further customization, you can always update your schema later.",
];

export const sendMessage = async (socket, index, projectId) => {
  index = index % statusMessages.length;
  const statusMessage = statusMessages[index];
  console.log(`emiting the msg ${statusMessage}`);

  io.to(socket).emit("statusUpdate", {
    message: statusMessage,
    isScroll: true,
    projectId,
    type: "status",
  });
};
export const sendMessage2 = async (socket, msg, projectId, type) => {
  console.log(`emiting the msg ${msg}`);

  if (type) {
    io.to(socket).emit("statusUpdate", {
      message: msg,
      projectId,
      isScroll: false,
      type: "error",
    });
  } else {
    io.to(socket).emit("statusUpdate", {
      message: msg,
      projectId,
      isScroll: false,
    });
  }
};
