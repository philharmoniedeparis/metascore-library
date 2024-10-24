import {
  Field,
  fieldRegistry,
  WidgetDiv,
  DropDownDiv,
  utils,
  browserEvents,
  Events,
  Css,
} from "blockly/core";
import TimecodeInput from "timecode-input";
import "./events/timecode_value_in";
import "./events/timecode_value_out";

import ClearIcon from "../../assets/icons/timecode-clear.svg?raw";
import InIcon from "../../assets/icons/timecode-in.svg?raw";
import OutIcon from "../../assets/icons/timecode-out.svg?raw";

/**
 * Class for an editable timecode field.
 * Mostly based on Blockly.FieldTextInput.
 * @extends {Field}
 */
export default class FieldTimecode extends Field {
  /**
   * @param {(string|!Sentinel)=} value The initial value of the
   *     field. Should cast to a string. Defaults to an empty string if null or
   *     undefined.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {?Function=} validator A function that is called to validate
   *     changes to the field's value. Takes in a string & returns a validated
   *     string, or null to abort the change.
   * @param {Object=} config A map of options used to configure the field.
   */
  constructor(value, validator, config) {
    super(Field.SKIP_SETUP);

    /**
     * The minimum value this number field can contain.
     * @type {number}
     * @protected
     */
    this.min_ = 0;

    /**
     * The maximum value this number field can contain.
     * @type {number}
     * @protected
     */
    this.max_ = null;

    /**
     * The HTML input element.
     * @type {HTMLElement}
     * @protected
     */
    this.htmlInput_ = null;

    /**
     * The buttons wrapper element.
     * @type {HTMLElement}
     * @protected
     */
    this.buttonsWrapper_ = null;

    /**
     * True if the field's value is currently being edited via the UI.
     * @type {boolean}
     * @private
     */
    this.isBeingEdited_ = false;

    /**
     * True if the value currently displayed in the field's editory UI is valid.
     * @type {boolean}
     * @private
     */
    this.isValid_ = false;

    /**
     * Key down event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onKeyDownWrapper_ = null;

    /**
     * Input event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onInputWrapper_ = null;

    /**
     * Buttons click event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onButtonsClickWrapper_ = null;

    /**
     * Whether the field should consider the whole parent block to be its click
     * target.
     * @type {?boolean}
     */
    this.fullBlockClickTarget_ = false;

    /**
     * The workspace that this field belongs to.
     * @type {?WorkspaceSvg}
     * @protected
     */
    this.workspace_ = null;

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
    this.CURSOR = "text";

    if (value === Field.SKIP_SETUP) return;
    if (config) this.configure_(config);
    this.setValue(value);
    if (validator) this.setValidator(validator);
  }

  /**
   * @override
   */
  configure_(config) {
    super.configure_(config);
    if (typeof config.min === "number" || config.min === null) {
      this.min_ = config.min;
    }
    if (typeof config.max === "number" || config.max === null) {
      this.max_ = config.max;
    }
  }

  /**
   * @override
   */
  setValue(newValue) {
    const doLogging = false;

    if (this.isBeingEdited_ && this.htmlInput_) {
      this.isDirty_ = true;
      this.htmlInput_.value = newValue;
    }

    let validatedValue = this.doClassValidation_(newValue);
    // Class validators might accidentally forget to return, we'll ignore that.
    newValue = this.processValidation_(newValue, validatedValue);
    if (newValue instanceof Error) {
      doLogging && console.log("invalid class validation, return");
      return;
    }

    const localValidator = this.getValidator();
    if (localValidator) {
      validatedValue = localValidator.call(this, newValue);
      // Local validators might accidentally forget to return, we'll ignore
      // that.
      newValue = this.processValidation_(newValue, validatedValue);
      if (newValue instanceof Error) {
        doLogging && console.log("invalid local validation, return");
        return;
      }
    }
    const source = this.sourceBlock_;
    if (source && source.disposed) {
      doLogging && console.log("source disposed, return");
      return;
    }
    const oldValue = this.getValue();
    if (oldValue === newValue) {
      doLogging && console.log("same, doValueUpdate_, return");
      this.doValueUpdate_(newValue);
      return;
    }

    this.doValueUpdate_(newValue);
    if (source && Events.isEnabled()) {
      Events.fire(
        new (Events.get(Events.BLOCK_CHANGE))(
          source,
          "field",
          this.name || null,
          oldValue,
          newValue
        )
      );
    }
    if (this.isDirty_) {
      this.forceRerender();
    }
    doLogging && console.log(this.value_);
  }

