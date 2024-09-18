import {
  FieldDropdown as FieldDropdownBase,
  Field,
  fieldRegistry,
  utils,
  UnattachedFieldError,
  DropDownDiv,
} from "blockly/core";
import Menu from "./menu";
import MenuItem from "./menuitem";
import { times } from "lodash";

const { aria, string: utilsString, parsing, style } = utils;

/**
 * Class for an editable dropdown field
 * that allows creating disabled options.
 */
export default class FieldDropdown extends FieldDropdownBase {
  /**
   * @inheritdocs
   */
  constructor(menuGenerator, validator, config) {
    super(Field.SKIP_SETUP);

    // If we pass SKIP_SETUP, don't do *anything* with the menu generator.
    if (menuGenerator === Field.SKIP_SETUP) return;

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
     * Whether multiple options can be selected.
     * @type {boolean}
     * @private
     */
    this.multiple_ = false;

    /**
     * Whether the menu should be searchable.
     * @type {boolean}
     * @private
     */
    this.searchable_ = false;

    this.selectedMenuItems = [];

    if (config) {
      this.configure_(config);
    }

    if (this.multiple_) {
      this.value_ = [];
    }

    /**
     * The currently selected option. The field is initialized with the
     * first option selected.
     */
    this.selectedOption = this.getOptions(false)[
      this.multiple_ ? "filter" : "find"
    ]((o) => {
      return typeof o[0] === "string" || o[0].default || !o[0].disabled;
    });

    this.setValue(
      this.multiple_
        ? this.selectedOption.map(([value]) => value)
        : this.selectedOption[1]
    );
    if (validator) {
      this.setValidator(validator);
    }
  }

  /**
   * @inheritdoc
   */
  configure_(config) {
    super.configure_(config);

    if (config.multiple) this.multiple_ = config.multiple;
    if (config.searchable) this.searchable_ = config.searchable;
  }

  showEditor_(e) {
    super.showEditor_(e);

    if (this.multiple_) {
      if (this.selectedMenuItems.length > 0) {
        this.selectedMenuItems.forEach((menuItem) => {
          this.menu_.setHighlighted(menuItem);
        });
        style.scrollIntoContainerView(
          this.selectedMenuItems.at(0).getElement(),
          DropDownDiv.getContentDiv(),
          true
        );
      }
    }
  }

  /**
   * @inheritdoc
   */
  dropdownCreate() {
    const block = this.getSourceBlock();
    if (!block) {
      throw new UnattachedFieldError();
    }
    const menu = new Menu(this.searchable_);
    menu.setRole(aria.Role.LISTBOX);
    this.menu_ = menu;

    const options = this.getOptions(false, false);
    this.selectedMenuItem = null;
    this.selectedMenuItems = [];
    for (let i = 0; i < options.length; i++) {
      const menuItem = this.dropdownCreateItem(options[i], block);
      if (menuItem) menu.addChild(menuItem);
    }
  }

  dropdownCreateItem(option, block) {
    const [label, value] = option;
    let content = null;
    let enabled = true;
    let children = null;
    let expanded = null;
    let text = null;

    if (typeof label === "object") {
      if ("hidden" in label && label.hidden) {
        // Skip; don't add a menu item.
      } else {
        if ("disabled" in label && label.disabled) {
          enabled = false;
        }

        if ("src" in label) {
          // Convert ImageProperties to an HTMLImageElement.
          const image = new Image(label["width"], label["height"]);
          image.src = label["src"];
          image.alt = label["alt"] || "";
          content = image;
        } else {
          content = label.label;
          text = label.text ?? label.label;
          children = label.children;
          expanded = label.expanded;
        }
      }
    } else {
      content = label;
    }

    if (content === null) return null;

    const menuItem = new MenuItem(content, value, this.searchable_);
    menuItem.setRole(aria.Role.OPTION);
    menuItem.setRightToLeft(block.RTL);

    if (enabled) {
      menuItem.setCheckable(true);
      menuItem.setChecked(value === this.value_);
      if (value === this.value_) {
        if (this.multiple_) this.selectedMenuItems.push(menuItem);
        else this.selectedMenuItem = menuItem;
      }
      menuItem.onAction(this.handleMenuActionEvent, this);
    } else {
      menuItem.setEnabled(false);
    }

    if (text) {
      menuItem.setSearchableText(text);
    }

    if (Array.isArray(children)) {
      children.forEach((child_option) => {
        const subItem = this.dropdownCreateItem(child_option, block);
        menuItem.addChild(subItem);
      });

      if (expanded) {
        menuItem.setExpanded(true);
      }
    }

    return menuItem;
  }

