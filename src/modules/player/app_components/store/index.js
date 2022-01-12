import * as Components from "../models";

export default function ({ database } = {}) {
  // Register models in ORM database
  Object.values(Components).forEach((model) => {
    database.register(model);
  });

  return {
    namespaced: true,
    state: {
      activeScenario: null,
      toggledBlocks: [],
    },
    getters: {
      getScenarios: () => {
        return database.model("Scenario").query().withAllRecursive().get();
      },
      isBlockToggled: (state) => (id) => {
        return state.toggledBlocks.includes(id);
      },
    },
    mutations: {
      setActiveScenario(state, id) {
        state.activeScenario = id;
      },
      toggleBlock(state, id) {
        if (state.toggledBlocks.includes(id)) {
          state.toggledBlocks = state.toggledBlocks.filter((v) => v !== id);
        } else {
          state.toggledBlocks.push(id);
        }
      },
    },
    actions: {
      async load({ commit, dispatch }, data) {
        await dispatch("entities/deleteAll", null, { root: true });

        await Components.Scenario.insert({ data });

        const scenario = database.model("Scenario").query().first();
        commit("setActiveScenario", scenario.id);
      },
      async create(context, { type, data }) {
        return Components[type].insert({
          data,
        });
      },
      async update(context, { type, id, data }) {
        return Components[type].update({
          where: id,
          data,
        });
      },
      async delete(context, { type, id }) {
        return Components[type].delete(id);
      },
    },
  };
}
