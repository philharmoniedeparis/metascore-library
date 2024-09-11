import {
  browserEvents,
  Events,
  Field,
  fieldRegistry,
  utils,
  WidgetDiv,
  DropDownDiv,
} from "blockly/core";
import "./inputs/multiselect";

/**
 * Class for an editable multiselect field.
 * @extends {Field}
 */
export default class FieldMultiselect extends Field {
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
     * Whether to display a search field.
     * @type {boolean}
     * @protected
     */
    this.searchable_ = false;

    /**
     * Whether to allow multiple values.
     * @type {boolean}
     * @protected
     */
    this.multiple_ = false;

    /**
     * The HTML input element.
     * @type {HTMLElement}
     * @protected
     */
    this.htmlInput_ = null;

    /**
     * The options.
     * @type {array|function}
     * @protected
     */
    this.options_ = [];

    /**
     * The cached options.
     * @type {array}
     * @protected
     */
    this.generatedOptions_ = [];

    /**
     * True if the field's value is currently being edited via the UI.
     * @type {boolean}
     * @private
     */
    this.isBeingEdited_ = false;

    /** Keydown event data. */
    this.onKeyDownWrapper_ = null;

    /** Change event data. */
    this.onChangeWrapper_ = null;

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
    this.CURSOR = "pointer";

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
    if (config.options) {
      this.options_ = config.options;
    }
    if (config.searchable) {
      this.searchable_ = config.searchable;
    }
    if (config.multiple) {
      this.multiple_ = config.multiple;
    }
  }

  getOptions(useCache) {
    if (Array.isArray(this.options_)) return this.options_;
    if (useCache && this.generatedOptions) return this.generatedOptions;

    this.generatedOptions_ = this.options_();
    validateOptions(this.generatedOptions_);
    return this.generatedOptions_;
  }

  /**
   * @override
   */
  setValue(newValue, fireChangeEvent = true) {
    super.setValue(newValue, fireChangeEvent);

    if (this.isBeingEdited_ && this.htmlInput_) {
      this.htmlInput_.value = newValue;
    }
  }

  /**
   * @inheridoc
   */
  render_() {
    super.render_();

    if (this.isBeingEdited_) {
      this.resizeEditor_();
    }
  }

  /**
   * @inheridoc
   */
  showEditor_() {
    this.workspace_ = /** @type {!BlockSvg} */ (this.sourceBlock_).workspace;

    WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_.bind(this));
    this.htmlInput_ = this.widgetCreate_();
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

    const htmlInput = document.createElement("metascore-multiselect");
    htmlInput.multiple = this.multiple_;
    htmlInput.searchable = this.searchable_;
    htmlInput.options = this.getOptions(true);
    htmlInput.className = "blocklyHtmlInput";
    const scale = this.workspace_.getScale();
    const fontSize = this.getConstants().FIELD_TEXT_FONTSIZE * scale + "pt";
    div.style.fontSize = fontSize;
    htmlInput.style.fontSize = fontSize;
    let borderRadius = FieldMultiselect.BORDERRADIUS * scale + "px";

    htmlInput.style.borderRadius = borderRadius;

    div.appendChild(htmlInput);

    htmlInput.value = this.value_;
    htmlInput.untypedDefaultValue_ = this.value_;

    this.resizeEditor_();

    this.bindInputEvents_(htmlInput);

    return htmlInput;
  }

  /**
   * Closes the editor, saves the results, and disposes of any events or
   * DOM-references belonging to the editor.
   * @protected
   */
  widgetDispose_() {
    // Non-disposal related things that we do when the editor closes.
    this.isBeingEdited_ = false;
    // Make sure the field's node matches the field's internal value.
    this.forceRerender();

    if (
      this.sourceBlock_ &&
      Events.isEnabled() &&
      this.valueWhenEditorWasOpened_ !== null &&
      this.valueWhenEditorWasOpened_ !== this.value_
    ) {
      // When closing a field input widget, fire an event indicating that the
      // user has completed a sequence of changes. The value may have changed
      // multiple times while the editor was open, but this will fire an event
      // containing the value when the editor was opened as well as the new one.
      console.log(this.value_, this.htmlInput_.value);
      Events.fire(
        new (Events.get(Events.BLOCK_CHANGE))(
          this.sourceBlock_,
          "field",
          this.name || null,
          this.valueWhenEditorWasOpened_,
          this.value_
        )
      );
      this.valueWhenEditorWasOpened_ = null;
    }

    Events.setGroup(false);

    // Actual disposal.
    this.unbindInputEvents_();
    const style = WidgetDiv.getDiv().style;
    style.width = "auto";
    style.height = "auto";
    style.fontSize = "";
    style.transition = "";
    style.boxShadow = "";
    this.htmlInput_ = null;

    const clickTarget = this.getClickTarget_();
    if (!clickTarget) throw new Error("A click target has not been set.");
    utils.dom.removeClass(clickTarget, "editing");
  }

  bindInputEvents_(htmlInput) {
    // Trap Enter without IME and Esc to hide.
    this.onKeyDownWrapper_ = browserEvents.conditionalBind(
      htmlInput,
      "keydown",
      this,
      this.onHtmlInputKeyDown_
    );
    // Resize after every input change.
    this.onChangeWrapper_ = browserEvents.conditionalBind(
      htmlInput,
      "change",
      this,
      this.onHtmlInputChange_
    );
  }

  /** Unbind handlers for user input and workspace size changes. */
  unbindInputEvents_() {
    if (this.onKeyDownWrapper_) {
      browserEvents.unbind(this.onKeyDownWrapper_);
      this.onKeyDownWrapper_ = null;
    }
    if (this.onChangeWrapper_) {
      browserEvents.unbind(this.onChangeWrapper_);
      this.onChangeWrapper_ = null;
    }
  }

  /**
   * Handle a change to the editor.
   */
  onHtmlInputChange_() {
    // Intermediate value changes from user input are not confirmed until the
    // user closes the editor, and may be numerous. Inhibit reporting these as
    // normal block change events, and instead report them as special
    // intermediate changes that do not get recorded in undo history.
    const oldValue = this.value_;
    // Change the field's value without firing the normal change event.
    this.setValue(this.htmlInput_.value, false);
    if (this.sourceBlock_ && Events.isEnabled() && this.value_ !== oldValue) {
      // Fire a special event indicating that the value changed but the change
      // isn't complete yet and normal field change listeners can wait.
      Events.fire(
        new (Events.get(Events.BLOCK_FIELD_INTERMEDIATE_CHANGE))(
          this.sourceBlock_,
          this.name || null,
          oldValue,
          this.value_
        )
      );
    }
  }

  /**
   * Handle key down to the editor.
   *
   * @param e Keyboard event.
   */
  onHtmlInputKeyDown_(e) {
    console.log("onHtmlInputKeyDown_");
    if (e.key === "Escape") {
      this.setValue(this.htmlInput_.untypedDefaultValue_, false);
      WidgetDiv.hide();
      DropDownDiv.hideWithoutAnimation();
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
      return this.htmlInput_.value;
    }
    return "getText_";
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
 * Pixel size of input border radius.
 * Should match blocklyText's border-radius in CSS.
 */
FieldMultiselect.BORDERRADIUS = 4;

/**
 * Copied with slight modification from blockly.
 */
const validateOptions = function (options) {
  if (!Array.isArray(options)) {
    throw TypeError("FieldMultiselect options must be an array.");
  }
  if (!options.length) {
    throw TypeError("FieldMultiselect options must not be an empty array.");
  }
  let foundError = false;
  for (let i = 0; i < options.length; i++) {
    const tuple = options[i];
    if (!Array.isArray(tuple)) {
      foundError = true;
      console.error(
        "Invalid option[" +
          i +
          "]: Each FieldMultiselect option must be an " +
          "array. Found: ",
        tuple
      );
    } else if (typeof tuple[1] !== "string") {
      foundError = true;
      console.error(
        "Invalid option[" +
          i +
          "]: Each FieldMultiselect option id must be " +
          "a string. Found " +
          tuple[1] +
          " in: ",
        tuple
      );
    }
  }
  if (foundError) {
    throw TypeError("Found invalid FieldMultiselect options.");
  }
};

fieldRegistry.register("field_multiselect", FieldMultiselect);
