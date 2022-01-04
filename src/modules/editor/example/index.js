import ExampleComponent from "./components/ExampleComponent";

export default function ({ app, router, store, eventBus }) {
  // Add a route
  router.addRoutes([
    {
      path: "/example",
      component: ExampleComponent,
    },
  ]);

  // Add a module store
  const moduleStore = {
    actions: {
      example() {
        eventBus.$emit.example();
      },
    },
  };
  store.registerModule("example", moduleStore);

  // Register a component globally
  app.component("example-component", ExampleComponent);
}
