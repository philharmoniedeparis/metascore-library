import { merge, omit } from "lodash";
import { defineStore } from "pinia";

export default defineStore("ajax", {
  state: () => {
    return {
      defaults: {
        baseURL: document.location.origin,
        credentials: "same-origin",
        responseType: "json",
      },
    };
  },
  actions: {
    configure(configs) {
      this.defaults = merge({}, this.defaults, configs);
    },
    async decodeResponse(response, type = "json") {
      if (response.status === 204) return null;

      switch (type) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
          return await response[type]();
        default:
          return await response.text();
      }
    },
    async load(
      url,
      { method = "GET", params = {}, data = null, ...config } = {}
    ) {
      const options = merge({}, this.defaults, {
        method: method.toUpperCase(),
        ...config,
      });
      const responseType = options.responseType;

      const _url = new URL(url, options.baseURL);
      Object.entries(params).forEach(([key, value]) => {
        _url.searchParams.append(key, value);
      });

      if (data) {
        options.body = data;
      }

      const response = await fetch(
        _url.toString(),
        omit(options, ["baseURL", "data", "responseType"])
      );

      if (!response.ok) {
        let data = await this.decodeResponse(response, responseType);
        response.data = data;
        throw new Error(response, response.statusText);
      }

      if (options.method === "HEAD") return true;

      return await this.decodeResponse(response, responseType);
    },
  },
});
