import {
  defineBlocksWithJsonArray,
  Extensions,
  FieldDropdown,
  Msg,
} from "blockly/core";
import { isFunction } from "lodash";
import FieldEnhancedDropdown from "../fields/field_enhanced_dropdown";
import { useModule } from "@metascore-library/core/services/module-manager";

defineBlocksWithJsonArray([
  // Click.
  {
    type: "components_click",
    message0: "%{BKY_COMPONENTS_CLICK}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
    ],
    message1: "%{BKY_COMPONENTS_CLICK_THEN}",
    args1: [
      {
        type: "input_statement",
        name: "STATEMENT",
      },
    ],
    extensions: ["components_component_options"],
    inputsInline: true,
    style: "trigger_blocks",
    tooltip: "%{BKY_COMPONENTS_CLICK_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_CLICK_HELPURL}",
  },
  // Set scenario.
  {
    type: "components_set_scenario",
    message0: "%{BKY_COMPONENTS_SET_SCENARIO}",
    args0: [
      {
        type: "input_dummy",
        name: "SCENARIO_INPUT",
      },
    ],
    extensions: ["components_scenario_options"],
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SET_SCENARIO_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SET_SCENARIO_HELPURL}",
  },
  // Get property.
  {
    type: "components_get_property",
    message0: "%{BKY_COMPONENTS_GET_PROPERTY}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
      {
        type: "input_dummy",
        name: "PROPERTY",
      },
    ],
    extensions: ["components_component_options"],
    mutator: "components_property_options_mutator",
    inputsInline: true,
    output: null,
    style: "component_blocks",
    tooltip: "%{BKY_COMPONENTS_GET_PROPERTY_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_GET_PROPERTY_HELPURL}",
  },
  // Set property.
  {
    type: "components_set_property",
    message0: "%{BKY_COMPONENTS_SET_PROPERTY}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
      {
        type: "input_dummy",
        name: "PROPERTY",
      },
      {
        type: "input_value",
        name: "VALUE",
      },
    ],
    extensions: ["components_component_options"],
    mutator: "components_property_options_mutator",
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SET_PROPERTY_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SET_PROPERTY_HELPURL}",
  },
  // Show.
  {
    type: "components_show",
    message0: "%{BKY_COMPONENTS_SHOW}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
    ],
    extensions: ["components_component_options"],
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SHOW_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SHOW_HELPURL}",
  },
  // Hide.
  {
    type: "components_hide",
    message0: "%{BKY_COMPONENTS_HIDE}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
    ],
    extensions: ["components_component_options"],
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_HIDE_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_HIDE_HELPURL}",
  },
  // Get background.
  {
    type: "components_get_background",
    message0: "%{BKY_COMPONENTS_GET_BACKGROUND}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
    ],
    extensions: ["components_component_options"],
    output: "Colour",
    style: "component_blocks",
    tooltip: "%{BKY_COMPONENTS_GET_BACKGROUND_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_GET_BACKGROUND_HELPURL}",
  },
  // Set background.
  {
    type: "components_set_background",
    message0: "%{BKY_COMPONENTS_SET_BACKGROUND}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
      {
        type: "input_value",
        name: "VALUE",
      },
    ],
    extensions: ["components_component_options"],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SET_BACKGROUND_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SET_BACKGROUND_HELPURL}",
  },
  // Get text.
  {
    type: "components_get_text",
    message0: "%{BKY_COMPONENTS_GET_TEXT}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
    ],
    extensions: ["components_component_options"],
    output: "String",
    style: "component_blocks",
    tooltip: "%{BKY_COMPONENTS_GET_TEXT_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_GET_TEXT_HELPURL}",
  },
  // Set text.
  {
    type: "components_set_text",
    message0: "%{BKY_COMPONENTS_SET_TEXT}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
      {
        type: "input_value",
        name: "VALUE",
      },
    ],
    extensions: ["components_component_options"],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SET_TEXT_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SET_TEXT_HELPURL}",
  },
]);

function getScenarioOptions() {
  const { getComponentsByType } = useModule("app_components");
  let options = [];

  const components = getComponentsByType("Scenario");

  if (components.length > 0) {
    components.forEach((c) => {
      options.push([c.name || "untitled", c.id]);
    });
  }

  return options;
}

