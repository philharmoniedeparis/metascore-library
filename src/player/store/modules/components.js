import {
  AbstractComponent,
  Scenario,
  Block,
} from "@/player/models/ComponentHierarchy";

export default function ({ database } = {}) {
  database.register(AbstractComponent);
  database.register(Block);
  database.register(Scenario);

  return {
    namespaced: true,
    state: {},
    getters: {
      getScenarios: () => {
        return database.model("Scenario").query().withAllRecursive().get();
      },
    },
    mutations: {},
    actions: {
      async load() {
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
              },
              {
                type: "Block",
                id: "component-skECn8trII",
                name: "Block 2",
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
      },
    },
  };
}
