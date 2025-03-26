import { Menu as MenuBase, Css, browserEvents, utils } from "blockly/core";
const { dom, Svg } = utils;

/**
 * Class for a searchable menu.
 */
export default class Menu extends MenuBase {
  /**
   * @inheritdoc
   */
  constructor(opt_searchable = false) {
    super();

    this.searchable = opt_searchable;

    /**
     * Search input event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.searchInputHandler = null;
  }

  /**
   * @inheritdoc
   */
  render(container) {
    const element = super.render(container);

    if (this.searchable) {
      this.createSearchInput_();
    }

    return element;
  }

  /**
   * @inheritdoc
   */
  focus() {
    super.focus();

    if (this.searchinput_) {
      this.searchinput_.focus({ preventScroll: true });
    }
  }

  /**
   * Create the search input.
   */
  createSearchInput_() {
    this.searchBox_ = document.createElement("div");
    this.searchBox_.classList.add("blocklyMenuSearch");

    this.searchinput_ = document.createElement("input");
    this.searchBox_.appendChild(this.searchinput_);

    this.searchKeydownHandler = browserEvents.conditionalBind(
      this.searchinput_,
      "keydown",
      this,
      this.handleSearchKeydownEvent
    );
    this.searchInputHandler = browserEvents.conditionalBind(
      this.searchinput_,
      "input",
      this,
      this.handleSearchInputEvent
    );

    this.createSVGSearchIcon_();

    this.element.insertBefore(this.searchBox_, this.element.firstChild);
  }

  /**
   * Create the search svg icon.
   */
  createSVGSearchIcon_() {
    if (this.svgSearchIcon_) return;

    this.svgSearchIcon_ = dom.createSvgElement(
      Svg.SVG,
      {
        xmlns: dom.SVG_NS,
        "xmlns:html": dom.HTML_NS,
        "xmlns:xlink": dom.XLINK_NS,
        version: "1.1",
        width: "12px",
        height: "12px",
        class: "blocklyMenuSearchIcon",
      },
      this.searchBox_
    );

    const box = dom.createSvgElement(Svg.G, {}, this.svgSearchIcon_);
    const icon = dom.createSvgElement(
      Svg.IMAGE,
      {
        height: "12px",
        width: "12px",
      },
      box
    );
    icon.setAttributeNS(
      dom.XLINK_NS,
      "xlink:href",
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMC4yNDMgMTIuMTI3Ij48cGF0aCBkPSJNMTAuMjQzIDExLjQ5N0w3LjIxMSA3Ljc1OGMuOTY0LS44MDggMS41OTEtMi4wMDQgMS41OTEtMy4zNTdBNC40MDYgNC40MDYgMCAwMDQuNCAwIDQuNDA1IDQuNDA1IDAgMDAwIDQuNDAxYzAgMi40MjYgMS45NzQgNC40IDQuNCA0LjRhNC4zNyA0LjM3IDAgMDAxLjk3My0uNDg3bDMuMDkzIDMuODEzLjc3Ny0uNjN6TTEgNC40MDFBMy40MDQgMy40MDQgMCAwMTQuNCAxYzEuODc1IDAgMy40MDIgMS41MjYgMy40MDIgMy40MDFzLTEuNTI2IDMuNC0zLjQwMiAzLjRhMy40MDQgMy40MDQgMCAwMS0zLjQtMy40IiBmaWxsPSIjMDAwIi8+PC9zdmc+"
    );
  }

  /**
   * @inheritdoc
   */
  getMenuItem(elem) {
    const menuElem = this.getElement();
    let currentElement = elem;
    while (currentElement && currentElement !== menuElem) {
      if (currentElement.classList.contains("blocklyMenuItem")) {
        return currentElement.menuItem;
      }
      currentElement = currentElement.parentElement;
    }
    return null;
  }

  handleMouseOver(e) {
    if (
      e.target.matches(".blocklyMenuItemExpander, .blocklyMenuItemChildren")
    ) {
      this.setHighlighted(null);
      return;
    }

    super.handleMouseOver(e);
  }

  handleClick(e) {
    if (
      e.target.matches(".blocklyMenuItemExpander, .blocklyMenuItemChildren")
    ) {
      return;
    }

    super.handleClick(e);
  }

  /**
   * Handle keydown event on the search input.
   *
   * @param e Keyboard event.
   */
  handleSearchKeydownEvent(e) {
    e.stopPropagation();
  }

  /**
   * Handle input event on the search input.
   *
   * @param e Keyboard event.
   */
  handleSearchInputEvent(e) {
    const term = e.target.value.trim();

    this.element.classList.toggle("blocklyMenuSearching", term);

    this.element
      .querySelectorAll(".blocklyMenuItem")
      .forEach(({ menuItem }) => {
        if (menuItem.matchesTerm(term)) {
          menuItem.element.classList.add("blocklyMenuItemMatch");
        } else {
          menuItem.element.classList.remove("blocklyMenuItemMatch");
        }
      });
  }

  /**
   * @inheritdoc
   */
  dispose() {
    if (this.searchKeydownHandler) {
      browserEvents.unbind(this.searchKeydownHandler);
      this.searchKeydownHandler = null;
    }
    if (this.searchInputHandler) {
      browserEvents.unbind(this.searchInputHandler);
      this.searchInputHandler = null;
    }

    super.dispose();
  }
}

Css.register(
  `
  .blocklyMenu .blocklyMenuSearch {
    position: sticky;
    top: 0;
    padding: 1em;
    background: inherit;
    z-index: 1;
  }
  .blocklyMenu .blocklyMenuSearch input {
    width: 100%;
    padding: 0.25em 0.5em;
    padding-right: 1.5em;
    border: none;
    border-radius: 1em;
    box-sizing: border-box;
  }
  .blocklyMenu .blocklyMenuSearchIcon {
    position: absolute;
    top: 50%;
    right: 1.5em;
    transform: translateY(-50%);
    opacity: 0.75;
    pointer-events: none;
  }
  .blocklyMenuSearching .blocklyMenuItem:not(.blocklyMenuItemMatch) > .blocklyMenuItemContent,
  .blocklyMenuSearching .blocklyMenuItemExpander {
    display: none !important;
  }
  .blocklyMenuSearching .blocklyMenuItemChildren {
    padding-left: 0 !important;
  }
  .blocklyMenuSearching .blocklyMenuItemChildren:has(.blocklyMenuItemMatch) {
    display: block !important;
  }
  `
);
