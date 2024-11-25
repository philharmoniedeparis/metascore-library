import { upperFirst } from "lodash-es";

export { default as AutomaticDecorators } from "./automaticdecorators";

/**
 * A keystroke used by the {@link module:link/linkui~LinkUI link UI feature}.
 */
export const TRIGGER_KEYSTROKE = "Ctrl+T";

/**
 * Returns `true` if a given view node is the link element.
 *
 * @param {module:engine/view/node~Node} node
 * @returns {Boolean}
 */
export function isLinkElement(node) {
  return (
    node.is("attributeElement") && !!node.getCustomProperty("behaviorTrigger")
  );
}

/**
 * Creates a behavior trigger with the provided `id` attribute.
 *
 * @param {String} id
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createBehaviorTriggerElement(id, { writer }) {
  // Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
  const behaviorTriggerElement = writer.createAttributeElement(
    "a",
    { "data-behavior-trigger": id },
    { priority: 5 }
  );
  writer.setCustomProperty("behaviorTrigger", true, behaviorTriggerElement);

  return behaviorTriggerElement;
}

/**
 * Converts an object with defined decorators to a normalized array of decorators. The `id` key is added for each decorator and
 * is used as the attribute's name in the model.
 *
 * @param {Object.<String, module:link/link~LinkDecoratorDefinition>} decorators
 * @returns {Array.<module:link/link~LinkDecoratorDefinition>}
 */
export function normalizeDecorators(decorators) {
  const retArray = [];

  if (decorators) {
    for (const [key, value] of Object.entries(decorators)) {
      const decorator = Object.assign({}, value, {
        id: `link${upperFirst(key)}`,
      });
      retArray.push(decorator);
    }
  }

  return retArray;
}

/**
 * Returns `true` if the specified `element` can be linked (the element allows the `behaviorTrigger` attribute).
 *
 * @params {module:engine/model/element~Element|null} element
 * @params {module:engine/model/schema~Schema} schema
 * @returns {Boolean}
 */
export function isTriggerableElement(element, schema) {
  if (!element) {
    return false;
  }

  return schema.checkAttribute(element.name, "behaviorTrigger");
}
