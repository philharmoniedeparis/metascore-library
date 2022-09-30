import {
  defineBlocksWithJsonArray,
  Extensions,
  FieldDropdown,
  Msg,
} from "blockly/core";
import { isFunction } from "lodash";
import FieldEnhancedDropdown from "../fields/field_enhanced_dropdown";
import { useModule } from "@metascore-library/core/services/module-manager";

export const EMPTY_OPTION = "%EMPTY_OPTION%";

const SUPPORTED_PROPERTIES = [
  "background-color",
  "border-color",
  "border-width",
  "hidden",
  "loop-duration",
  "reversed",
  "cursor-width",
  "cursor-color",
];

/**
 * Get component dropdown options
 * @param {string?} type The type of components
 * @param {boolean|array} recursive Whether to recurse to child components.
 *  An array of children is passed when recursed from within the function.
 * @param {function?} alter_hook An optional function to alter each option.
 * @param {string?} prefix A string to prefix options, used internally.
 * @returns {array} An options array
 */
function getComponentOptions(
  type = null,
  recursive = false,
  alter_hook = null,
  prefix = ""
) {
  const { getComponents, getComponentsByType, getComponentChildren } =
    useModule("app_components");
  let components = [];
  let options = [];

  if (recursive) {
    components = Array.isArray(recursive)
      ? recursive
      : getComponentsByType(type || "Scenario");
  } else {
    components = type ? getComponentsByType(type) : getComponents();
  }

  if (components.length > 0) {
    components.forEach((c) => {
      const name = c.name || "untitled";
      const option = [`${prefix} ${name}`, `${c.type}:${c.id}`];

      if (alter_hook && isFunction(alter_hook)) {
        alter_hook(option, c);
      }

      options.push(option);

      if (recursive) {
        const children = getComponentChildren(c);
        options = [
          ...options,
          ...getComponentOptions(type, children, alter_hook, `—${prefix}`),
        ];
      }
    });
  }

  return options;
}

/**
 * Get the options array for the PROPERTY field.
 * @param {string} component_type The component type.
 * @returns {array} The options.
 */
function getPropertyOptions(component_type) {
  if (component_type === EMPTY_OPTION) {
    return [
      [Msg.COMPONENTS_EMPTY_OPTION, EMPTY_OPTION],
      // Add all supported properties
      // to prevent validation issues.
      ...SUPPORTED_PROPERTIES.map((property) => {
        return [Msg.COMPONENTS_PROPERTY[property], property];
      }),
    ];
  }

  const { getModel } = useModule("app_components");
  return Object.keys(getModel(component_type).properties)
    .filter((property) => {
      return SUPPORTED_PROPERTIES.includes(property);
    })
    .map((property) => {
      return [Msg.COMPONENTS_PROPERTY[property], property];
    });
}

Extensions.register("components_scenario_options", function () {
  const scenario_input = this.getInput("COMPONENT");
  if (!scenario_input) return;

  let empty = false;
  const options = getComponentOptions("Scenario");
  if (options.length === 0) {
    empty = true;
    options.push([Msg.COMPONENTS_EMPTY_OPTION, EMPTY_OPTION]);
  }

  const scenario_field = new FieldDropdown(options);
  scenario_input.appendField(scenario_field, "COMPONENT");

  if (empty) {
    scenario_field.setEnabled(false);
    this.setEnabled(false);
    this.setTooltip(Msg.COMPONENTS_NO_SCENARIO_TOOLTIP);
  }
});

Extensions.register("components_block_options", function () {
  const block_input = this.getInput("COMPONENT");
  if (!block_input) return;

  let empty = false;
  const options = getComponentOptions("Block");
  if (options.length === 0) {
    empty = true;
    options.push([Msg.COMPONENTS_EMPTY_OPTION, EMPTY_OPTION]);
  }

  const block_field = new FieldDropdown(options);
  block_input.appendField(block_field, "COMPONENT");

  if (empty) {
    block_field.setEnabled(false);
    this.setEnabled(false);
    this.setTooltip(Msg.COMPONENTS_NO_BLOCK_TOOLTIP);
  }
});

Extensions.register("components_component_options", function () {
  const component_input = this.getInput("COMPONENT");
  if (!component_input) return;

  const property_input = this.getInput("PROPERTY");
  const mock = this.type.endsWith("_mock");

  const component_field = new FieldEnhancedDropdown(function () {
    const options = [
      [
        {
          label: Msg.COMPONENTS_EMPTY_OPTION,
          disabled: true,
          default: true,
          hiddenInMenu: true,
        },
        EMPTY_OPTION,
      ],
    ];

    if (mock) {
      return options;
    }

    if (property_input) {
      return [...options, ...getComponentOptions(null, true)];
    }

    return [
      ...options,
      ...getComponentOptions(null, true, (option, c) => {
        if (c.type === "Scenario") {
          option[0] = { label: option[0], disabled: true };
        }
      }),
    ];
  });
  component_input.appendField(component_field, "COMPONENT");

  if (mock) {
    component_field.setEnabled(false);

    this.setEnabled(false);
    this.setTooltip(() => {
      return Msg.COMPONENTS_PROPERTY_MOCK_TOOLTIP.replace(
        "%2",
        Msg.COMPONENTS_PROPERTY[this.property_]
      );
    });
  }
});

