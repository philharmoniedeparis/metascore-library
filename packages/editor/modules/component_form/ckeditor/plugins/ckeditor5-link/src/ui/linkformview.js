import LinkFormViewBase from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import {
  LabeledFieldView,
  createLabeledDropdown,
  createLabeledInputNumber,
  addListToDropdown,
  SwitchButtonView,
} from "@ckeditor/ckeditor5-ui/src/index";
import {
  getTypeLabels,
  getComponentLabels,
  getToggleActionLabels,
  getFullscreenActionLabels,
  getDropdownDefinitions,
} from "./utils";
import FormGroupView from "./formgroupview";
import LabeledTimecodeFieldView from "./labeledtimecodefieldview";

import "../../theme/linkform.scss";

export default class LinkFormView extends LinkFormViewBase {
  /**
   * @inheritDoc
   */
  constructor(locale, linkCommand) {
    super(locale, linkCommand);

    const t = this.locale.t;

    /**
     * The link type
     *
     * @observable
     * @member {String} #type
     */
    this.set("type", null);

    /**
     * A collection of link parameters.
     *
     * @protected
     * @observable
     * @member {Object} #params
     */
    this.set("params", null);

    this.on("change:type", (evt, name, value) => {
      this.urlInputView.fieldView.value = "";

      switch (value) {
        case "toggle":
          this.params = {
            action: "show",
          };
          break;

        case "fullscreen":
          this.params = {
            action: "enter",
          };
          break;

        default:
          this.params = null;
      }
    });

    this.on("change:params", () => {
      this.updateValue();
    });

    // Add a placeholder to the URL field
    this.urlInputView.fieldView.placeholder = t("https://example.com");
  }

  /**
   * @inheritDoc
   */
  render() {
    super.render();

    const extraChildViews = [
      this.typeInputView,
      ...this._playInputsGroup.children,
      ...this._seekInputsGroup.children,
      ...this._pageInputsGroup.children,
    ];

    extraChildViews.forEach((v) => {
      // Register the view as focusable.
      this._focusables.add(v);

      // Register the view in the focus tracker.
      this.focusTracker.add(v.element);
    });
  }

  /**
   * Creates a labeled "type" input.
   *
   * @private
   * @returns {LabeledFieldView} Labeled field view instance.
   */
  _createTypeInput() {
    const t = this.locale.t;

    const typeLabels = getTypeLabels(this.t);
    const dropdown = new LabeledFieldView(this.locale, createLabeledDropdown);
    dropdown.set({
      label: t("Type"),
    });
    dropdown.fieldView.buttonView.set({
      isOn: false,
      withText: true,
    });
    dropdown.fieldView.buttonView.bind("label").to(this, "type", (value) => {
      return typeLabels[value];
    });
    dropdown.fieldView.on("execute", (evt) => {
      this.type = evt.source._value;
    });
    dropdown.bind("isEmpty").to(this, "type", (value) => !value);

    addListToDropdown(
      dropdown.fieldView,
      getDropdownDefinitions(typeLabels, this)
    );

    return dropdown;
  }

  /**
   * @inheritDoc
   */
  _createUrlInput() {
    const labeledInput = super._createUrlInput();

    // Hide the input when the type is not "url".
    const bind = this.bindTemplate;
    labeledInput.extendTemplate({
      attributes: {
        class: bind.if("type", "ck-hidden", (value) => value !== "url"),
      },
    });

    return labeledInput;
  }

