import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore, { type Options } from "./store";

export default class AjaxModule extends AbstractModule {
  static id = "ajax";

  configure(configs: Partial<Options>) {
    useStore().configure(configs);
  }

  head(url: string, config: Partial<Options> = {}) {
    return useStore().load(url, { ...config, method: "HEAD" });
  }

  options(url: string, config: Partial<Options> = {}) {
    return useStore().load(url, { ...config, method: "OPTIONS" });
  }

  get(url: string, config: Partial<Options> = {}) {
    return useStore().load(url, { ...config, method: "GET" });
  }

  post(url: string, config: Partial<Options> = {}) {
    return useStore().load(url, { ...config, method: "POST" });
  }

  put(url: string, config: Partial<Options> = {}) {
    return useStore().load(url, { ...config, method: "PUT" });
  }

  patch(url: string, config: Partial<Options> = {}) {
    return useStore().load(url, { ...config, method: "PATCH" });
  }

  delete(url: string, config: Partial<Options> = {}) {
    return useStore().load(url, { ...config, method: "DELETE" });
  }
}