  dropdownDispose_() {
    super.dropdownDispose_();

    this.selectedMenuItems = [];
  }

  onItemSelected_(menu, menuItem) {
    if (!this.multiple_) {
      return super.onItemSelected_(menu, menuItem);
    }

    const values = this.getValue();
    const value = menuItem.getValue();
    if (values.includes(value)) {
      this.setValue(values.filter((v) => v !== value));
    } else {
      this.setValue([...values, value]);
    }
  }

  /**
   * A direct copy if the original getOptions method.
   * This is required to use the local validateOptions method (see below).
   */
  getOptions_(useCache) {
    if (!this.menuGenerator_) {
      // A subclass improperly skipped setup without defining the menu
      // generator.
      throw TypeError("A menu generator was never defined.");
    }

    if (Array.isArray(this.menuGenerator_)) return this.menuGenerator_;
    if (useCache && this.generatedOptions) return this.generatedOptions;

    this.generatedOptions = this.menuGenerator_();
    validateOptions(this.generatedOptions);
    return this.generatedOptions;
  }

  /**
   * @inheritdoc
   */
  getOptions(useCache, flattened = true) {
    const options = this.getOptions_(useCache);

    if (!flattened) return options;

    const flat = options.reduce((acc, option) => {
      acc.push(...this.flattenOption_(option));
      return acc;
    }, []);
    return flat;
  }

  flattenOption_(option) {
    const [label] = option;
    const flattened = [option];
    if (typeof label === "object" && Array.isArray(label.children)) {
      label.children.reduce((acc, child) => {
        acc.push(...this.flattenOption_(child));
        return acc;
      }, flattened);
    }
    return flattened;
  }

  /**
   * @inheritdoc
   */
  doClassValidation_(newValue) {
    if (!this.multiple_) {
      return super.doClassValidation_(newValue);
    }

    const options = this.getOptions(true).map(([, value]) => value);
    const isValueValid = !newValue.some((value) => !options.includes(value));

    if (!isValueValid) {
      if (this.sourceBlock_) {
        console.warn(
          "Cannot set the dropdown's value to an unavailable option." +
            " Block type: " +
            this.sourceBlock_.type +
            ", Field name: " +
            this.name +
            ", Value: " +
            newValue
        );
      }
      return null;
    }
    return newValue;
  }

  /**
   * @inheritdoc
   */
  doValueUpdate_(newValue) {
    if (!this.multiple_) {
      return super.doValueUpdate_(newValue);
    }

    Field.prototype.doValueUpdate_.call(this, newValue);
    const options = this.getOptions(true);
    for (let i = 0, option; (option = options[i]); i++) {
      if (option[1] === this.value_) {
        this.selectedOption.push(option);
      }
    }
  }

  /**
   * @inheritdoc
   */
  render_() {
    // Hide both elements.
    this.getTextContent().nodeValue = "";
    this.imageElement.style.display = "none";

    // Show correct element.
    const option = this.multiple_
      ? this.selectedOption?.[0]?.[0]
      : this.selectedOption?.[0];
    // @todo: handle multiple selected options.
    if (option && typeof option === "object" && "alt" in option) {
      this.renderSelectedImage(option);
    } else {
      this.renderSelectedText();
    }

    this.positionBorderRect_();
  }

  /**
   * @inheritdoc
   */
  getText_() {
    if (!this.selectedOption) {
      return null;
    }
    const option = this.multiple_
      ? this.selectedOption?.[0]?.[0]
      : this.selectedOption[0];
    // @todo: handle multiple selected options.
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