  /**
   * Creates a group of inputs for "play" links.
   *
   * @private
   * @returns {FormGroupView} Form group view instance.
   */
  _createPlayInputs() {
    const locale = this.locale;
    const t = locale.t;
    const bind = this.bindTemplate;

    // Excerpt.
    this.playExcerptInputView = new SwitchButtonView(locale);
    this.playExcerptInputView.set({
      label: t("Excerpt"),
      withText: true,
    });
    this.playExcerptInputView
      .bind("isOn")
      .to(this, "params", (params) => !!params?.excerpt);
    this.playExcerptInputView.on("execute", () => {
      this.params = {
        ...this.params,
        excerpt: !this.params?.excerpt,
      };
    });

    // Start time.
    this.playStartInputView = new LabeledTimecodeFieldView(locale);
    this.playStartInputView.set({
      label: t("Start time"),
    });
    this.playStartInputView.fieldView
      .bind("value")
      .to(this, "params", (params) => params?.start);
    this.playStartInputView.fieldView.on("input", () => {
      this.params = {
        ...this.params,
        start: this.playStartInputView.fieldView.element.value,
      };
    });
    this.playStartInputView.extendTemplate({
      attributes: {
        class: bind.if("params", "ck-hidden", (value) => !value?.excerpt),
      },
    });

    // End time.
    this.playEndInputView = new LabeledTimecodeFieldView(locale);
    this.playEndInputView.set({
      label: t("End time"),
    });
    this.playEndInputView.fieldView
      .bind("value")
      .to(this, "params", (params) => params?.end);
    this.playEndInputView.fieldView.on("input", () => {
      this.params = {
        ...this.params,
        end: this.playEndInputView.fieldView.element.value,
      };
    });
    this.playEndInputView.extendTemplate({
      attributes: {
        class: bind.if("params", "ck-hidden", (value) => !value?.excerpt),
      },
    });

    // Scenario.
    const scenarioLabels = getComponentLabels("Scenario");
    this.playScenarioInputView = new LabeledFieldView(
      locale,
      createLabeledDropdown
    );
    this.playScenarioInputView.set({
      label: t("Scenario"),
    });
    this.playScenarioInputView.fieldView.buttonView.set({
      isOn: false,
      withText: true,
    });
    this.playScenarioInputView.fieldView.buttonView
      .bind("label")
      .to(this, "params", (params) => scenarioLabels[params?.scenario]);
    this.playScenarioInputView.fieldView.on("execute", (evt) => {
      this.params = {
        ...this.params,
        scenario: evt.source._value,
      };
    });
    this.playScenarioInputView
      .bind("isEmpty")
      .to(this, "params", (params) => !params?.scenario);
    this.playScenarioInputView.extendTemplate({
      attributes: {
        class: bind.if("params", "ck-hidden", (value) => !value?.excerpt),
      },
    });
    addListToDropdown(
      this.playScenarioInputView.fieldView,
      getDropdownDefinitions(scenarioLabels, this)
    );

    // Auto-highlight.
    this.playHighlightInputView = new SwitchButtonView(locale);
    this.playHighlightInputView.set({
      label: t("Auto-highlight"),
      withText: true,
      tooltip: t(
        "Highlight the link when the current media time is between its time limits"
      ),
    });
    this.playHighlightInputView
      .bind("isOn")
      .to(this, "params", (params) => !!params?.highlight);
    this.playHighlightInputView.on("execute", () => {
      this.params = {
        ...this.params,
        highlight: !this.params?.highlight,
      };
    });
    this.playHighlightInputView.extendTemplate({
      attributes: {
        class: bind.if("params", "ck-hidden", (value) => !value?.excerpt),
      },
    });

    const inputs = new FormGroupView(locale, {
      children: [
        this.playExcerptInputView,
        this.playStartInputView,
        this.playEndInputView,
        this.playScenarioInputView,
        this.playHighlightInputView,
      ],
    });
    inputs.bind("isVisible").to(this, "type", (value) => value === "play");

    return inputs;
  }

  /**
   * Creates a group of inputs for "seek" links.
   *
   * @private
   * @returns {FormGroupView} Form group view instance.
   */
  _createSeekInputs() {
    const locale = this.locale;
    const t = locale.t;

    // Time.
    this.seekTimeInputView = new LabeledTimecodeFieldView(locale);
    this.seekTimeInputView.set({
      label: t("Time"),
    });
    this.seekTimeInputView.fieldView
      .bind("value")
      .to(this, "params", (params) => params?.time);
    this.seekTimeInputView.fieldView.on("input", () => {
      this.params = {
        ...this.params,
        time: this.seekTimeInputView.fieldView.element.value,
      };
    });

    const inputs = new FormGroupView(locale, {
      children: [this.seekTimeInputView],
    });
    inputs.bind("isVisible").to(this, "type", (value) => value === "seek");

    return inputs;
  }

