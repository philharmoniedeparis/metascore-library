import axios from "axios";
import { omit, cloneDeep } from "lodash";

const defaults = {
  baseURL: "",
  headers: {},
  responseType: "json",
  responseEncoding: "utf8",
  withCredentials: true,
};

let instance = axios.create(defaults);

function setDefaults(values) {
  const options = {
    ...defaults,
    ...omit(values, ["headers"]),
  };

  if ("headers" in values) {
    options.headers = {
      common: values.headers,
    };
  }

  instance = axios.create(options);
}

function getDefaults() {
  return cloneDeep(instance.defaults);
}

async function load(url, { method = "get", ...config } = {}) {
  console.log(getDefaults());

  const response = await instance.request(url, {
    method,
    ...config,
  });

  return response.data;
}

export { setDefaults, getDefaults, load };
