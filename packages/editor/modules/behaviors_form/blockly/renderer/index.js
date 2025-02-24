import { blockRendering, zelos } from "blockly/core";

export class ConstantsProvider extends zelos.ConstantProvider {
  constructor() {
    super();

    this.FIELD_DROPDOWN_COLOURED_DIV = false;
  }

  getCSS_(selector) {
    return [
      // Text.
      `
      ${selector} .blocklyText,
      ${selector} .blocklyFlyoutLabelText {
        font: ${this.FIELD_TEXT_FONTWEIGHT} ${this.FIELD_TEXT_FONTSIZE}pt ${this.FIELD_TEXT_FONTFAMILY};
      }
      `,

      // Fields.
      `
      ${selector} .blocklyText {
        fill: #fff;
      }
      ${selector} .blocklyNonEditableText>rect:not(.blocklyDropdownRect),
      ${selector} .blocklyEditableText>rect:not(.blocklyDropdownRect) {
        fill: ${this.FIELD_BORDER_RECT_COLOUR};
      }
      ${selector} .blocklyNonEditableText>text,
      ${selector} .blocklyEditableText>text,
      ${selector} .blocklyNonEditableText>g>text,
      ${selector} .blocklyEditableText>g>text {
        fill: #575E75;
      }
      `,

      // Flyout labels.
      `
      ${selector} .blocklyFlyoutLabelText {
        fill: #575E75;
      }
      `,

      // Bubbles.
      `
      ${selector} .blocklyText.blocklyBubbleText {
        fill: #575E75;
      }
      `,

      // Editable field hover.
      `
      ${selector} .blocklyDraggable:not(.blocklyDisabled)
      .blocklyEditableText:not(.editing):hover>rect,
      ${selector} .blocklyDraggable:not(.blocklyDisabled)
      .blocklyEditableText:not(.editing):hover>.blocklyPath {
        stroke: #fff;
        stroke-width: 2;
      }
      `,

      // Text field input.
      `
      ${selector} .blocklyHtmlInput {
        font-family: ${this.FIELD_TEXT_FONTFAMILY};
        font-weight: ${this.FIELD_TEXT_FONTWEIGHT};
        color: #575E75;
      }
      `,

      // Dropdown field.
      `
      ${selector} .blocklyDropdownText {
        fill: #fff !important;
      }
      `,

      // Widget and Dropdown Div
      `
      ${selector}.blocklyWidgetDiv {
        font-size: 14px;
      }
      ${selector}.blocklyDropDownDiv {
        padding: 0;
        background-color: #3f3f3f;
        border-color: #777;
      }
      ${selector}.blocklyDropDownDiv .blocklyDropDownContent {
        scrollbar-width: thin;
        scrollbar-gutter: stable;
      }
      ${selector}.blocklyWidgetDiv .blocklyMenu,
      ${selector}.blocklyDropDownDiv .blocklyMenu {
        background-color: #3f3f3f;
      }
      ${selector}.blocklyWidgetDiv .blocklyMenu {
        font-size: 0.975em;
        padding: 0.25em;
        box-sizing: content-box;
        border: 1px solid #777;
        box-shadow: 0.25em 0.25em 0.5em 0 rgba(0, 0, 0, 0.5);
      }
      ${selector}.blocklyWidgetDiv .blocklyMenuItem,
      ${selector}.blocklyDropDownDiv .blocklyMenuItem {
        font-family: ${this.FIELD_TEXT_FONTFAMILY};
        padding: 0;
      }
      ${selector}.blocklyWidgetDiv .blocklyMenuItemContent,
      ${selector}.blocklyDropDownDiv .blocklyMenuItemContent {
        padding: 6px 15px;
      }
      ${selector}.blocklyWidgetDiv .blocklyMenuItemHighlight,
      ${selector}.blocklyDropDownDiv .blocklyMenuItemHighlight {
        background-color: inherit;
      }
      ${selector}.blocklyWidgetDiv .blocklyMenuItemHighlight > .blocklyMenuItemContent,
      ${selector}.blocklyDropDownDiv .blocklyMenuItemHighlight > .blocklyMenuItemContent {
        background-color: #606060;
      }
      ${selector}.blocklyWidgetDiv .blocklyMenuItemDisabled,
      ${selector}.blocklyDropDownDiv .blocklyMenuItemDisabled {
        opacity: 0.5;
      }
      ${selector}.blocklyWidgetDiv .blocklyMenuItemContent,
      ${selector}.blocklyDropDownDiv .blocklyMenuItemContent {
        color: #fff;
      }
      ${selector}.blocklyWidgetDiv .blocklyMenuItemSelected,
      ${selector}.blocklyDropDownDiv .blocklyMenuItemSelected {
        background-color: inherit;
      }
      ${selector}.blocklyWidgetDiv .blocklyMenuItemSelected > .blocklyMenuItemContent,
      ${selector}.blocklyDropDownDiv .blocklyMenuItemSelected > .blocklyMenuItemContent {
        background: #606060;
      }
      ${selector}.blocklyWidgetDiv .blocklyMenuItemCheckbox,
      ${selector}.blocklyDropDownDiv .blocklyMenuItemCheckbox {
        display: none;
      }
      `,

      // Connection highlight.
      `
      ${selector} .blocklyHighlightedConnectionPath {
        stroke: ${this.SELECTED_GLOW_COLOUR};
      }
      `,

      // Disabled outline paths.
      `
      ${selector} .blocklyDisabled > .blocklyOutlinePath {
        fill: url(#blocklyDisabledPattern${this.randomIdentifier})
      }
      `,

      // Insertion marker.
      `
      ${selector} .blocklyInsertionMarker>.blocklyPath {
        fill-opacity: ${this.INSERTION_MARKER_OPACITY};
        stroke: none;
      }
      `,

      // Context menu.
      `
      ${selector} .blocklyContextMenu {
        border-radius: 0;
      }
      `,
    ];
  }
}

export default class Renderer extends zelos.Renderer {
  makeConstants_() {
    return new ConstantsProvider();
  }
}

blockRendering.register("metascore_renderer", Renderer);
