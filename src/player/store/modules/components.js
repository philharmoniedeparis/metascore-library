import * as component_models from "@/player/models/ComponentHierarchy";

export default function ({ database } = {}) {
  // Register models in ORM database
  Object.values(component_models).forEach((model) => {
    database.register(model);
  });

  return {
    namespaced: true,
    state: {
      activeScenario: null,
    },
    getters: {
      getScenarios: () => {
        return database.model("Scenario").query().withAllRecursive().get();
      },
    },
    mutations: {
      setActiveScenario(state, id) {
        state.activeScenario = id;
      },
    },
    actions: {
      async load({ commit }) {
        const data = [
          {
            type: "Scenario",
            id: "scenario-1",
            name: "Scénario 1",
            children: [
              {
                type: "Block",
                id: "component-1",
                name: "Block 1",
                "pager-visibility": "visible",
                pages: [
                  {
                    type: "page",
                    id: "component-2",
                  },
                  {
                    type: "page",
                    id: "component-3",
                  },
                ],
              },
              {
                type: "VideoRenderer",
                id: "component-5",
                name: "Video Renderer",
                "start-time": 0,
                "end-time": 20,
              },
              {
                type: "Block",
                id: "component-4",
                name: "Block 2",
                "start-time": 2,
                "end-time": 10,
              },
            ],
          },
        ];

        component_models.Scenario.insert({ data });

        commit("setActiveScenario", "scenario-1");
      },
    },
  };
}
