import LinkFormViewBase from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import {
  LabeledFieldView,
  createLabeledDropdown,
  createLabeledInputNumber,
  addListToDropdown,
  Model,
  SwitchButtonView,
} from "@ckeditor/ckeditor5-ui/src/index";
import { Collection } from "@ckeditor/ckeditor5-utils/src/index";

import "../../theme/linkform.scss";

export default class LinkFormView extends LinkFormViewBase {
  constructor(locale, linkCommand) {
    super(locale, linkCommand);

    this.set("type", "url");

    const bind = this.bindTemplate;
    this.extendTemplate({
      attributes: {
        "data-type": [bind.to("type")],
      },
    });
  }

  render() {
    super.render();

    const extraChildViews = [this.typeInputView, ...this._playInputs];

    extraChildViews.forEach((v) => {
      // Register the view as focusable.
      this._focusables.add(v);

      // Register the view in the focus tracker.
      this.focusTracker.add(v.element);
    });
  }

  _createTypeInput() {
    const t = this.locale.t;

    const items = new Collection();
    items.add({
      type: "button",
      model: new Model({
        _type: "play",
        withText: true,
        label: "Play",
      }),
    });
    items.add({
      type: "button",
      model: new Model({
        _type: "url",
        withText: true,
        label: "URL",
      }),
    });

    const labeledInput = new LabeledFieldView(
      this.locale,
      createLabeledDropdown
    );
    labeledInput.label = t("Type");
    addListToDropdown(labeledInput.fieldView, items);

    labeledInput.fieldView.buttonView.set({
      isOn: false,
      withText: true,
    });

    return labeledInput;
  }

  _createPlayInputs() {
    const inputs = this.createCollection();

    const playExerpt = this._createPlayExerptSwitch();
    inputs.add(playExerpt);

    const playStartTime = this._createTimeInput();
    inputs.add(playStartTime);

    const playEndTime = this._createTimeInput();
    inputs.add(playEndTime);

    return inputs;
  }

  _createTimeInput() {
    const t = this.locale.t;

    const labeledInput = new LabeledFieldView(
      this.locale,
      createLabeledInputNumber
    );
    labeledInput.label = t("Time");

    return labeledInput;
  }

  _createPlayExerptSwitch() {
    const switchButton = new SwitchButtonView(this.locale);

    switchButton.set({
      label: "Exerpt",
      withText: true,
    });

    return switchButton;
  }

  _createFormChildren(manualDecorators) {
    const children = super._createFormChildren(manualDecorators);

    /*
      play
      play exerpt
          start-time
          end-time
          scenario
          highlight
      pause
      stop
      seekTo
          time
      page
          bloc
          page
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

    this._playInputs = this._createPlayInputs();
    Array.from(this._playInputs).forEach((input) => {
      children.add(input, index++);
    });

    return children;
  }
}
