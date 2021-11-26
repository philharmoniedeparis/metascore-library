import {
  AbstractComponent,
  Scenario,
  Block,
} from "@/player/models/ComponentHierarchy";

export default function ({ database } = {}) {
  // Register models in ORM database
  database.register(AbstractComponent);
  database.register(Block);
  database.register(Scenario);

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
                id: "component-ikECn8trII",
                name: "Block 1",
                "pager-visibility": "visible",
                pages: [
                  {
                    type: "page",
                    id: "component-bBwuGf7KgU",
                  },
                  {
                    type: "page",
                    id: "component-myfiIS90PZ",
                  },
                ],
              },
              {
                type: "Block",
                id: "component-skECn8trII",
                name: "Block 2",
                "start-time": 2,
                "end-time": 10,
              },
            ],
          },
          {
            type: "Block",
            id: "component-akECn8trII",
            name: "Block 3",
          },
        ];
        Scenario.insert({ data });

        commit("setActiveScenario", "scenario-1");
      },
    },
  };
}
