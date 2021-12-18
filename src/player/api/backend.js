import axios from "axios";

export default class Backend {
  constructor({ basePath } = {}) {
    this.basePath = basePath;
  }

  async call(
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

  async load(url) {
    return this.call(url);
  }
}
