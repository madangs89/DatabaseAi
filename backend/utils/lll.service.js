import { GoogleGenAI, Type } from "@google/genai";
export const ai = new GoogleGenAI({
  apiKey: "AIzaSyAlWQFfshR0bGzgXGvE2fs4QeU3__D42lg",
});

export const getConvKey = async (prompt) => {
  try {
    if (!prompt) {
      return null;
    }
    return true;
  } catch (error) {
    console.error(error);
  }
};
