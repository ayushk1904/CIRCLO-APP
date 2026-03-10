import API from "./api";

// CREATE
export const createCircle = (data) => {
  return API.post("/circles", data);
};

// GET MY CIRCLES
export const getMyCircles = () => {
  return API.get("/circles");
};

// GET SINGLE CIRCLE (✅ REQUIRED FOR CircleDetail)
export const getCircleById = (circleId) => {
  return API.get(`/circles/${circleId}`);
};

// UPDATE CIRCLE
export const updateCircle = (circleId, data) => {
  return API.put(`/circles/${circleId}`, data);
};

// DELETE CIRCLE
export const deleteCircle = (circleId) => {
  return API.delete(`/circles/${circleId}`);
};

// INVITE MEMBER
export const inviteMember = (circleId, email) => {
  return API.post(`/circles/${circleId}/invite`, { email });
};

// REMOVE MEMBER
export const removeMember = (circleId, userId) => {
  return API.delete(`/circles/${circleId}/members/${userId}`);
};

// LEAVE CIRCLE
export const leaveCircle = (circleId) => {
  return API.post(`/circles/${circleId}/leave`);
};

// PROMOTE / DEMOTE MEMBER
export const updateMemberRole = (circleId, userId, role) => {
  return API.put(`/circles/${circleId}/members/${userId}/role`, {
    role,
  });
};

export const getMyInvites = () => {
  return API.get("/circles/invites/me");
};

export const acceptInvite = (token) => {
  return API.post(`/circles/invite/${token}`);
};
