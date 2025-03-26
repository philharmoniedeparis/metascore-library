import { LinkFormView } from "ckeditor5";
import {
  LabeledFieldView,
  createLabeledDropdown,
  createLabeledInputNumber,
  addListToDropdown,
  SwitchButtonView,
  ButtonView,
} from "ckeditor5";
import {
  getTypeLabels,
  getComponentLabels,
  getToggleActionLabels,
  getFullscreenActionLabels,
  getDropdownDefinitions,
} from "./utils";
import FormGroupView from "./formgroupview";
import LabeledTimecodeFieldView from "./labeledtimecodefieldview";

import tipIcon from "../../theme/icons/tip.svg?raw";

import "../../theme/linkform.scss";

export default class CustomLinkFormView extends LinkFormView {
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
    this.set("params", {});

    this.on("change:type", (evt, name, value) => {
      this.urlInputView.fieldView.value = "";

      // Set action defaults.
      switch (value) {
        case "seek":
          this.params = {
            time: 0,
          };
          break;

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
          this.params = {};
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
      this._playInputsGroup,
      this._seekInputsGroup,
      this._pageInputsGroup,
      this._blockToggleInputsGroup,
      this._scenarioInputsGroup,
      this._fullscreenInputsGroup,
    ];

    this._focusables.addMany(extraChildViews, 0);

    extraChildViews.forEach((v) => {
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

    const dropdownDefinitions = getDropdownDefinitions(typeLabels);
    dropdownDefinitions.map((definition) => {
      definition.model.bind("isOn").to(this, "type", (value) => {
        return value === definition.model._value;
      });
    });
    addListToDropdown(dropdown.fieldView, dropdownDefinitions);

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
        // ck-hidden seems to cause focus/selection issues.
        // see https://github.com/philharmoniedeparis/metascore-library/issues/704
        class: bind.if("type", "ck-fake-hidden", (value) => value !== "url"),
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

    const dropdownDefinitions = getDropdownDefinitions(scenarioLabels);
    dropdownDefinitions.map((definition) => {
      definition.model.bind("isOn").to(this, "params", (value) => {
        return value?.scenario === definition.model._value;
      });
    });
    addListToDropdown(
      this.playScenarioInputView.fieldView,
      dropdownDefinitions
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
    this.seekTimeInputView = new LabeledTimecodeFieldView(locale, {
      clear_button: false,
    });
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
    const blockLabels = Object.fromEntries(
      Object.values(getComponentLabels("Block")).map((val) => [val, val])
    );
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
      .to(this, "params", (params) => params?.block);
    this.pageBlockInputView.fieldView.on("execute", (evt) => {
      this.params = {
        ...this.params,
        block: evt.source._value,
      };
    });
    this.pageBlockInputView
      .bind("isEmpty")
      .to(this, "params", (params) => !params?.block);

    const dropdownDefinitions = getDropdownDefinitions(blockLabels);
    dropdownDefinitions.map((definition) => {
      definition.model.bind("isOn").to(this, "params", (value) => {
        return value?.block === definition.model._value;
      });
    });
    addListToDropdown(this.pageBlockInputView.fieldView, dropdownDefinitions);

    // Index.
    this.pageIndexInputView = new LabeledFieldView(
      locale,
      createLabeledInputNumber
    );
    this.pageIndexInputView.set({
      label: t("Page"),
    });
    this.pageIndexInputView.fieldView.set({
      min: 1,
      step: 1,
    });
    this.pageIndexInputView.fieldView
      .bind("value")
      .to(this, "params", (params) => params?.index);
    this.pageIndexInputView.fieldView.on("input", () => {
      this.params = {
        ...this.params,
        index: parseInt(this.pageIndexInputView.fieldView.element.value),
      };
    });

    const inputs = new FormGroupView(locale, {
      children: [this.pageBlockInputView, this.pageIndexInputView],
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
  _createBlockToggleInputs() {
    const locale = this.locale;
    const t = locale.t;

    // Block.
    const blockLabels = Object.fromEntries(
      Object.values(getComponentLabels("Block")).map((val) => [val, val])
    );
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
      .to(this, "params", (params) => params?.name);
    this.toggleBlockInputView.fieldView.on("execute", (evt) => {
      this.params = {
        ...this.params,
        name: evt.source._value,
      };
    });
    this.toggleBlockInputView
      .bind("isEmpty")
      .to(this, "params", (params) => !params?.name);
    const nameDropdownDefinitions = getDropdownDefinitions(blockLabels);
    nameDropdownDefinitions.map((definition) => {
      definition.model.bind("isOn").to(this, "params", (value) => {
        return value?.name === definition.model._value;
      });
    });
    addListToDropdown(
      this.toggleBlockInputView.fieldView,
      nameDropdownDefinitions
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
    const actionDropdownDefinitions = getDropdownDefinitions(actionLabels);
    actionDropdownDefinitions.map((definition) => {
      definition.model.bind("isOn").to(this, "params", (value) => {
        return value?.action === definition.model._value;
      });
    });
    addListToDropdown(
      this.toggleActionInputView.fieldView,
      actionDropdownDefinitions
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
        return scenarioLabels[params?.slug];
      });
    this.scenarioScenarioInputView.fieldView.on("execute", (evt) => {
      this.params = {
        ...this.params,
        slug: evt.source._value,
      };
    });
    this.scenarioScenarioInputView
      .bind("isEmpty")
      .to(this, "params", (params) => !params?.slug);
    const idDropdownDefinitions = getDropdownDefinitions(scenarioLabels);
    idDropdownDefinitions.map((definition) => {
      definition.model.bind("isOn").to(this, "params", (value) => {
        return value?.slug === definition.model._value;
      });
    });
    addListToDropdown(
      this.scenarioScenarioInputView.fieldView,
      idDropdownDefinitions
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
    const actionDropdownDefinitions = getDropdownDefinitions(actionLabels);
    actionDropdownDefinitions.map((definition) => {
      definition.model.bind("isOn").to(this, "params", (value) => {
        return value?.action === definition.model._value;
      });
    });
    addListToDropdown(
      this.fullscreenActionInputView.fieldView,
      actionDropdownDefinitions
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
   * Creates the tip icon view.
   *
   * @private
   * @returns {IconView}
   */
  _createTipView() {
    const locale = this.locale;
    const t = locale.t;
    const view = new ButtonView(locale);

    view.set({
      icon: tipIcon,
      withText: false,
      tooltip: t(
        'TIP: Use the "behaviors" to program all the actions\nyou want when clicking on a text or an image!'
      ),
    });

    view.extendTemplate({
      attributes: {
        class: "ck-link__tip",
      },
    });

    return view;
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
    this._blockToggleInputsGroup = this._createBlockToggleInputs();
    this._scenarioInputsGroup = this._createScenarioInputs();
    this._fullscreenInputsGroup = this._createFullscreenInputs();
    this._tipView = this._createTipView();

    children.addMany(
      [
        this.typeInputView,
        this._playInputsGroup,
        this._seekInputsGroup,
        this._pageInputsGroup,
        this._blockToggleInputsGroup,
        this._scenarioInputsGroup,
        this._fullscreenInputsGroup,
      ],
      0
    );

    children.add(this._tipView);

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

    switch (type) {
      case "play":
        value = `#${type}`;
        if (params?.excerpt) {
          value += `=${params.start ?? ""}`;
          value += `,${params.end ?? ""}`;
          value += `,${params.scenario ?? ""}`;

          if (params?.highlight) {
            value += ",1";
          }
        }
        break;

      case "seek":
        value = `#${type}=${params.time}`;
        break;

      case "page":
        value = `#${type}=${params.block},${params.index}`;
        break;

      case "toggle":
        value = `#${params.action}Block=${params.name}`;
        break;

      case "scenario":
        value = `#scenario=${params.slug}`;
        break;

      case "fullscreen":
        value = `#${params.action}Fullscreen`;
        break;

      default:
        value = type ? `#${type}` : "";
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
