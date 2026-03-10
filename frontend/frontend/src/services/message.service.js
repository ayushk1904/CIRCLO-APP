import api from "./api";

/* ================= TEXT ================= */
export const getMessages = (circleId) => {
  return api.get(`/messages/circle/${circleId}`);
};

export const sendMessage = (circleId, content) => {
  return api.post(`/messages/circle/${circleId}`, { content });
};

/* ================= FILE / IMAGE ================= */
export const sendFileMessage = (circleId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(
    `/messages/circle/${circleId}/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};
