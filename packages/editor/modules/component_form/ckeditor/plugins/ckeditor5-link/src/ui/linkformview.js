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
  getTypeDefinitions,
  getScenarioLabels,
  getScenarioDefinitions,
} from "./utils";
import FormGroupView from "./formgroupview";

import "../../theme/linkform.scss";

export default class LinkFormView extends LinkFormViewBase {
  /**
   * @inheritDoc
   */
  constructor(locale, linkCommand) {
    super(locale, linkCommand);

    /**
     * The link type
     *
     * @observable
     * @member {String} #type
     */
    this.set("type", undefined);

    /**
     * A collection of link parameters.
     *
     * @protected
     * @observable
     * @member {Object} #params
     */
    this.set("params", {});

    this.bind("type").to(linkCommand);
    this.bind("params").to(linkCommand);

    this.on("change:type", () => {
      this.params = {};
    });

    this.on("change:params", () => {
      this._updateValue();
    });
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
      this.type = evt.source._typeValue;
    });
    dropdown.bind("isEmpty").to(this, "type", (value) => !value);

    addListToDropdown(dropdown.fieldView, getTypeDefinitions(this));

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

    this.playExcerptInputView = new SwitchButtonView(locale);
    this.playExcerptInputView.set({
      label: t("Excerpt"),
      withText: true,
    });
    this.playExcerptInputView
      .bind("isOn")
      .to(this, "params", (value) => !!value?.excerpt);
    this.playExcerptInputView.on("execute", () => {
      this.params = {
        ...this.params,
        excerpt: !this.params?.excerpt,
      };
    });

    this.playStartInputView = new LabeledFieldView(
      locale,
      createLabeledInputNumber
    );
    this.playStartInputView.set({
      label: t("Start time"),
    });
    this.playStartInputView.fieldView
      .bind("value")
      .to(this, "params", (value) => value?.start);
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

    this.playEndInputView = new LabeledFieldView(
      locale,
      createLabeledInputNumber
    );
    this.playEndInputView.set({
      label: t("End time"),
    });
    this.playEndInputView.fieldView
      .bind("value")
      .to(this, "params", (value) => value?.stop);
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

    const scenarioLabels = getScenarioLabels();
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
      .to(this, "params", (value) => {
        return scenarioLabels[value?.scenario];
      });
    this.playScenarioInputView.fieldView.on("execute", (evt) => {
      this.params = {
        ...this.params,
        scenario: evt.source._scenarioId,
      };
    });
    this.playScenarioInputView
      .bind("isEmpty")
      .to(this, "params", (value) => !value?.scenario);
    this.playScenarioInputView.extendTemplate({
      attributes: {
        class: bind.if("params", "ck-hidden", (value) => !value?.excerpt),
      },
    });
    addListToDropdown(
      this.playScenarioInputView.fieldView,
      getScenarioDefinitions(this)
    );

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
      .to(this, "params", (value) => !!value?.highlight);
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

    this.seekTimeInputView = new LabeledFieldView(
      locale,
      createLabeledInputNumber
    );
    this.seekTimeInputView.set({
      label: t("Time"),
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

    this.pageBlockInputView = new LabeledFieldView(
      locale,
      createLabeledInputNumber
    );
    this.pageBlockInputView.set({
      label: t("Block"),
    });

    this.pagePageInputView = new LabeledFieldView(
      locale,
      createLabeledInputNumber
    );
    this.pagePageInputView.set({
      label: t("Page"),
    });

    const inputs = new FormGroupView(locale, {
      children: [this.pageBlockInputView, this.pagePageInputView],
    });
    inputs.bind("isVisible").to(this, "type", (value) => value === "page");

    return inputs;
  }

  /**
   * @inheritDoc
   */
  _createFormChildren(manualDecorators) {
    const children = super._createFormChildren(manualDecorators);

    /*
      show/hide/toggle block
          bloc
          action
      scenario
          name
      fullscreen
          action
      url
     */

    let index = 0;

    this.typeInputView = this._createTypeInput();
    children.add(this.typeInputView, index++);

    this._playInputsGroup = this._createPlayInputs();
    children.add(this._playInputsGroup, index++);

    this._seekInputsGroup = this._createSeekInputs();
    children.add(this._seekInputsGroup, index++);

    this._pageInputsGroup = this._createPageInputs();
    children.add(this._pageInputsGroup, index++);

    return children;
  }

  _updateValue() {
    if (this.type === "url") return;

    const type = this.type;
    const params = this.params;

    let value = `#${type}`;

    switch (this.type) {
      case "play":
        if (params?.excerpt) {
          value += `=${params.start},${params.end},${params.scenario}`;
        }
        break;
      case "seek":
        value += `=${params.time}`;
        break;
    }

    this.urlInputView.fieldView.value = value;
  }
}
