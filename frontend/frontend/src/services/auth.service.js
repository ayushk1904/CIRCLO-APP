import API from "./api";

export const register = (data) => {
  return API.post("/auth/register", data);
};

export const login = (data) => {
  return API.post("/auth/login", data);
};

export const getMe = () => {
  return API.get("/auth/me");
};