function getComponentOptions(alter_hook, components = null, prefix = "") {
  const { getComponentsByType, getComponentChildren } =
    useModule("app_components");
  let options = [];

  if (components === null) {
    components = getComponentsByType("Scenario");
  }

  if (components.length > 0) {
    components.forEach((c) => {
      const name = c.name || "untitled";
      const option = [{ label: `${prefix} ${name}` }, `${c.type}:${c.id}`];

      if (alter_hook && isFunction(alter_hook)) {
        alter_hook(option, c);
      }

      options.push(option);

      const children = getComponentChildren(c);
      options = [
        ...options,
        ...getComponentOptions(alter_hook, children, `—${prefix}`),
      ];
    });
  }

  return options;
}

Extensions.register("components_scenario_options", function () {
  const scenario_input = this.getInput("SCENARIO_INPUT");

  if (!scenario_input) return;

  scenario_input.appendField(
    new FieldEnhancedDropdown(getScenarioOptions),
    "SCENARIO"
  );
});

const SUPPORTED_PROPERTIES = {
  Animation: [
    "background-color",
    //"background-image",
    "border-color",
    //"border-radius",
    "border-width",
    //"dimension",
    "hidden",
    //"opacity",
    //"position",
    "loop-duration",
    "reversed",
  ],
  Block: [
    "background-color",
    //"background-image",
    "border-color",
    //"border-radius",
    "border-width",
    //"dimension",
    "hidden",
    //"opacity",
    //"position",
    //"pager-visibility",
  ],
  BlockToggler: [
    "background-color",
    //"background-image",
    "border-color",
    //"border-radius",
    "border-width",
    //"dimension",
    "hidden",
    //"opacity",
    //"position",
  ],
  Content: [
    "background-color",
    //"background-image",
    "border-color",
    //"border-radius",
    "border-width",
    //"dimension",
    "hidden",
    //"opacity",
    //"position",
    "text",
  ],
  Cursor: [
    "background-color",
    //"background-image",
    "border-color",
    //"border-radius",
    "border-width",
    //"dimension",
    "hidden",
    //"opacity",
    //"position",
    "cursor-width",
    "cursor-color",
  ],
  Media: [
    "background-color",
    //"background-image",
    "border-color",
    //"border-radius",
    "border-width",
    //"dimension",
    "hidden",
    //"opacity",
    //"position",
  ],
  Page: ["background-color", "background-image"],
  Scenario: ["background-color", "background-image"],
  SVG: [
    "background-color",
    //"background-image",
    "border-color",
    //"border-radius",
    "border-width",
    //"dimension",
    "hidden",
    //"opacity",
    //"position",
  ],
  VideoRenderer: [
    "background-color",
    //"background-image",
    "border-color",
    //"border-radius",
    "border-width",
    //"dimension",
    "hidden",
    //"opacity",
    //"position",
  ],
};

Extensions.register("components_component_options", function () {
  const component_input = this.getInput("COMPONENT");
  if (!component_input) return;

  const property_input = this.getInput("PROPERTY");

  const component_field = new FieldEnhancedDropdown(function () {
    if (property_input) {
      return getComponentOptions((option, c) => {
        if (
          !(c.type in SUPPORTED_PROPERTIES) ||
          SUPPORTED_PROPERTIES[c.type].length === 0
        ) {
          option[0].disabled = true;
        }
      });
    }

    return getComponentOptions((option, c) => {
      if (c.type === "Scenario") {
        option[0].disabled = true;
      }
    });
  });
  component_input.appendField(component_field, "COMPONENT");
});

/**
 * Mutator methods added to media_play_excerpt block.
 * @mixin
 * @augments Block
 * @readonly
 */