  /**
   * Creates a group of inputs for "page" links.
   *
   * @private
   * @returns {FormGroupView} Form group view instance.
   */
  _createPageInputs() {
    const locale = this.locale;
    const t = locale.t;

    // Block.
    const blockLabels = getComponentLabels("Block");
    this.pageBlockInputView = new LabeledFieldView(
      locale,
      createLabeledDropdown
    );
    this.pageBlockInputView.set({
      label: t("Block"),
    });
    this.pageBlockInputView.fieldView.buttonView.set({
      isOn: false,
      withText: true,
    });
    this.pageBlockInputView.fieldView.buttonView
      .bind("label")
      .to(this, "params", (params) => blockLabels[params?.block]);
    this.pageBlockInputView.fieldView.on("execute", (evt) => {
      this.params = {
        ...this.params,
        block: evt.source._value,
      };
    });
    this.pageBlockInputView
      .bind("isEmpty")
      .to(this, "params", (params) => !params?.block);
    addListToDropdown(
      this.pageBlockInputView.fieldView,
      getDropdownDefinitions(blockLabels, this)
    );

    // Page.
    this.pagePageInputView = new LabeledFieldView(
      locale,
      createLabeledInputNumber
    );
    this.pagePageInputView.set({
      label: t("Page"),
    });
    this.pagePageInputView.fieldView.set({
      min: 1,
      step: 1,
    });
    this.pagePageInputView.fieldView
      .bind("value")
      .to(this, "params", (params) => params?.page);
    this.pagePageInputView.fieldView.on("input", () => {
      this.params = {
        ...this.params,
        page: this.pagePageInputView.fieldView.element.value,
      };
    });

    const inputs = new FormGroupView(locale, {
      children: [this.pageBlockInputView, this.pagePageInputView],
    });
    inputs.bind("isVisible").to(this, "type", (value) => value === "page");

    return inputs;
  }

  /**
   * Creates a group of inputs for "(show|hide|toggle)Block" links.
   *
   * @private
   * @returns {FormGroupView} Form group view instance.
   */
  _createToggleInputs() {
    const locale = this.locale;
    const t = locale.t;

    // Block.
    const blockLabels = getComponentLabels("Block");
    this.toggleBlockInputView = new LabeledFieldView(
      locale,
      createLabeledDropdown
    );
    this.toggleBlockInputView.set({
      label: t("Block"),
    });
    this.toggleBlockInputView.fieldView.buttonView.set({
      isOn: false,
      withText: true,
    });
    this.toggleBlockInputView.fieldView.buttonView
      .bind("label")
      .to(this, "params", (params) => blockLabels[params?.block]);
    this.toggleBlockInputView.fieldView.on("execute", (evt) => {
      this.params = {
        ...this.params,
        block: evt.source._value,
      };
    });
    this.toggleBlockInputView
      .bind("isEmpty")
      .to(this, "params", (params) => !params?.block);
    addListToDropdown(
      this.toggleBlockInputView.fieldView,
      getDropdownDefinitions(blockLabels, this)
    );

    // Action.
    const actionLabels = getToggleActionLabels(t);
    this.toggleActionInputView = new LabeledFieldView(
      locale,
      createLabeledDropdown
    );
    this.toggleActionInputView.set({
      label: t("Action"),
    });
    this.toggleActionInputView.fieldView.buttonView.set({
      isOn: false,
      withText: true,
    });
    this.toggleActionInputView.fieldView.buttonView
      .bind("label")
      .to(this, "params", (params) => actionLabels[params?.action]);
    this.toggleActionInputView.fieldView.on("execute", (evt) => {
      this.params = {
        ...this.params,
        action: evt.source._value,
      };
    });
    this.toggleActionInputView
      .bind("isEmpty")
      .to(this, "params", (params) => !params?.action);
    addListToDropdown(
      this.toggleActionInputView.fieldView,
      getDropdownDefinitions(actionLabels, this)
    );

    const inputs = new FormGroupView(locale, {
      children: [this.toggleBlockInputView, this.toggleActionInputView],
    });
    inputs.bind("isVisible").to(this, "type", (value) => value === "toggle");

    return inputs;
  }

