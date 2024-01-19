import { watch } from "vue";
import { UnattachedFieldError } from "blockly/core";

/**
 * Update a dropdown field's options and value depending on an options ref.
 * @param {*} field The dropdown field
 * @param {*} optionsRef The options ref
 */
export function watchDrowpdownFieldOptions(field, optionsRef) {
  const block = field.getSourceBlock();
  if (!block) throw new UnattachedFieldError();

  const unwatch = watch(optionsRef, (newOptions) => {
    // Update the field's dropdown list and value when new options are available.
    const oldValue = field.getValue();
    const newOptionsIncludeOldValue =
      newOptions.find((option) => option[1] == oldValue) != undefined;
    const newValue = newOptionsIncludeOldValue ? oldValue : newOptions[0][1];
    field.getOptions(false);
    field.setValue(newValue);
  });

  const origDestroy = block.destroy;
  block.destroy = () => {
    if (typeof origDestroy === "function") origDestroy();
    unwatch();
  };
}
