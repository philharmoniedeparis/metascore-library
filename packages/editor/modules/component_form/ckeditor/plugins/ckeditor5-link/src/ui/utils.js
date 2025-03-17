import { Collection } from "@ckeditor/ckeditor5-utils";
import { ViewModel } from "@ckeditor/ckeditor5-ui";
import { useModule } from "@core/services/module-manager";
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
    toggle: t("Show/hide a block"),
    scenario: t("Scenario"),
    fullscreen: t("Fullscreen"),
    url: t("URL"),
  };
}

export function getComponentLabels(type) {
  const { getComponentsByType } = useModule("app_components");

  const labels = {};
  getComponentsByType(type).forEach((c) => {
    labels[type === "Scenario" ? c.slug : c.id] = c.name;
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

export function getDropdownDefinitions(labels) {
  const itemDefinitions = new Collection();

  Object.entries(labels).forEach(([key, label]) => {
    const definition = {
      type: "button",
      model: new ViewModel({
        _value: key,
        label: label,
        withText: true,
      }),
    };

    itemDefinitions.add(definition);
  });

  return itemDefinitions;
}
