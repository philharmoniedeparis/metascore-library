import {
  FieldDropdown,
  fieldRegistry,
  Field,
  Menu,
  MenuItem,
  utils,
} from "blockly/core";

/**
 * Class for an enhanced editable dropdown field
 * that allows creating disabled options.
 */
export default class FieldEnhancedDropdown extends FieldDropdown {
  /**
   * @param {(!Array<!Array>|!Function|!Sentinel)} menuGenerator
   *     A non-empty array of options for a dropdown list, or a function which
   *     generates these options.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {Function=} opt_validator A function that is called to validate
   *     changes to the field's value. Takes in a language-neutral dropdown
   *     option & returns a validated language-neutral dropdown option, or null
   *     to abort the change.
   * @param {Object=} opt_config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   *     https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/dropdown#creation}
   *     for a list of properties this parameter supports.
   * @throws {TypeError} If `menuGenerator` options are incorrectly structured.
   */
  constructor(menuGenerator, opt_validator, opt_config) {
    super(Field.SKIP_SETUP);

    /**
     * A reference to the currently selected menu item.
     * @type {?MenuItem}
     * @private
     */
    this.selectedMenuItem_ = null;

    /**
     * The dropdown menu.
     * @type {?Menu}
     * @protected
     */
    this.menu_ = null;

    /**
     * SVG image element if currently selected option is an image, or null.
     * @type {?SVGImageElement}
     * @private
     */
    this.imageElement_ = null;

    /**
     * Tspan based arrow element.
     * @type {?SVGTSpanElement}
     * @private
     */
    this.arrow_ = null;

    /**
     * SVG based arrow element.
     * @type {?SVGElement}
     * @private
     */
    this.svgArrow_ = null;

    /**
     * Serializable fields are saved by the serializer, non-serializable fields
     * are not. Editable fields should also be serializable.
     * @type {boolean}
     */
    this.SERIALIZABLE = true;

    /**
     * Mouse cursor style when over the hotspot that initiates the editor.
     * @type {string}
     */
    this.CURSOR = "default";

    // If we pass SKIP_SETUP, don't do *anything* with the menu generator.
    if (menuGenerator === Field.SKIP_SETUP) return;

    if (Array.isArray(menuGenerator)) {
      validateOptions(menuGenerator);
    }

    /**
     * An array of options for a dropdown list,
     * or a function which generates these options.
     * @type {(!Array<!Array>|!function(this:FieldDropdown): !Array<!Array>)}
     * @protected
     */
    this.menuGenerator_ =
      /**
       * @type {(!Array<!Array>|
       *    !function(this:FieldDropdown):!Array<!Array>)}
       */
      (menuGenerator);

    /**
     * A cache of the most recently generated options.
     * @type {Array<!Array<string>>}
     * @private
     */
    this.generatedOptions_ = null;

    /**
     * The prefix field label, of common words set after options are trimmed.
     * @type {?string}
     * @package
     */
    this.prefixField = null;

    /**
     * The suffix field label, of common words set after options are trimmed.
     * @type {?string}
     * @package
     */
    this.suffixField = null;

    this.trimOptions_();

    /**
     * The currently selected option. The field is initialized with the
     * first option selected.
     * @type {!Array<string|!ImageProperties>}
     * @private
     */
    this.selectedOption_ = this.getOptions(false).find((o) => {
      return typeof o[0] === "string" || !o[0].disabled;
    });

    if (opt_config) this.configure_(opt_config);
    this.setValue(this.selectedOption_[1]);
    if (opt_validator) this.setValidator(opt_validator);
  }

  /**
   * @inheritdoc
   */
  dropdownCreate_() {
    const { aria } = utils;

    const menu = new Menu();
    menu.setRole(aria.Role.LISTBOX);
    this.menu_ = menu;

    const options = this.getOptions(false);
    this.selectedMenuItem_ = null;
    for (let i = 0; i < options.length; i++) {
      let content = options[i][0]; // Human-readable text or image.
      const value = options[i][1]; // Language-neutral value.

      let menuItem = null;

      if (typeof content === "object") {
        if ("src" in content) {
          // An image, not text.
          const image = new Image(content.width, content.height);
          image.src = content.src;
          image.alt = content.alt || "";
          menuItem = new MenuItem(image, value);
        } else {
          menuItem = new MenuItem(content.label, value);
        }

        if ("disabled" in content && content.disabled) {
          menuItem.setEnabled(false);
        }
      } else {
        menuItem = new MenuItem(content, value);
      }

      menuItem.setRole(aria.Role.OPTION);
      menuItem.setRightToLeft(this.sourceBlock_.RTL);
      menuItem.setCheckable(true);
      menu.addChild(menuItem);
      menuItem.setChecked(value === this.value_);
      if (value === this.value_) {
        this.selectedMenuItem_ = menuItem;
      }
      menuItem.onAction(this.handleMenuActionEvent_, this);
    }
  }

  /**
   * @inheritdoc
   */
  getOptions(opt_useCache) {
    if (this.isOptionListDynamic()) {
      if (!this.generatedOptions_ || !opt_useCache) {
        this.generatedOptions_ = this.menuGenerator_.call(this);
        validateOptions(this.generatedOptions_);
      }
      return this.generatedOptions_;
    }
    return /** @type {!Array<!Array<string>>} */ (this.menuGenerator_);
  }

  /**
   * @inheritdoc
   */
  getText_() {
    if (!this.selectedOption_) {
      return null;
    }
    const option = this.selectedOption_[0];
    if (typeof option === "object" && "label" in option) {
      return option.label;
    }
    if (typeof option === "object" && "alt" in option) {
      return option.alt;
    }
    return option;
  }
}

/**
 * Validates the data structure to be processed as an options list.
 * @param {?} options The proposed dropdown options.
 * @throws {TypeError} If proposed options are incorrectly structured.
 */
const validateOptions = function (options) {
  if (!Array.isArray(options)) {
    throw TypeError("FieldEnhancedDropdown options must be an array.");
  }
  if (!options.length) {
    throw TypeError(
      "FieldEnhancedDropdown options must not be an empty array."
    );
  }
  let foundError = false;
  for (let i = 0; i < options.length; i++) {
    const tuple = options[i];
    if (!Array.isArray(tuple)) {
      foundError = true;
      console.error(
        "Invalid option[" +
          i +
          "]: Each FieldEnhancedDropdown option must be an " +
          "array. Found: ",
        tuple
      );
    } else if (typeof tuple[1] !== "string") {
      foundError = true;
      console.error(
        "Invalid option[" +
          i +
          "]: Each FieldEnhancedDropdown option id must be " +
          "a string. Found " +
          tuple[1] +
          " in: ",
        tuple
      );
    } else if (
      tuple[0] &&
      typeof tuple[0] !== "string" &&
      typeof tuple[0].src !== "string" &&
      typeof tuple[0].label !== "string"
    ) {
      foundError = true;
      console.error(
        "Invalid option[" +
          i +
          "]: Each FieldEnhancedDropdown option must have a " +
          "string label or image description. Found" +
          tuple[0] +
          " in: ",
        tuple
      );
    }
  }
  if (foundError) {
    throw TypeError("Found invalid FieldEnhancedDropdown options.");
  }
};

fieldRegistry.register("field_enhanced_dropdown", FieldEnhancedDropdown);
