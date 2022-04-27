import useStore from "./store";

export default {
  id: "ajax",
  install() {
    const { configure, load } = useStore();
    return {
      configure,
      head: (url, { params = {}, ...config } = {}) => {
        return load(url, { params, ...config, method: "HEAD" });
      },
      options: (url, { params = {}, ...config } = {}) => {
        return load(url, { params, ...config, method: "OPTIONS" });
      },
      get(url, { params = {}, ...config } = {}) {
        return load(url, { params, ...config, method: "GET" });
      },
      post: (url, { params = {}, data = null, ...config } = {}) => {
        return load(url, { params, data, ...config, method: "POST" });
      },
      put: (url, { params = {}, data = null, ...config } = {}) => {
        return load(url, { params, data, ...config, method: "PUT" });
      },
      patch: (url, { params = {}, data = null, ...config } = {}) => {
        return load(url, { params, data, ...config, method: "PATCH" });
      },
      delete: (url, { params = {}, data = null, ...config } = {}) => {
        return load(url, { params, data, ...config, method: "DELETE" });
      },
    };
  },
};
