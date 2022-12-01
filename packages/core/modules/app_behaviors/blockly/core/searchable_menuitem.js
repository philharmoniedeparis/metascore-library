import { MenuItem } from "blockly/core";

/**
 * Class for a searchable menu item.
 */
export default class SearchableMenuItem extends MenuItem {
  /**
   * @inheritdoc
   */
  constructor(content, opt_value) {
    super(content, opt_value);

    this.searchableText_ = "";

    if (typeof content === "string") {
      this.setSearchableText(content);
    } else if (content instanceof HTMLImageElement) {
      this.setSearchableText(content.alt);
    }
  }

  /**
   * @inheritdoc
   */
  createDom() {
    const element = super.createDom();

    element.classList.add("blocklySearchableMenuItem");

    return element;
  }

  /**
   * Set the searchable text.
   *
   * @param {string} value The searchable text
   */
  setSearchableText(value) {
    this.searchableText_ = value.toLowerCase();
  }

  /**
   * Check if the searchable text contains a specified term.
   *
   * @param {string} term The term to check for.
   * @returns {boolean} True if the searchable text contains the term, false otherwise.
   */
  matchesTerm(term) {
    return !term || this.searchableText_.includes(term.toLowerCase());
  }
}
