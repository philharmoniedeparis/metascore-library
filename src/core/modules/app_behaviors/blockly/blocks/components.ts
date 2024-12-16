import { ref, unref, watchEffect, type WatchHandle } from "vue";
import { defineBlocksWithJsonArray, Extensions, Msg, Css, Block } from "blockly/core";
import FieldDropdown from "../core/field_dropdown";
import { useModule } from "@core/services/module-manager";
import type AppComponentsModule from "@/core/modules/app_components";

const BREADCRUMB_SEPARATOR = " › ";

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
 * @param {array} components The components
 * @param {boolean} recursive Whether to recurse to child components.
 * @param {string} breadcrumb_ The current recursion breadcrumb, used internally.
 * @returns {array} An options array
 */
function getComponentOptions(
  components = [],
  recursive = false,
  breadcrumb_ = ""
) {
  const {
    activeScenario,
    getComponentChildren,
    getComponentLabel,
    getComponentIconURL,
  } = useModule("app_components") as AppComponentsModule;
  const options = [];

  if (components.length > 0) {
    components.forEach((c) => {
      const name = getComponentLabel(c);
      let label = name;

      const icon_url = getComponentIconURL(c);
      if (icon_url) {
        label = document.createElement("div");
        label.classList.add("blocklyMenuItemLabel");

        const icon = document.createElement("img");
        icon.src = icon_url;
        icon.classList.add("blocklyMenuItemLabelIcon");
        label.appendChild(icon);

        const text = document.createElement("div");
        text.classList.add("blocklyMenuItemLabelText");
        text.appendChild(document.createTextNode(name));
        label.appendChild(text);

        if (breadcrumb_) {
          const breadcrumb_text = `${breadcrumb_}${name}`;
          const breadcrumb = document.createElement("div");
          breadcrumb.classList.add("blocklyMenuItemLabelBreadcrumb");
          breadcrumb.appendChild(document.createTextNode(breadcrumb_text));
          label.appendChild(breadcrumb);
          label.setAttribute("title", breadcrumb_text);
        } else {
          label.setAttribute("title", name);
        }
      }

      let children = null;
      if (recursive) {
        const sub_components = getComponentChildren(c);
        if (["Scenario", "Page"].includes(c.type)) {
          sub_components.reverse();
        }

        children = getComponentOptions(
          sub_components,
          true,
          `${breadcrumb_}${name}${BREADCRUMB_SEPARATOR}`
        );
      }

      const option = [
        {
          label,
          text: name,
          children,
          expanded: c.type === "Scenario" && c.id === unref(activeScenario),
        },
        `${c.type}:${c.id}`,
      ];

      options.push(option);
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
  if (!component_type) {
    return [
      ["--", ""],
      // Add all supported properties
      // to prevent validation issues.
      ...SUPPORTED_PROPERTIES.map((property) => {
        return [Msg.COMPONENTS_PROPERTIES[property], property];
      }),
    ];
  }

  const { getModelByType } = useModule("app_components") as AppComponentsModule;
  return Object.keys(getModelByType(component_type).properties)
    .filter((property) => {
      return SUPPORTED_PROPERTIES.includes(property);
    })
    .map((property) => {
      return [Msg.COMPONENTS_PROPERTIES[property], property];
    });
}

type ComponentsComponentMixinType = typeof COMPONENTS_COMPONENT_MUTATOR_MIXIN;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ComponentsComponentMixin extends ComponentsComponentMixinType {}
type ComponentsComponentBlock = Block & ComponentsComponentMixin;

const COMPONENTS_COMPONENT_MUTATOR_MIXIN = {
  /**
   * Returns the state of this block as a JSON serializable object.
   * @return null
   *     The state of this block.
   */
  saveExtraState: function (this: ComponentsComponentBlock) {
    return null;
  },

  /**
   * Applies the given state to this block.
   */
  loadExtraState: function (this: ComponentsComponentBlock) {},

  /**
   * Modify this block to have the correct output type.
   * @this {Block}
   * @private
   */
  updateShape_: function (this: ComponentsComponentBlock, component) {
    const check = ["Component"];
    if (component) {
      const [type] = component.split(":");
      check.push(`${type}Component`);
    }
    this.setOutput(true, check);
  },
};

const componentOptions = ref([]);
let componentOptionsWatcher = null as WatchHandle|null;

const COMPONENTS_COMPONENT_MUTATOR_HELPER = function (this: ComponentsComponentBlock) {
  const component_input = this.getInput("COMPONENT");
  if (!component_input) return;

  if (!componentOptionsWatcher) {
    componentOptionsWatcher = watchEffect(() => {
      const { getComponentsByType } = useModule("app_components") as AppComponentsModule;
      componentOptions.value = getComponentOptions(
        getComponentsByType("Scenario"),
        true
      );
    });
  }

  const mock = this.type.endsWith("_mock");
  const empty = mock || componentOptions.value.length === 0;

  const component_field = new FieldDropdown(
    function () {
      if (empty) return [["--", ""]];
      return [...componentOptions.value];
    },
    function (value) {
      this.getSourceBlock().updateShape_(value);
      return;
    },
    { searchable: true }
  );
  component_input.appendField(component_field, "COMPONENT");

  if (empty) {
    component_field.setEnabled(false);

    this.setEnabled(false);

    if (mock) {
      this.setTooltip(() => {
        return Msg.COMPONENTS_PROPERTY_MOCK_TOOLTIP.replace(
          "%2",
          Msg.COMPONENTS_PROPERTIES[this.property_]
        );
      });
    }
  }
};
Extensions.registerMutator(
  "components_component_options",
  COMPONENTS_COMPONENT_MUTATOR_MIXIN,
  COMPONENTS_COMPONENT_MUTATOR_HELPER
);


type PropertyOptionsMixinType = typeof PROPERTY_OPTIONS_MUTATOR_MIXIN;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PropertyOptionsMixin extends PropertyOptionsMixinType {}
type PropertyOptionsBlock = Block & PropertyOptionsMixin;
type PropertyOptionsState = {
  hasLinkHighlight: boolean
  hasThen: boolean
};

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
    if (!component_type) return null;

    const { getModelByType } = useModule("app_components") as AppComponentsModule;
    const property = getModelByType(component_type).properties?.[property_name];

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

const PROPERTY_OPTIONS_MUTATOR_HELPER = function () {
  const property_input = this.getInput("PROPERTY");
  if (!property_input) return;

  const mock = this.type.endsWith("_mock");

  const property_field = new FieldDropdown(function () {
    const block = this.getSourceBlock();

    if (!block || mock) {
      if (block && block.property_) {
        return [[Msg.COMPONENTS_PROPERTIES[block.property_], block.property_]];
      }
      return [["--", ""]];
    }

    const component_value = block.getFieldValue("COMPONENT");
    const component_type = block.getComponentType_(component_value);
    return getPropertyOptions(component_type);
  });
  property_input.appendField(property_field, "PROPERTY");

  if (mock) {
    property_field.setEnabled(false);
  }
};

Extensions.registerMutator(
  "components_property_options",
  PROPERTY_OPTIONS_MUTATOR_MIXIN,
  PROPERTY_OPTIONS_MUTATOR_HELPER
);

const triggerOptions = ref([]);
let triggerOptionsWatcher = null as WatchHandle|null;

Extensions.register("behavior_triggers_options", function () {
  const trigger_input = this.getInput("TRIGGER");
  if (!trigger_input) return;

  if (!triggerOptionsWatcher) {
    triggerOptionsWatcher = watchEffect(() => {
      const { getComponentsByType } = useModule("app_components") as AppComponentsModule;
      const components = getComponentsByType("Content");
      const parser = new DOMParser();
      const ids = new Set();

      components.forEach((component) => {
        const text = component.text;

        if (text && text.includes("data-behavior-trigger")) {
          const doc = parser.parseFromString(text, "text/html");
          doc.querySelectorAll("a[data-behavior-trigger]").forEach((el) => {
            const id = el.dataset.behaviorTrigger;
            ids.add(id);
          });
        }
      });

      triggerOptions.value = Array.from(ids)
        .sort()
        .map((id) => [id, id]);
    });
  }

  const empty = triggerOptions.value.length === 0;

  const trigger_field = new FieldDropdown(function () {
    if (empty) return [["--", ""]];
    return [...triggerOptions.value];
  });
  trigger_input.appendField(trigger_field, "TRIGGER");

  if (empty) {
    trigger_field.setEnabled(false);
    this.setEnabled(false);
  }
});

defineBlocksWithJsonArray([
  // Component.
  {
    type: "components_component",
    message0: "%{BKY_COMPONENTS_COMPONENT}",
    args0: [
      {
        type: "input_dummy",
        name: "COMPONENT",
      },
    ],
    output: null,
    extensions: ["parent_tooltip_when_inline"],
    mutator: "components_component_options",
    style: "component_blocks",
    tooltip: "%{BKY_COMPONENTS_COMPONENT_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_COMPONENT_HELPURL}",
  },
  // Behaviour trigger.
  {
    type: "components_behaviour_trigger",
    message0: "%{BKY_COMPONENTS_BEHAVIOUR_TRIGGER}",
    args0: [
      {
        type: "input_dummy",
        name: "TRIGGER",
      },
    ],
    output: "BehaviorTrigger",
    extensions: ["parent_tooltip_when_inline", "behavior_triggers_options"],
    style: "component_blocks",
    tooltip: "%{BKY_COMPONENTS_BEHAVIOUR_TRIGGER_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_BEHAVIOUR_TRIGGER_HELPURL}",
  },
  // Set scenario.
  {
    type: "components_set_scenario",
    message0: "%{BKY_COMPONENTS_SET_SCENARIO}",
    args0: [
      {
        type: "input_value",
        name: "COMPONENT",
        check: "ScenarioComponent",
      },
    ],
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
        name: "PROPERTY",
      },
      {
        type: "input_value",
        name: "COMPONENT",
        check: "Component",
      },
    ],
    mutator: "components_property_options",
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
        name: "PROPERTY",
      },
      {
        type: "input_value",
        name: "COMPONENT",
        check: "Component",
      },
    ],
    mutator: "components_property_options",
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
        name: "PROPERTY",
      },
      {
        type: "input_value",
        name: "COMPONENT",
        check: ["Component", "Array"],
      },
      {
        type: "input_value",
        name: "VALUE",
      },
    ],
    mutator: "components_property_options",
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
        name: "PROPERTY",
      },
      {
        type: "input_value",
        name: "COMPONENT",
        check: ["Component", "Array"],
      },
      {
        type: "input_value",
        name: "VALUE",
      },
    ],
    mutator: "components_property_options",
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
        type: "input_value",
        name: "COMPONENT",
        check: "BlockComponent",
      },
    ],
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
        type: "input_value",
        name: "INDEX",
        check: "Number",
      },
      {
        type: "input_value",
        name: "COMPONENT",
        check: "BlockComponent",
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SET_BLOCK_PAGE_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SET_BLOCK_PAGE_HELPURL}",
  },
]);

Css.register(
  `
  .blocklyDropDownDiv .blocklyMenuItemLabel {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      "icon label"
      "breadcrumb breadcrumb";
    align-items: center;
    padding-left: calc(var(--level, 0) * 0.5em);
    gap: 0 0.5em;
  }
  .blocklyDropDownDiv .blocklyMenuItemLabelIcon {
    grid-area: icon;
    width: 1.5em;
  }
  .blocklyDropDownDiv .blocklyMenuItemLabelText {
    grid-area: label;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .blocklyDropDownDiv .blocklyMenuItemLabelBreadcrumb {
    display: block;
    grid-area: breadcrumb;
    font-size: 0.75em;
    opacity: 0.5;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .blocklyDropDownDiv .blocklyMenu:not(.blocklyMenuSearching) .blocklyMenuItemLabelBreadcrumb {
    display: none;
  }
  `
);
