import { createStore as createVuexStore, createLogger } from "vuex";
import { load } from "@metascore-library/core/utils/ajax";
import { useStore } from "@metascore-library/core/module-manager";

export function createStore({ debug = false } = {}) {
  const plugins = [];

  if (debug) {
    plugins.push(createLogger());
  }

  return createVuexStore({
    plugins,
    modules: {},
    state: {},
    mutations: {},
    actions: {
      async load(context, url) {
        const mediaStore = useStore("media");
        const componentsStore = useStore("components");
        const appRendererStore = useStore("app-renderer");

        const data = await load(url);

        mediaStore.source = data.media;

        componentsStore.init(data.components);

        appRendererStore.width = data.width;
        appRendererStore.height = data.height;
        appRendererStore.css = data.css;
        appRendererStore.ready = true;
      },
    },
  });
}