  /**
   * @inheridoc
   */
  processValidation_(newValue, validatedValue) {
    if (validatedValue === false) {
      this.doValueInvalid_(newValue);
      if (this.isDirty_) {
        this.forceRerender();
      }
      return Error();
    }
    if (validatedValue !== undefined) {
      newValue = validatedValue;
    }
    return newValue;
  }

  /**
   * @inheridoc
   */
  doClassValidation_(opt_newValue) {
    if (opt_newValue === null) {
      return null;
    }

    const value = Number(opt_newValue);
    if (!isNaN(value)) {
      return value;
    }

    return false;
  }

  /**
   * @inheridoc
   */
  doValueInvalid_() {
    if (this.isBeingEdited_) {
      this.isValid_ = false;
      const oldValue = this.value_;
      // Revert value when the text becomes invalid.
      this.value_ = this.htmlInput_.untypedDefaultValue_;
      if (this.sourceBlock_ && Events.isEnabled()) {
        Events.fire(
          new (Events.get(Events.BLOCK_CHANGE))(
            this.sourceBlock_,
            "field",
            this.name || null,
            oldValue,
            this.value_
          )
        );
      }
    }
  }

  /**
   * @inheridoc
   */
  doValueUpdate_(newValue) {
    super.doValueUpdate_(newValue);
    this.isValid_ = true;
  }

  /**
   * @inheridoc
   */
  applyColour() {
    if (this.sourceBlock_ && this.getConstants().FULL_BLOCK_FIELDS) {
      this.sourceBlock_.pathObject.svgPath.setAttribute(
        "fill",
        this.getConstants().FIELD_BORDER_RECT_COLOUR
      );
    }
  }

  /**
   * @inheridoc
   */
  render_() {
    super.render_();
    // This logic is done in render_ rather than doValueInvalid_ or
    // doValueUpdate_ so that the code is more centralized.
    if (this.isBeingEdited_) {
      this.resizeEditor_();
      const htmlInput = /** @type {!TimecodeInput} */ (this.htmlInput_);
      if (!this.isValid_) {
        utils.dom.addClass(htmlInput, "blocklyInvalidInput");
        utils.aria.setState(htmlInput, utils.aria.State.INVALID, true);
      } else {
        utils.dom.removeClass(htmlInput, "blocklyInvalidInput");
        utils.aria.setState(htmlInput, utils.aria.State.INVALID, false);
      }
    }
  }

  /**
   * Sets the minimum value this field can contain. Updates the value to
   * reflect.
   * @param {?(number|string|undefined)} min Minimum value.
   */
  setMin(min) {
    if (min === null) {
      this.min_ = null;
    } else {
      min = Number(min);
      if (!isNaN(min)) {
        this.min_ = min;
      }
    }
    this.setValue(this.getValue());
  }

  /**
   * Returns the current minimum value this field can contain. Default is
   * 0.
   * @return {number} The current minimum value this field can contain.
   */
  getMin() {
    return this.min_;
  }

  /**
   * Sets the maximum value this field can contain. Updates the value to
   * reflect.
   * @param {?(number|string|undefined)} max Maximum value.
   */
  setMax(max) {
    if (max === null) {
      this.max_ = null;
    } else {
      max = Number(max);
      if (!isNaN(max)) {
        this.max_ = max;
      }
    }
    this.setValue(this.getValue());
  }

  /**
   * Returns the current maximum value this field can contain. Default is
   * null.
   * @return {number} The current maximum value this field can contain.
   */
  getMax() {
    return this.max_;
  }

  /**
   * @inheridoc
   */
  showEditor_() {
    this.workspace_ = /** @type {!BlockSvg} */ (this.sourceBlock_).workspace;

    WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_.bind(this));
    this.widgetCreate_();
    this.isBeingEdited_ = true;

