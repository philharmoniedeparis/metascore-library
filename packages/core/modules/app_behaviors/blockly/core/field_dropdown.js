import {
  FieldDropdown as FieldDropdownBase,
  Field,
  fieldRegistry,
  Menu,
  MenuItem,
  utils,
} from "blockly/core";
import SearchableMenu from "./searchable_menu";
import SearchableMenuItem from "./searchable_menuitem";

const { aria, string: utilsString, parsing } = utils;

/**
 * Class for an editable dropdown field
 * that allows creating disabled options.
 */
export default class FieldDropdown extends FieldDropdownBase {
  /**
   * @inheritdocs
   */
  constructor(menuGenerator, opt_validator, opt_config) {
    super(Field.SKIP_SETUP);

    // If we pass SKIP_SETUP, don't do *anything* with the menu generator.
    if (!isMenuGenerator(menuGenerator)) return;

    if (Array.isArray(menuGenerator)) {
      validateOptions(menuGenerator);
      const trimmed = trimOptions(menuGenerator);
      this.menuGenerator_ = trimmed.options;
      this.prefixField = trimmed.prefix || null;
      this.suffixField = trimmed.suffix || null;
    } else {
      this.menuGenerator_ = menuGenerator;
    }

    /**
     * Whether the menu should be searchable.
     * @type {boolean}
     * @private
     */
    this.searchable_ = false;

    /**
     * The currently selected option. The field is initialized with the
     * first option selected.
     */
    this.selectedOption_ = this.getOptions(false).find((o) => {
      return typeof o[0] === "string" || o[0].default || !o[0].disabled;
    });

    if (opt_config) {
      this.configure_(opt_config);
    }
    this.setValue(this.selectedOption_[1]);
    if (opt_validator) {
      this.setValidator(opt_validator);
    }
  }

  /**
   * @inheritdoc
   */
  configure_(config) {
    super.configure_(config);

    if (config.searchable) this.searchable_ = config.searchable;
  }

  /**
   * @inheritdoc
   */
  dropdownCreate_() {
    const block = this.getSourceBlock();
    if (!block) {
      throw new Error();
    }

    const menu = this.searchable_ ? new SearchableMenu() : new Menu();
    menu.setRole(aria.Role.LISTBOX);
    this.menu_ = menu;

    const options = this.getOptions(false);
    this.selectedMenuItem_ = null;
    for (let i = 0; i < options.length; i++) {
      const [label, value] = options[i];
      let enabled = true;
      let searchable_text = null;
      const content = (() => {
        if (typeof label === "object") {
          if ("hidden" in label && label.hidden) {
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
            searchable_text = label.text;
            return label.label;
          }
        }
        return label;
      })();

      if (content === null) continue;

      let menuItem = null;
      if (this.searchable_) {
        menuItem = new SearchableMenuItem(content, value);
        if (searchable_text) {
          menuItem.setSearchableText(searchable_text);
        }
      } else {
        menuItem = new MenuItem(content, value);
      }
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

      if ("text" in option) {
        return option.text;
      }

      return option.label;
    }
    return option;
  }
}

/**
 * Copied as is from blockly.
 */
function isMenuGenerator(menuGenerator) {
  return menuGenerator !== Field.SKIP_SETUP;
}

/**
 * Copied with slight modification from blockly.
 */
function trimOptions(options) {
  let hasImages = false;
  const trimmedOptions = options.map(([label, value]) => {
    if (typeof label === "string") {
      return [parsing.replaceMessageReferences(label), value];
    }

    hasImages = true;
    // Copy the image properties so they're not influenced by the original.
    // NOTE: No need to deep copy since image properties are only 1 level deep.
    const imageLabel =
      "alt" in label && label.alt !== null
        ? { ...label, alt: parsing.replaceMessageReferences(label.alt) }
        : { ...label };
    return [imageLabel, value];
  });

  if (hasImages || options.length < 2) return { options: trimmedOptions };

  const stringOptions = trimmedOptions;
  const stringLabels = stringOptions.map(([label]) => label);

  const shortest = utilsString.shortestStringLength(stringLabels);
  const prefixLength = utilsString.commonWordPrefix(stringLabels, shortest);
  const suffixLength = utilsString.commonWordSuffix(stringLabels, shortest);

  if (
    (!prefixLength && !suffixLength) ||
    shortest <= prefixLength + suffixLength
  ) {
    // One or more strings will entirely vanish if we proceed.  Abort.
    return { options: stringOptions };
  }

  const prefix = prefixLength
    ? stringLabels[0].substring(0, prefixLength - 1)
    : undefined;
  const suffix = suffixLength
    ? stringLabels[0].substr(1 - suffixLength)
    : undefined;
  return {
    options: applyTrim(stringOptions, prefixLength, suffixLength),
    prefix,
    suffix,
  };
}

/**
 * Copied as is from blockly.
 */
function applyTrim(options, prefixLength, suffixLength) {
  return options.map(([text, value]) => [
    text.substring(prefixLength, text.length - suffixLength),
    value,
  ]);
}

/**
 * Copied with slight modification from blockly.
 */
const validateOptions = function (options) {
  if (!Array.isArray(options)) {
    throw TypeError("FieldDropdown options must be an array.");
  }
  if (!options.length) {
    throw TypeError("FieldDropdown options must not be an empty array.");
  }
  let foundError = false;
  for (let i = 0; i < options.length; i++) {
    const tuple = options[i];
    if (!Array.isArray(tuple)) {
      foundError = true;
      console.error(
        "Invalid option[" +
          i +
          "]: Each FieldDropdown option must be an " +
          "array. Found: ",
        tuple
      );
    } else if (typeof tuple[1] !== "string") {
      foundError = true;
      console.error(
        "Invalid option[" +
          i +
          "]: Each FieldDropdown option id must be " +
          "a string. Found " +
          tuple[1] +
          " in: ",
        tuple
      );
    } else if (
      tuple[0] &&
      typeof tuple[0] !== "string" &&
      typeof tuple[0].src !== "string" &&
      typeof tuple[0].label !== "string" &&
      !(tuple[0].label instanceof HTMLElement)
    ) {
      foundError = true;
      console.error(
        "Invalid option[" +
          i +
          "]: Each FieldDropdown option must have a " +
          "string or an object with a 'src' or 'label' property. " +
          "Found" +
          tuple[0] +
          " in: ",
        tuple
      );
    } else if (
      tuple[0]?.label instanceof HTMLElement &&
      !(typeof tuple[0].text === "string")
    ) {
      foundError = true;
      console.error(
        "Invalid option[" +
          i +
          "]: If a FieldDropdown option has an object" +
          "with an HTML element as the 'label' property, " +
          "it must also have a 'text' property. " +
          "Found" +
          tuple[0] +
          " in: ",
        tuple
      );
    }
  }
  if (foundError) {
    throw TypeError("Found invalid FieldDropdown options.");
  }
};

fieldRegistry.unregister("field_dropdown");
fieldRegistry.register("field_dropdown", FieldDropdown);
