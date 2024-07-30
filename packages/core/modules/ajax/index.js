import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore from "./store";

export default class AjaxModule extends AbstractModule {
  static id = "ajax";

  configure(configs) {
    useStore().configure(configs);
  }

  head(url, { params = {}, ...config } = {}) {
    return useStore().load(url, { params, ...config, method: "HEAD" });
  }

  options(url, { params = {}, ...config } = {}) {
    return useStore().load(url, { params, ...config, method: "OPTIONS" });
  }

  get(url, { params = {}, ...config } = {}) {
    return useStore().load(url, { params, ...config, method: "GET" });
  }

  post(url, { params = {}, data = null, ...config } = {}) {
    return useStore().load(url, { params, data, ...config, method: "POST" });
  }

  put(url, { params = {}, data = null, ...config } = {}) {
    return useStore().load(url, { params, data, ...config, method: "PUT" });
  }

  patch(url, { params = {}, data = null, ...config } = {}) {
    return useStore().load(url, { params, data, ...config, method: "PATCH" });
  }

  delete(url, { params = {}, data = null, ...config } = {}) {
    return useStore().load(url, { params, data, ...config, method: "DELETE" });
  }
}
