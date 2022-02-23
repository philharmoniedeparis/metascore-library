import axios from "axios";

export async function load(
  url,
  { method = "get", data, params = {}, withCredentials = true } = {}
) {
  const response = await axios.request(url, {
    method,
    params,
    data,
    withCredentials,
  });

  return response.data;
}