  /**
   * Creates a group of inputs for "scenario" links.
   *
   * @private
   * @returns {FormGroupView} Form group view instance.
   */
  _createScenarioInputs() {
    const locale = this.locale;
    const t = locale.t;

    // Scenario.
    const scenarioLabels = getComponentLabels("Scenario");
    this.scenarioScenarioInputView = new LabeledFieldView(
      locale,
      createLabeledDropdown
    );
    this.scenarioScenarioInputView.set({
      label: t("Scenario"),
    });
    this.scenarioScenarioInputView.fieldView.buttonView.set({
      isOn: false,
      withText: true,
    });
    this.scenarioScenarioInputView.fieldView.buttonView
      .bind("label")
      .to(this, "params", (params) => {
        return scenarioLabels[params?.id];
      });
    this.scenarioScenarioInputView.fieldView.on("execute", (evt) => {
      this.params = {
        ...this.params,
        id: evt.source._value,
      };
    });
    this.scenarioScenarioInputView
      .bind("isEmpty")
      .to(this, "params", (params) => !params?.id);
    addListToDropdown(
      this.scenarioScenarioInputView.fieldView,
      getDropdownDefinitions(scenarioLabels, this)
    );

    const inputs = new FormGroupView(locale, {
      children: [this.scenarioScenarioInputView],
    });
    inputs.bind("isVisible").to(this, "type", (value) => value === "scenario");

    return inputs;
  }

  /**
   * Creates a group of inputs for "(enter|exit|toggle)Fullscreen" links.
   *
   * @private
   * @returns {FormGroupView} Form group view instance.
   */
  _createFullscreenInputs() {
    const locale = this.locale;
    const t = locale.t;

    // Action.
    const actionLabels = getFullscreenActionLabels(t);
    this.fullscreenActionInputView = new LabeledFieldView(
      locale,
      createLabeledDropdown
    );
    this.fullscreenActionInputView.set({
      label: t("Action"),
    });
    this.fullscreenActionInputView.fieldView.buttonView.set({
      isOn: false,
      withText: true,
    });
    this.fullscreenActionInputView.fieldView.buttonView
      .bind("label")
      .to(this, "params", (params) => actionLabels[params?.action]);
    this.fullscreenActionInputView.fieldView.on("execute", (evt) => {
      this.params = {
        ...this.params,
        action: evt.source._value,
      };
    });
    this.fullscreenActionInputView
      .bind("isEmpty")
      .to(this, "params", (params) => !params?.action);
    addListToDropdown(
      this.fullscreenActionInputView.fieldView,
      getDropdownDefinitions(actionLabels, this)
    );

    const inputs = new FormGroupView(locale, {
      children: [this.fullscreenActionInputView],
    });
    inputs
      .bind("isVisible")
      .to(this, "type", (value) => value === "fullscreen");

    return inputs;
  }

  /**
   * @inheritDoc
   */
  _createFormChildren(manualDecorators) {
    const children = super._createFormChildren(manualDecorators);

    this.typeInputView = this._createTypeInput();
    this._playInputsGroup = this._createPlayInputs();
    this._seekInputsGroup = this._createSeekInputs();
    this._pageInputsGroup = this._createPageInputs();
    this._toggleInputsGroup = this._createToggleInputs();
    this._scenarioInputsGroup = this._createScenarioInputs();
    this._fullscreenInputsGroup = this._createFullscreenInputs();

    children.addMany(
      [
        this.typeInputView,
        this._playInputsGroup,
        this._seekInputsGroup,
        this._pageInputsGroup,
        this._toggleInputsGroup,
        this._scenarioInputsGroup,
        this._fullscreenInputsGroup,
      ],
      0
    );

    return children;
  }

  /**
   * Update the URL input value.
   */
  updateValue() {
    if (this.type === "url") return;

    const type = this.type;
    const params = this.params;

    let value = "";

    switch (this.type) {
      case "play":
        value = `#${type}`;
        if (params?.excerpt) {
          value += `=${params.start},${params.end},${params.scenario}`;
          if (params?.highlight) {
            value += ",1";
          }
        }
        break;

      case "seek":
        value = `#${type}=${params.time}`;
        break;

      case "page":
        value = `#${type}=${params.block},${params.page}`;
        break;

      case "toggle":
        value = `#${params.action}Block=${params.block}`;
        break;

      case "scenario":
        value = `#scenario=${params.scenario}`;
        break;

      case "fullscreen":
        value = `#${params.action}Fullscreen`;
        break;

      default:
        value = `#${type}`;
    }

    this.urlInputView.fieldView.value = value;

    this.fire("update");
  }
}

/**
 * Fired when the form view's value is updated.
 *
 * @event update
 */
