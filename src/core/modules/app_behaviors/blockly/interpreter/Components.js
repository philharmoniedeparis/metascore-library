import { useModule } from "@core/services/module-manager";
import AbstractInterpreter from "./AbstractInterpreter";

const SET_PROPERTY_OVERRIDES_KEY = "app_behaviors:set_property";
const SET_PROPERTY_OVERRIDES_PRIORITY = 100;

export default class Components extends AbstractInterpreter {
  get context() {
    return {
      getProperty: (component, property) => {
        if (!component) return;

        const { getComponent } = useModule("core:app_components");
        const [type, id] = component.split(":");

        component = getComponent(type, id);
        if (!component) return;

        return component[property];
      },
      setProperty: (components, property, value) => {
        if (!components || !property) return;

        const { getComponent, setOverrides } = useModule("core:app_components");

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

        const { setActiveScenario } = useModule("core:app_components");
        setActiveScenario(id);
      },
      getBlockPage: (component) => {
        if (!component) return;

        const [type, id] = component.split(":");
        if (type !== "Block") return;

        const { getComponent, getBlockActivePage } =
          useModule("core:app_components");

        const block = getComponent("Block", id);
        if (block) return getBlockActivePage(block) + 1;
      },
      setBlockPage: (component, index) => {
        if (!component) return;

        const [type, id] = component.split(":");
        if (type !== "Block") return;

        const { getComponent, setBlockActivePage } =
          useModule("core:app_components");

        const block = getComponent("Block", id);
        if (block) setBlockActivePage(block, index - 1);
      },
    };
  }
}
