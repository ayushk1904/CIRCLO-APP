import api from "./api";

export const askAI = (message, circleId) => {
  return api.post("/ai/chat", { message, circleId });
};
