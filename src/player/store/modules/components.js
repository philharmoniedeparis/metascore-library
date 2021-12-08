import * as Components from "../../../core/models/ComponentHierarchy";

export default function ({ database } = {}) {
  // Register models in ORM database
  Object.values(Components).forEach((model) => {
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
      toggleBlock(state, id) {
        const component = Components.Block.find(id);
        component.$update({
          $toggled: !component.$toggled,
        });
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
                dimension: [200, 200],
                src: "http://localhost:8080/assets/animation.json",
                opacity: 0.5,
              },
              {
                type: "Block",
                id: "block-1",
                name: "Block 1",
                "background-color": "#000",
                "pager-visibility": "visible",
                pages: [
                  {
                    type: "Page",
                    id: "page-1",
                    children: [
                      {
                        type: "Animation",
                        id: "animation-2",
                        name: "Animation",
                        position: [0, 0],
                        dimension: [100, 100],
                        src: "http://localhost:8080/assets/animation.json",
                        opacity: 0.5,
                      },
                    ],
                  },
                  {
                    type: "Page",
                    id: "page-2",
                    children: [],
                  },
                ],
                "start-time": 1,
                "end-time": 10,
                position: [200, 0],
                dimension: [200, 200],
                translate: [[0, [0, 0]]],
              },
              {
                type: "Block",
                id: "block-2",
                name: "Block 2 (synched)",
                "pager-visibility": "visible",
                synched: true,
                pages: [
                  {
                    type: "Page",
                    id: "page-3",
                    "background-color": "#FF0000",
                    "end-time": 1,
                    children: [
                      {
                        type: "Content",
                        id: "page-content-1",
                        name: "Content",
                        text: "<p>Page 1</p>",
                        position: [40, 40],
                        dimension: [100, 100],
                      },
                    ],
                  },
                  {
                    type: "Page",
                    id: "page-4",
                    "background-color": "#00FF00",
                    "start-time": 1,
                    children: [
                      {
                        type: "Content",
                        id: "page-content-2",
                        name: "Content",
                        text: "<p>Page 2</p>",
                        position: [40, 40],
                        dimension: [100, 100],
                      },
                    ],
                  },
                ],
                position: [400, 0],
                dimension: [200, 200],
                translate: [[0, [0, 0]]],
              },
              {
                type: "BlockToggler",
                id: "blocktoggler-1",
                name: "Block Toggler",
                position: [600, 0],
                dimension: [200, 200],
                blocks: ["block-2", "block-1"],
              },
              {
                type: "Content",
                id: "content-1",
                name: "Content",
                text: "<p>This is a test content</p>",
                position: [0, 200],
                dimension: [200, 200],
              },
              {
                type: "Controller",
                id: "controller-1",
                name: "Controller",
                position: [200, 200],
                dimension: [200, 200],
              },
              {
                type: "Cursor",
                id: "cursor-1",
                name: "Cursor",
                position: [400, 200],
                dimension: [200, 200],
                direction: "right",
              },
              {
                type: "Media",
                id: "media-1",
                name: "Media",
                position: [0, 400],
                dimension: [200, 200],
                src: "https://metascore.philharmoniedeparis.fr/sites/default/files/uploads/media/video/EX2279.mp4",
              },
              {
                type: "SVG",
                id: "svg-1",
                name: "SVG",
                position: [200, 400],
                dimension: [200, 200],
                src: "http://localhost:8080/assets/sample.svg",
                colors: ["#0000FF"],
              },
              {
                type: "VideoRenderer",
                id: "videorenderer-1",
                name: "Video Renderer",
                position: [400, 400],
              },
            ],
          },
        ];

        Components.Scenario.insert({ data });

        commit("setActiveScenario", "scenario-1");

        setTimeout(() => {
          console.log("setTimeout");
          Components.AbstractComponent.update({
            where: "component-1",
            data: {
              name: "New name",
              position: [0, 0],
              "background-color": "#0000FF",
            },
          });

          Components.AbstractComponent.update({
            where: "cursor-1",
            data: {
              dimension: [50, 100],
            },
          });

          Components.AbstractComponent.update({
            where: "svg-1",
            data: {
              stroke: "#FF0000",
              "stroke-width": 2,
            },
          });
        }, 2000);
      },
    },
  };
}
