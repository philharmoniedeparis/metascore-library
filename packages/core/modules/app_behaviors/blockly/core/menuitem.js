import { MenuItem as MenuItemBase, browserEvents, Css } from "blockly/core";

/**
 * Class for a searchable menu item.
 */
export default class MenuItem extends MenuItemBase {
  /**
   * @inheritdoc
   */
  constructor(content, opt_value, opt_searchable = false) {
    super(content, opt_value);

    this.searchable = opt_searchable;

    this.expanderClickHandler_ = null;
    this.children = [];

    if (this.searchable) {
      this.searchableText_ = "";

      if (typeof content === "string") {
        this.setSearchableText(content);
      } else if (content instanceof HTMLImageElement) {
        this.setSearchableText(content.alt);
      }
    }
  }

  addChild(element) {
    this.children.push(element);
  }

  /**
   * @inheritdoc
   */
  createDom() {
    const element = super.createDom();

    if (this.children.length) {
      const expander = document.createElement("input");
      expander.type = "checkbox";
      expander.className = "blocklyMenuItemExpander";
      element.appendChild(expander);

      this.expanderClickHandler_ = browserEvents.conditionalBind(
        expander,
        "pointerup",
        this,
        this.handleExpanderClick,
        true
      );

      const children = document.createElement("div");
      children.className = "blocklyMenuItemChildren";
      element.appendChild(children);

      this.children.forEach((child) => {
        children.appendChild(child.createDom());
      });
    }

    element.menuItem_ = this;

    return element;
  }

  /**
   * @inheritdoc
   */
  dispose() {
    if (this.expanderClickHandler_) {
      browserEvents.unbind(this.expanderClickHandler_);
      this.expanderClickHandler_ = null;
    }

    this.children = [];

    super.dispose();
  }

  /**
   * Handles expander click events.
   *
   * @param e Click event.
   */
  handleExpanderClick(e) {
    e.stopPropagation();
  }

  /**
   * Set the searchable text.
   *
   * @param {string} value The searchable text
   */
  setSearchableText(value) {
    if (!this.searchable) return;
    this.searchableText_ = value.toLowerCase();
  }

  /**
   * Check if the searchable text contains a specified term.
   *
   * @param {string} term The term to check for.
   * @returns {boolean} True if the searchable text contains the term, false otherwise.
   */
  matchesTerm(term) {
    if (!this.searchable) return true;
    return !term || this.searchableText_.includes(term.toLowerCase());
  }
}

Css.register(
  `
  .blocklyMenuItem .blocklyMenuItemContent {
    display: flex;
    gap: 10px;
  }
  .blocklyMenu .blocklyMenuItemExpander {
    order: -1;
    flex: 0 0 auto;
  }
  .blocklyMenu .blocklyMenuItemChildren {
    margin-left: 10px;
  }
  .blocklyMenu .blocklyMenuItemExpander:not(:checked) + .blocklyMenuItemChildren {
    display: none;
  }
  `
);
