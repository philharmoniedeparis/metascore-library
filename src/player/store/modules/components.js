import * as component_models from "../../../core/models/ComponentHierarchy";

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
                type: "Animation",
                id: "animation-1",
                name: "Animation",
                position: [0, 0],
                dimension: [100, 100],
                src: "http://localhost:8080/assets/animation.json",
              },
              {
                type: "Block",
                id: "block-1",
                name: "Block 1",
                "background-color": "#000",
                "pager-visibility": "visible",
                pages: [
                  {
                    type: "page",
                    id: "page-1",
                  },
                  {
                    type: "page",
                    id: "page-2",
                  },
                ],
                "start-time": 1,
                "end-time": 10,
                position: [100, 0],
                dimension: [100, 100],
                translate: [[0, [0, 0]]],
              },
              {
                type: "BlockToggler",
                id: "blocktoggler-1",
                name: "Block Toggler",
                position: [200, 0],
                dimension: [100, 100],
              },
              {
                type: "Content",
                id: "content-1",
                name: "Content",
                text: "<p>This is a test content</p>",
                position: [0, 100],
                dimension: [100, 100],
              },
              {
                type: "Controller",
                id: "controller-1",
                name: "Controller",
                position: [100, 100],
                dimension: [100, 100],
              },
              {
                type: "Cursor",
                id: "cursor-1",
                name: "Cursor",
                position: [200, 100],
                dimension: [100, 100],
                direction: "right",
              },
              {
                type: "Media",
                id: "media-1",
                name: "Media",
                position: [0, 200],
                dimension: [100, 100],
                src: "https://metascore.philharmoniedeparis.fr/sites/default/files/uploads/media/video/EX2279.mp4",
              },
              {
                type: "SVG",
                id: "svg-1",
                name: "SVG",
                position: [100, 200],
                dimension: [100, 100],
                src: "https://metascore.philharmoniedeparis.fr/sites/default/files/uploads/media/svg/15.accordeon.svg",
              },
              {
                type: "VideoRenderer",
                id: "videorenderer-1",
                name: "Video Renderer",
                position: [20, 200],
                dimension: [100, 100],
              },
            ],
          },
        ];

        component_models.Scenario.insert({ data });

        commit("setActiveScenario", "scenario-1");

        setTimeout(() => {
          console.log("setTimeout");
          component_models.AbstractComponent.update({
            where: "component-1",
            data: {
              name: "New name",
              position: [0, 0],
              "background-color": "#0000FF",
            },
          });
        }, 2000);
      },
    },
  };
}
