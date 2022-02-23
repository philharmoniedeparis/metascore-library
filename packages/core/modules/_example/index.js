import ExampleComponent from "./components/ExampleComponent";

export default {
  name: "Example",
  dependencies: [],
  install({ app, store }) {
    // Add a module store
    const moduleStore = {
      namespaced: true,
      state: {},
      getters: {},
      mutations: {},
      actions: {},
    };
    store.registerModule("example", moduleStore);

    // Register a component globally
    app.component("ExampleComponent", ExampleComponent);
  },
};