    this.htmlInput_.focus({ preventScroll: true });
  }

  /**
   * Create the input editor widget.
   * @protected
   */
  widgetCreate_() {
    Events.setGroup(true);
    const div = WidgetDiv.getDiv();

    utils.dom.addClass(this.getClickTarget_(), "editing");

    this.htmlInput_ = document.createElement("timecode-input");
    this.htmlInput_.className = "blocklyHtmlInput";
    const scale = this.workspace_.getScale();
    const fontSize = this.getConstants().FIELD_TEXT_FONTSIZE * scale + "pt";
    div.style.fontSize = fontSize;
    this.htmlInput_.style.fontSize = fontSize;
    let borderRadius = FieldTimecode.BORDERRADIUS * scale + "px";

    if (this.fullBlockClickTarget_) {
      const bBox = this.getScaledBBox();

      // Override border radius.
      borderRadius = (bBox.bottom - bBox.top) / 2 + "px";
      // Pull stroke colour from the existing shadow block
      const strokeColour = this.sourceBlock_.getParent()
        ? this.sourceBlock_.getParent().style.colourTertiary
        : this.sourceBlock_.style.colourTertiary;
      this.htmlInput_.style.border = 1 * scale + "px solid " + strokeColour;
      div.style.borderRadius = borderRadius;
      div.style.transition = "box-shadow 0.25s ease 0s";
      if (this.getConstants().FIELD_TEXTINPUT_BOX_SHADOW) {
        div.style.boxShadow =
          "rgba(255, 255, 255, 0.3) 0 0 0 " + 4 * scale + "px";
      }
    }
    this.htmlInput_.style.borderRadius = borderRadius;

    div.appendChild(this.htmlInput_);

    this.buttonsWrapper_ = document.createElement("div");
    this.buttonsWrapper_.className = "blocklyTimecodeButtonsWrapper";

    const clear_btn = document.createElement("button");
    clear_btn.dataset.action = "clear";
    clear_btn.innerHTML = ClearIcon;
    this.buttonsWrapper_.appendChild(clear_btn);

    const in_btn = document.createElement("button");
    in_btn.dataset.action = "in";
    in_btn.innerHTML = InIcon;
    this.buttonsWrapper_.appendChild(in_btn);

    const out_btn = document.createElement("button");
    out_btn.dataset.action = "out";
    out_btn.innerHTML = OutIcon;
    this.buttonsWrapper_.appendChild(out_btn);

    div.appendChild(this.buttonsWrapper_);

    this.htmlInput_.value = this.htmlInput_.defaultValue = this.value_;
    this.htmlInput_.untypedDefaultValue_ = this.value_;
    this.htmlInput_.oldValue_ = this.htmlInput_.value;

    this.resizeEditor_();

    this.bindInputEvents_();
    this.bindButtonEvents_();
  }

  /**
   * Closes the editor, saves the results, and disposes of any events or
   * DOM-references belonging to the editor.
   * @protected
   */
  widgetDispose_() {
    // Non-disposal related things that we do when the editor closes.
    this.isBeingEdited_ = false;
    this.isValid_ = true;
    // Make sure the field's node matches the field's internal value.
    this.forceRerender();
    Events.setGroup(false);

    // Actual disposal.
    this.unbindInputEvents_();
    this.unbindButtonEvents_();
    const style = WidgetDiv.getDiv().style;
    style.width = "auto";
    style.height = "auto";
    style.fontSize = "";
    style.transition = "";
    style.boxShadow = "";
    this.htmlInput_ = null;
    this.buttonsWrapper_ = null;

    utils.dom.removeClass(this.getClickTarget_(), "editing");
  }

  /**
   * Bind handlers for user input on the input field's editor.
   * @protected
   */
  bindInputEvents_() {
    // Trap Enter without IME and Esc to hide.
    this.onKeyDownWrapper_ = browserEvents.bind(
      this.htmlInput_,
      "keydown",
      this,
      this.onHtmlInputKeyDown_
    );
    // Resize after every input change.
    this.onInputWrapper_ = browserEvents.bind(
      this.htmlInput_,
      "input",
      this,
      this.onHtmlInputChange_
    );
  }

  /**
   * Unbind handlers for user input and workspace size changes.
   * @protected
   */
  unbindInputEvents_() {
    if (this.onKeyDownWrapper_) {
      browserEvents.unbind(this.onKeyDownWrapper_);
      this.onKeyDownWrapper_ = null;
    }
    if (this.onInputWrapper_) {
      browserEvents.unbind(this.onInputWrapper_);
      this.onInputWrapper_ = null;
    }
  }

  /**
   * Bind handlers on the buttons of the field's editor.
   * @protected
   */
  bindButtonEvents_() {
    this.onButtonsClickWrapper_ = browserEvents.bind(
      this.buttonsWrapper_,
      "click",
      this,
      this.onButtonsClick_
    );
  }

  /**
   * Unbind handlers on the buttons of the field's editor.
   * @protected
   */
  unbindButtonEvents_() {
    if (this.onButtonsClickWrapper_) {
      browserEvents.unbind(this.onButtonsClickWrapper_);
      this.onButtonsClickWrapper_ = null;
    }
  }

  /**
   * Handle key down to the editor.
   * @param {!Event} e Keyboard event.
   * @protected
   */
  onHtmlInputKeyDown_(e) {
    if (e.keyCode === utils.KeyCodes.ENTER) {
      WidgetDiv.hide();
      DropDownDiv.hideWithoutAnimation();
    } else if (e.keyCode === utils.KeyCodes.ESC) {
      this.setValue(this.htmlInput_.untypedDefaultValue_);
      WidgetDiv.hide();
      DropDownDiv.hideWithoutAnimation();
    } else if (e.keyCode === utils.KeyCodes.TAB) {
      WidgetDiv.hide();
      DropDownDiv.hideWithoutAnimation();
      this.sourceBlock_.tab(this, !e.shiftKey);
      e.preventDefault();
    }
  }

  /**
   * Handle a change to the editor.
   * @private
   */
  onHtmlInputChange_() {
    const value = this.htmlInput_.value;
    if (value !== this.htmlInput_.oldValue_) {
      this.htmlInput_.oldValue_ = value;

      this.setValue(value);
      this.forceRerender();
      this.resizeEditor_();
    }
  }

  /**
   * Handle a click on a button in the editor.
   * @private
   */
  onButtonsClick_(evt) {
    if (!this.htmlInput_ || !evt.target.matches("button[data-action]")) return;

    const action = evt.target.dataset.action;
    switch (action) {
      case "clear":
        this.setValue(null);
        break;

      case "in":
        {
          const source = this.sourceBlock_;
          if (source && source.disposed) {
            return;
          }

          Events.fire(
            new (Events.get(Events.TIMECODE_VALUE_IN))(
              source,
              this.name || null
            )
          );
        }
        break;

      case "out":
        {
          const source = this.sourceBlock_;
          if (source && source.disposed) {
            return;
          }

          Events.fire(
            new (Events.get(Events.TIMECODE_VALUE_OUT))(
              source,
              this.name || null,
              this.getValue()
            )
          );
        }
        break;
    }
  }

  /**
   * Resize the editor to fit the text.
   * @protected
   */
  resizeEditor_() {
    const div = WidgetDiv.getDiv();
    const bBox = this.getScaledBBox();
    div.style.width = bBox.right - bBox.left + "px";
    div.style.height = bBox.bottom - bBox.top + "px";

    // In RTL mode block fields and LTR input fields the left edge moves,
    // whereas the right edge is fixed.  Reposition the editor.
    const x = this.sourceBlock_.RTL ? bBox.right - div.offsetWidth : bBox.left;
    const xy = new utils.Coordinate(x, bBox.top);

    div.style.left = xy.x + "px";
    div.style.top = xy.y + "px";
  }

  /**
   * @inheridoc
   */
  isTabNavigable() {
    return true;
  }

  /**
   * @inheridoc
   */
  getText_() {
    if (this.isBeingEdited_ && this.htmlInput_) {
      // We are currently editing, return the HTML input value instead.
      return this.htmlInput_.formattedValue;
    }
    return TimecodeInput.formatValue(this.getValue());
  }

  /**
   * @inheridoc
   */
  static fromJson(options) {
    // `this` might be a subclass of FieldTimecode if that class doesn't override
    // the static fromJson method.
    return new this(options["value"], undefined, options);
  }
}

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
FieldTimecode.prototype.DEFAULT_VALUE = null;

