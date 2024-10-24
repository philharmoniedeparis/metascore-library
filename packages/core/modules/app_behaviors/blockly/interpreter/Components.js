import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { useModule } from "@core/services/module-manager";
import { watch } from "vue";
import AbstractInterpreter from "./AbstractInterpreter";

const SET_PROPERTY_OVERRIDES_KEY = "app_behaviors:set_property";
const SET_PROPERTY_OVERRIDES_PRIORITY = 100;

export default class Components extends AbstractInterpreter {
  constructor() {
    super();

    // Ensure context name does not conflict with variable names.
    JavaScript.addReservedWords("Components");

    this._unwatchActiveScenario = null;
  }

  get context() {
    const { activeScenario } = useModule("app_components");
    this._unwatchActiveScenario = watch(
      activeScenario,
      this._onScenarioChange.bind(this)
    );

    return {
      Components: {
        getProperty: (component, property) => {
          if (!component) return;

          const { getComponent } = useModule("app_components");
          const [type, id] = component.split(":");

          component = getComponent(type, id);
          if (!component) return;

          return component[property];
        },
        setProperty: (components, property, value) => {
          if (!components || !property) return;

          const { getComponent, setOverrides } = useModule("app_components");

          (Array.isArray(components) ? components : [components])
            .filter((component) => !!component)
            .forEach((component) => {
              const [type, id] = component.split(":");

              component = getComponent(type, id);
              if (!component) return;

              setOverrides(
                component,
                SET_PROPERTY_OVERRIDES_KEY,
                {
                  [property]: value,
                },
                SET_PROPERTY_OVERRIDES_PRIORITY
              );
            });
        },
        setScenario: (component) => {
          if (!component) return;

          const [type, id] = component.split(":");
          if (type !== "Scenario") return;

          const { setActiveScenario } = useModule("app_components");
          setActiveScenario(id);
        },
        getBlockPage: (component) => {
          if (!component) return;

          const [type, id] = component.split(":");
          if (type !== "Block") return;

          const { getComponent, getBlockActivePage } =
            useModule("app_components");

          const block = getComponent("Block", id);
          if (block) return getBlockActivePage(block) + 1;
        },
        setBlockPage: (component, index) => {
          if (!component) return;

          const [type, id] = component.split(":");
          if (type !== "Block") return;

          const { getComponent, setBlockActivePage } =
            useModule("app_components");

          const block = getComponent("Block", id);
          if (block) setBlockActivePage(block, index - 1);
        },
      },
    };
  }

  reset() {
    // Remove watcher.
    if (this._unwatchActiveScenario) {
      this._unwatchActiveScenario();
      this._unwatchActiveScenario = null;
    }
  }
}
