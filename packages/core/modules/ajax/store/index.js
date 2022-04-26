import { merge, omit } from "lodash";
import { defineStore } from "pinia";

export default defineStore("ajax", {
  state: () => {
    return {
      defaults: {
        baseURL: document.location.origin,
        headers: {},
        credentials: "same-origin",
        responseType: "json",
      },
    };
  },
  actions: {
    configure(configs) {
      this.defaults = {
        ...this.defaults,
        ...configs,
      };
    },
    async decodeResponse(response, type = "json") {
      switch (type) {
        case "arraybuffer":
        case "blob":
        case "formData":
        case "json":
          return await response[type]();
        default:
          return await response.text();
      }
    },
    load(url, { method = "get", params = {}, data = null, ...config } = {}) {
      const options = merge({}, this.defaults, { method, ...config });
      const responseType = options.responseType;

      const _url = new URL(url, options.baseURL);
      Object.entries(params).forEach(([key, value]) => {
        _url.searchParams.append(key, value);
      });

      if (data) {
        options.body = JSON.stringify(data);
      }

      return fetch(
        _url.toString(),
        omit(options, ["baseURL", "data", "responseType"])
      )
        .then(async (response) => {
          if (!response.ok) {
            let data = await this.decodeResponse(response, responseType);
            response.data = data;
            throw new Error(response, response.statusText);
          }
          return response;
        })
        .then(async (response) => {
          return await this.decodeResponse(response, responseType);
        });
    },
  },
});
