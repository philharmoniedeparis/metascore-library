import axios from "axios";

const defaults = {
  baseURL: "",
  headers: {},
  responseType: "json",
  responseEncoding: "utf8",
  withCredentials: true,
};

let instance = axios.create(defaults);

function setDefaults(values) {
  instance = axios.create({
    ...defaults,
    ...values,
  });
}

async function load(url, { method = "get", ...config } = {}) {
  const response = await instance.request(url, {
    method,
    ...config,
  });

  return response.data;
}

export { setDefaults, load };
