import {
  FieldDropdown,
  fieldRegistry,
  Menu,
  MenuItem,
  utils,
} from "blockly/core";

const { aria } = utils;

/**
 * Class for an enhanced editable dropdown field
 * that allows creating disabled options.
 */
export default class FieldEnhancedDropdown extends FieldDropdown {
  /**
   * @inheritdocs
   */
  constructor(menuGenerator, opt_validator, opt_config) {
    super(menuGenerator, opt_validator, opt_config);

    this.setValidator(null);

    /**
     * @inheritdocs
     */
    this.selectedOption_ = this.getOptions(false).find((o) => {
      return typeof o[0] === "string" || o[0].default || !o[0].disabled;
    });

    this.setValue(this.selectedOption_[1]);

    if (opt_validator) this.setValidator(opt_validator);
  }

  /**
   * @inheritdoc
   */
  dropdownCreate_() {
    const block = this.getSourceBlock();
    if (!block) {
      throw new Error();
    }

    const menu = new Menu();
    menu.setRole(aria.Role.LISTBOX);
    this.menu_ = menu;

    const options = this.getOptions(false);
    this.selectedMenuItem_ = null;
    for (let i = 0; i < options.length; i++) {
      const [label, value] = options[i];
      let enabled = true;
      const content = (() => {
        if (typeof label === "object") {
          if ("hiddenInMenu" in label && label.hiddenInMenu) {
            // Don't add a menu item.
            return null;
          }

          if ("disabled" in label && label.disabled) {
            enabled = false;
          }

          if ("src" in label) {
            // Convert ImageProperties to an HTMLImageElement.
            const image = new Image(label["width"], label["height"]);
            image.src = label["src"];
            image.alt = label["alt"] || "";
            return image;
          } else {
            return label.label;
          }
        }
        return label;
      })();

      if (content === null) continue;

      const menuItem = new MenuItem(content, value);
      menuItem.setRole(aria.Role.OPTION);
      menuItem.setRightToLeft(block.RTL);
      menu.addChild(menuItem);

      if (enabled) {
        menuItem.setCheckable(true);
        menuItem.setChecked(value === this.value_);
        if (value === this.value_) {
          this.selectedMenuItem_ = menuItem;
        }
        menuItem.onAction(this.handleMenuActionEvent_, this);
      } else {
        menuItem.setEnabled(false);
      }
    }
  }

  /**
   * @inheritdoc
   */
  getOptions(opt_useCache) {
    if (!this.menuGenerator_) {
      // A subclass improperly skipped setup without defining the menu
      // generator.
      throw TypeError("A menu generator was never defined.");
    }

    if (Array.isArray(this.menuGenerator_)) return this.menuGenerator_;
    if (opt_useCache && this.generatedOptions_) return this.generatedOptions_;

    this.generatedOptions_ = this.menuGenerator_();
    validateOptions(this.generatedOptions_);
    return this.generatedOptions_;
  }

  /**
   * @inheritdoc
   */
  render_() {
    // Hide both elements.
    this.getTextContent().nodeValue = "";
    this.imageElement_.style.display = "none";

    // Show correct element.
    const option = this.selectedOption_ && this.selectedOption_[0];
    if (option && typeof option === "object" && "alt" in option) {
      this.renderSelectedImage_(option);
    } else {
      this.renderSelectedText_();
    }

    this.positionBorderRect_();
  }

  /**
   * @inheritdoc
   */
  getText_() {
    if (!this.selectedOption_) {
      return null;
    }
    const option = this.selectedOption_[0];
    if (typeof option === "object") {
      if ("alt" in option) {
        return option.alt;
      }

      return option.label;
    }
    return option;
  }
}

/**
 * @inheritdoc
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
