import { Collection } from "@ckeditor/ckeditor5-utils/src";
import { Model } from "@ckeditor/ckeditor5-ui/src";
import { useModule } from "@metascore-library/core/services/module-manager";
import InputTimecodeView from "./inputtimecodeview";

export function createLabeledInputTimecode(
  labeledFieldView,
  viewUid,
  statusUid
) {
  const inputView = new InputTimecodeView(labeledFieldView.locale);

  inputView.set({
    id: viewUid,
    ariaDescribedById: statusUid,
  });

  inputView
    .bind("isReadOnly")
    .to(labeledFieldView, "isEnabled", (value) => !value);
  inputView
    .bind("hasError")
    .to(labeledFieldView, "errorText", (value) => !!value);

  inputView.on("input", () => {
    // UX: Make the error text disappear and disable the error indicator as the user
    // starts fixing the errors.
    labeledFieldView.errorText = null;
  });

  labeledFieldView.bind("isEmpty", "isFocused", "placeholder").to(inputView);

  return inputView;
}

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

export function getComponentLabels(type) {
  const { getComponentsByType } = useModule("app_components");

  const labels = {};
  getComponentsByType(type).forEach((c) => {
    labels[c.id] = c.name;
  });
  return labels;
}

export function getToggleActionLabels(t) {
  return {
    show: t("Show"),
    hide: t("Hide"),
    toggle: t("Toggle"),
  };
}

export function getFullscreenActionLabels(t) {
  return {
    enter: t("Enter"),
    exit: t("Exit"),
    toggle: t("Toggle"),
  };
}

export function getDropdownDefinitions(labels, view) {
  const itemDefinitions = new Collection();

  for (const key in labels) {
    const definition = {
      type: "button",
      model: new Model({
        _value: key,
        label: labels[key],
        withText: true,
      }),
    };

    definition.model.bind("isOn").to(view, "type", (value) => {
      return value === key;
    });

    itemDefinitions.add(definition);
  }

  return itemDefinitions;
}