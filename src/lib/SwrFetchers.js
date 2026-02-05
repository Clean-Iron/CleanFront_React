import { api } from "./ApiClient";

export const fetcherAuth = async (url) => {
  const res = await api.get(url);
  return res.data;
};