Extensions.register("components_property_options", function () {
  const property_input = this.getInput("PROPERTY");
  if (!property_input) return;

  const mock = this.type.endsWith("_mock");

  const property_field = new FieldEnhancedDropdown(() => {
    if (mock) {
      if (this.property_) {
        return [[Msg.COMPONENTS_PROPERTY[this.property_], this.property_]];
      }
      return [[Msg.COMPONENTS_EMPTY_OPTION, EMPTY_OPTION]];
    }

    const component_value = this.getFieldValue("COMPONENT");
    const component_type = this.getComponentType_(component_value);
    return getPropertyOptions(component_type);
  });
  property_input.appendField(property_field, "PROPERTY");

  if (mock) {
    property_field.setEnabled(false);
  }
});

const PROPERTY_OPTIONS_MUTATOR_MIXIN = {
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
    }
  },

  /**
   * Callback called whenever the block's parent workspace changes.
   * @param {object} evt The event.
   */
  onchange: function (evt) {
    switch (evt.type) {
      case "create":
        this.updatePropertyField_();
        break;

      case "change":
        if (evt.element === "field") {
          if (evt.name === "COMPONENT") {
            const newType = this.getComponentType_(evt.newValue);
            const oldType = this.getComponentType_(evt.oldValue);

            // Type didn't change, skip update.
            if (newType === oldType) return;

            this.updatePropertyField_();
          } else if (evt.name === "PROPERTY") {
            this.property_ = evt.newValue;
            this.updateChecks_();
          }
        }
        break;
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
   * Get the compatible value type or list of value types for the VALUE input.
   * @param {string} component_type The component type.
   * @param {string} property_name The property's name.
   * @returns {string|array<string>|null} The type check.
   */
  getPropertyValueTypeCheck_: function (component_type, property_name) {
    if (component_type === EMPTY_OPTION) return null;

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
   */
  updatePropertyField_: function () {
    const property_field = this.getField("PROPERTY");
    if (!property_field) return;

    const options = property_field.getOptions(false);
    const match = options.find((o) => {
      return o[1] === this.property_;
    });
    property_field.setValue(match ? this.property_ : options[0][1]);
  },

  /**
   * Update the output or VALUE field's check.
   */
  updateChecks_() {
    const mock = this.type.endsWith("_mock");
    if (mock) return;

    const component_type = this.getComponentType_();
    const property_value = this.getFieldValue("PROPERTY");
    const type = this.getPropertyValueTypeCheck_(
      component_type,
      property_value
    );

    const value_input = this.getInput("VALUE");
    if (value_input) {
      value_input.setCheck(type);
    } else if (this.outputConnection) {
      this.outputConnection.setCheck(type);
    }
  },
};

Extensions.registerMutator(
  "components_property_options_mutator",
  PROPERTY_OPTIONS_MUTATOR_MIXIN
);

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
        name: "COMPONENT",
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
    extensions: ["components_component_options", "components_property_options"],
    mutator: "components_property_options_mutator",
    inputsInline: true,
    output: null,
    style: "component_blocks",
    tooltip: "%{BKY_COMPONENTS_GET_PROPERTY_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_GET_PROPERTY_HELPURL}",
  },
  // Get property mock.
  {
    type: "components_get_property_mock",
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
    extensions: ["components_component_options", "components_property_options"],
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
    extensions: ["components_component_options", "components_property_options"],
    mutator: "components_property_options_mutator",
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SET_PROPERTY_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SET_PROPERTY_HELPURL}",
  },
  // Set property mock.
  {
    type: "components_set_property_mock",
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
    extensions: ["components_component_options", "components_property_options"],
    mutator: "components_property_options_mutator",
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SET_PROPERTY_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SET_PROPERTY_HELPURL}",
  },
  // Get block's activate page index.
  {
    type: "components_get_block_page",
    message0: "%{BKY_COMPONENTS_GET_BLOCK_PAGE}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
    ],
    extensions: ["components_block_options"],
    output: "Number",
    style: "component_blocks",
    tooltip: "%{BKY_COMPONENTS_GET_BLOCK_PAGE_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_GET_BLOCK_PAGE_HELPURL}",
  },
  // Set block's activate page index.
  {
    type: "components_set_block_page",
    message0: "%{BKY_COMPONENTS_SET_BLOCK_PAGE}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
      {
        type: "input_value",
        name: "INDEX",
        check: "Number",
      },
    ],
    extensions: ["components_block_options"],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SET_BLOCK_PAGE_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SET_BLOCK_PAGE_HELPURL}",
  },
]);
