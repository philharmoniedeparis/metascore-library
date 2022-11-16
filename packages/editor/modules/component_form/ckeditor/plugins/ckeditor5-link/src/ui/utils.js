import { Collection } from "@ckeditor/ckeditor5-utils/src";
import { Model } from "@ckeditor/ckeditor5-ui/src";
import { useModule } from "@metascore-library/core/services/module-manager";

export function getTypeLabels(t) {
  return {
    play: t("Play"),
    pause: t("Pause"),
    stop: t("Stop"),
    seek: t("Seek"),
    page: t("Page"),
    toggle: t("Toggle"),
    scenario: t("Scenario"),
    fullscreen: t("Fullscreen"),
    url: t("URL"),
  };
}

export function getTypeDefinitions(view) {
  const itemDefinitions = new Collection();
  const typeLabels = getTypeLabels(view.t);

  for (const type in typeLabels) {
    const definition = {
      type: "button",
      model: new Model({
        _typeValue: type,
        label: typeLabels[type],
        withText: true,
      }),
    };

    definition.model.bind("isOn").to(view, "type", (value) => {
      return value === type;
    });

    itemDefinitions.add(definition);
  }

  return itemDefinitions;
}

export function getScenarioLabels() {
  const { getComponentsByType } = useModule("app_components");

  const labels = {};
  getComponentsByType("Scenario").forEach((scenario) => {
    labels[scenario.id] = scenario.name;
  });
  return labels;
}

export function getScenarioDefinitions(view) {
  const itemDefinitions = new Collection();
  const scenarioLabels = getScenarioLabels();

  for (const id in scenarioLabels) {
    const definition = {
      type: "button",
      model: new Model({
        _scenarioId: id,
        label: scenarioLabels[id],
        withText: true,
      }),
    };

    definition.model.bind("isOn").to(view, "type", (value) => {
      return value === id;
    });

    itemDefinitions.add(definition);
  }

  return itemDefinitions;
}
