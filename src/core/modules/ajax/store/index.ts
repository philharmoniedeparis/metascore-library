import { merge, omit } from "lodash";
import { defineStore } from "pinia";

export interface Options extends RequestInit {
  baseURL: string
  responseType: string
  data?: BodyInit | null
  params?: {[key: string]: string}
}

export default defineStore("ajax", {
  state: () => {
    return {
      defaults: {
        baseURL: document.location.origin,
        credentials: "same-origin",
        responseType: "json",
      } as Options,
    };
  },
  actions: {
    configure(configs: Partial<Options>) {
      this.defaults = merge({}, this.defaults, configs);
    },
    async decodeResponse(response: Response, type = "json") {
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
      url: string,
      { method = "GET", params = {}, data = null, ...config }: Partial<Options> = {}
    ) {
      const options = merge({}, this.defaults, {
        method: method.toUpperCase(),
        ...config,
      });
      const responseType = options.responseType;
      const _url = new URL(url, options.baseURL);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          _url.searchParams.append(key, value);
        });
      }

      if (data) {
        options.body = data;
      }

      const response = await fetch(
        _url.toString(),
        omit(options, ["baseURL", "data", "responseType"])
      );

      if (!response?.ok) {
        throw new Error(response.statusText);
      }

      return (options.method === "HEAD") ? true : await this.decodeResponse(response, responseType);
    },
  },
});