/**
 * Pixel size of input border radius.
 * Should match blocklyText's border-radius in CSS.
 */
FieldTimecode.BORDERRADIUS = 4;

/**
 * Custom CSS.
 */
Css.register(
  `
  timecode-input.blocklyHtmlInput {
    overflow: hidden;
  }
  timecode-input.blocklyHtmlInput::part(input) {
    width: 100%;
    height: 100%;
    text-align: center;
    border: none;
    box-sizing: border-box;
  }

  .blocklyTimecodeButtonsWrapper {
    position: absolute;
    left: 0;
    bottom: 100%;
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: center;
  }
  .blocklyTimecodeButtonsWrapper button {
    display: flex;
    width: 1em;
    height: 1em;
    margin-bottom: -1px;
    padding: 0.15em;
    border: 0.675px solid rgb(172, 124, 2);
    align-items: center;
    justify-content: center;
    color: #000;
    background-color: #fff;
    box-sizing: border-box;
  }
  .blocklyTimecodeButtonsWrapper button:hover {
    background-color: #ccc;
  }
  .blocklyTimecodeButtonsWrapper button:not(:first-child) {
    border-left: 0;
  }
  .blocklyTimecodeButtonsWrapper button svg {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  `
);

fieldRegistry.register("field_timecode", FieldTimecode);
