import LinkFormViewBase from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import {
  LabeledFieldView,
  createLabeledDropdown,
  addListToDropdown,
  Model,
} from "@ckeditor/ckeditor5-ui/src/index";
import { Collection } from "@ckeditor/ckeditor5-utils/src/index";

export default class LinkFormView extends LinkFormViewBase {
  render() {
    super.render();

    const extraChildViews = [this.typeInputView];

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

  _createFormChildren(manualDecorators) {
    this.typeInputView = this._createTypeInput();

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

    const children = super._createFormChildren(manualDecorators);

    children.add(this.typeInputView, 0);

    //let index = children.getIndex(this.urlInputView);

    return children;
  }
}