const COMPONENTS_COMPONENT_OPTIONS_MUTATOR_MIXIN = {
  property_: null,

  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {?{elseIfCount: (number|undefined), haseElse: (boolean|undefined)}}
   *     The state of this block.
   */
  saveExtraState: function () {
    const property_input = this.getInput("PROPERTY");
    if (property_input) {
      return {
        property: this.getFieldValue("PROPERTY"),
      };
    }

    return null;
  },

  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block.
   */
  loadExtraState: function (state) {
    const property_input = this.getInput("PROPERTY");
    if (property_input) {
      this.property_ = state["property"];
      this.updateShape_();
    }
  },

  /**
   * Callback to use whenever the block's parent workspace changes.
   * @param {object} evt The event.
   */
  onchange: function (evt) {
    if (evt.type === "create") {
      // Update the block.
      this.updateShape_();
    }
  },

  /**
   * Modify this block to have the correct number of inputs.
   * @this {Block}
   * @private
   */
  updateShape_: function () {
    const property_input = this.getInput("PROPERTY");
    if (!property_input) return;

    this.updatePropertyField_();

    const component_field = this.getField("COMPONENT");
    if (component_field) {
      component_field.setValidator((newValue) => {
        const newType = this.getComponentType_(newValue);
        const oldType = this.getComponentType_();

        // Type didn't change, skip update.
        if (newType === oldType) return;

        this.updatePropertyField_(newValue);
      });
    }
  },

  /**
   * Parse the component type from a COMPONENT field value.
   * @param {string?} component_value The value to parse, the current field value is used if null.
   * @returns {string?} The component id or null if the value counldn't be parsed.
   */
  getComponentType_: function (component_value) {
    if (typeof component_value === "undefined") {
      component_value = this.getFieldValue("COMPONENT");
    }

    if (!component_value) return null;

    const [type] = component_value.split(":");
    return type;
  },

  /**
   * Get the options array for the PROPERTY field.
   * @param {string} component_type The component type.
   * @returns {array} The options.
   */
  getPropertyOptions_: function (component_type) {
    const { getModel } = useModule("app_components");

    return Object.keys(getModel(component_type).properties)
      .filter((property) => {
        return (
          component_type in SUPPORTED_PROPERTIES &&
          SUPPORTED_PROPERTIES[component_type].includes(property)
        );
      })
      .map((property) => {
        return [Msg.COMPONENTS_PROPERTY[property], property];
      });
  },

  /**
   * Get the compatible value type or list of value types for the VALUE input.
   * @param {string} component_type The component type.
   * @param {string} property_name The property's name.
   * @returns {string|array<string>|null} The type check.
   */
  getPropertyValueTypeCheck_: function (component_type, property_name) {
    const { getModel } = useModule("app_components");
    const property = getModel(component_type).properties?.[property_name];

    if (property) {
      const format = property.format;
      switch (format) {
        case "color":
          return "Colour";
      }

      const type = Array.isArray(property.type)
        ? property.type.find((t) => t !== "null")
        : property.type;

      switch (type) {
        case "boolean":
          return "Boolean";
        case "number":
        case "integer":
          return "Number";
        case "string":
          return "String";
      }
    }

    return null;
  },

  /**
   * Update the PROPERTY field.
   * @param {string?} component_value The COMPONENT field value.
   */
  updatePropertyField_: function (component_value) {
    const component_input = this.getInput("COMPONENT");
    if (!component_input) return;

    const component_field = this.getField("COMPONENT");
    if (!component_field) return;

    const property_input = this.getInput("PROPERTY");
    if (!property_input) return;

    let property_field = this.getField("PROPERTY");
    if (property_field) {
      // Type changed, remove field.
      property_input.removeField("PROPERTY", true);
    }

    const component_type = this.getComponentType_(component_value);
    property_field = new FieldDropdown(() => {
      return this.getPropertyOptions_(component_type);
    });
    property_field.setValue(this.property_);
    property_input.appendField(property_field, "PROPERTY");

    this.updateValueField_();
    this.updateOutputCheck_();

    property_field.setValidator((newValue) => {
      this.property_ = newValue;
      this.updateValueField_(newValue);
      this.updateOutputCheck_(newValue);
    });
  },

  /**
   * Update the VALUE field.
   * @param {string?} property_value The PROPERTY field value.
   */
  updateValueField_(property_value) {
    const value_input = this.getInput("VALUE");
    if (!value_input) return;

    if (typeof property_value === "undefined") {
      property_value = this.getFieldValue("PROPERTY");
    }

    const component_type = this.getComponentType_();

    value_input.setCheck(
      this.getPropertyValueTypeCheck_(component_type, property_value)
    );
  },

  /**
   * Update the output check if the block has an output.
   * @param {string?} property_value The PROPERTY field value.
   */
  updateOutputCheck_(property_value) {
    if (!this.outputConnection) return;

    if (typeof property_value === "undefined") {
      property_value = this.getFieldValue("PROPERTY");
    }

    const component_type = this.getComponentType_();

    this.outputConnection.setCheck(
      this.getPropertyValueTypeCheck_(component_type, property_value)
    );
  },
};

Extensions.registerMutator(
  "components_property_options_mutator",
  COMPONENTS_COMPONENT_OPTIONS_MUTATOR_MIXIN
);
