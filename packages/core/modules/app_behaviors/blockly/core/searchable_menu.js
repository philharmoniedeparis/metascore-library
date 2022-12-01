import { Menu, Css, browserEvents, utils } from "blockly/core";
import SearchableMenuItem from "./searchable_menuitem";

const { dom, Svg } = utils;

/**
 * Class for a searchable menu.
 */
export default class SearchableMenu extends Menu {
  /**
   * @inheritdoc
   */
  constructor() {
    super();

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

    this.createSearchInput_();

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
    this.element.classList.add("blocklySearchableMenu");

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

    this.menuItems.forEach((menuItem) => {
      if (!(menuItem instanceof SearchableMenuItem)) {
        return;
      }

      if (menuItem.matchesTerm(term)) {
        menuItem.element.classList.remove("blocklyMenuItemMismatch");
      } else {
        menuItem.element.classList.add("blocklyMenuItemMismatch");
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
  .blocklySearchableMenu .blocklyMenuSearch {
    position: sticky;
    top: 0;
    padding: 1em;
    background: inherit;
  }
  .blocklySearchableMenu .blocklyMenuSearch input {
    width: 100%;
    padding: 0.5em;
    padding-right: 1.5em;
    border: none;
    border-radius: 1em;
    box-sizing: border-box;
  }
  .blocklySearchableMenu .blocklyMenuSearchIcon {
    position: absolute;
    top: 50%;
    right: 1.5em;
    transform: translateY(-50%);
    opacity: 0.75;
    pointer-events: none;
  }
  .blocklySearchableMenu .blocklyMenuItemMismatch {
    display: none;
  }
  `
);
