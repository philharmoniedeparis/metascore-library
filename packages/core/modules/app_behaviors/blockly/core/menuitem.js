import { MenuItem as MenuItemBase, Css } from "blockly/core";

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

    this.children = [];
    this.expanded = false;

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
      expander.checked = this.expanded;
      expander.className = "blocklyMenuItemExpander";
      element.appendChild(expander);

      const children = document.createElement("div");
      children.className = "blocklyMenuItemChildren";
      element.appendChild(children);

      this.children.forEach((child) => {
        const childElement = child.createDom();
        children.appendChild(childElement);

        if (!expander.checked) {
          // Expand if a child is either checked or expanded.
          if (
            child.checked ||
            childElement.querySelector(".blocklyMenuItemExpander:checked")
          ) {
            expander.checked = true;
          }
        }
      });
    }

    element.menuItem = this;

    return element;
  }

  /**
   * @inheritdoc
   */
  dispose() {
    this.children = [];

    super.dispose();
  }

  /**
   * Set whether the item is initially by default.
   *
   * @param {string} value Whether expanded or not.
   */
  setExpanded(value) {
    this.expanded = value;
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
  .blocklyMenuItem {
    display: grid;
    grid-template-columns: min-content 1fr;
    grid-template-rows: auto 1fr;
    gap: 0px 0px;
    grid-template-areas:
      "expander content"
      "children children";
  }
  .blocklyMenuItem .blocklyMenuItemContent {
    grid-area: content;
  }
  .blocklyMenuItem .blocklyMenuItemExpander {
    grid-area: expander;
    appearance: none;
    display: flex;
    height: 100%;
    padding: 0 10px;
    align-content: center;
    align-items: center;
    cursor: pointer;
  }
  .blocklyMenuItem .blocklyMenuItemExpander::after {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 0 5px 5px;
    border-color: transparent transparent transparent #adadad;
    transition: transform 0.25s ease;
  }
  .blocklyMenuItem .blocklyMenuItemExpander:checked::after {
    transform: rotate(90deg);
  }
  .blocklyMenuItem .blocklyMenuItemExpander + .blocklyMenuItemChildren {
    display: block;
    grid-area: children;
    padding-left: 10px;
  }
  .blocklyMenuItem .blocklyMenuItemExpander:not(:checked) + .blocklyMenuItemChildren {
    display: none;
  }
}
  `
);
