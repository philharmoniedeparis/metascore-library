import { LabeledFieldView } from "@ckeditor/ckeditor5-ui/src";
import { ButtonView } from "@ckeditor/ckeditor5-ui/src";
import { ToolbarView } from "@ckeditor/ckeditor5-ui/src";
import { useModule } from "@metascore-library/core/services/module-manager";
import { unref } from "vue";
import { createLabeledInputTimecode } from "./utils";

import clearIcon from "../../theme/icons/clear.svg";
import inIcon from "../../theme/icons/in.svg";
import outIcon from "../../theme/icons/out.svg";

import "../../theme/labeledtimecodefield.scss";

/**
 * The labeled timecode field view class.
 */
export default class LabeledTimecodeFieldView extends LabeledFieldView {
  /**
   * Creates an instance of the labeled field view.
   *
   * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
   * @param {Object} [options] The options of the input.
   * @param {Boolean} [options.in_button=true] Whether to add the 'in' button.
   * @param {Boolean} [options.out_button=true] Whether to add the 'out' button.
   * @param {Boolean} [options.clear_button=true] Whether to add the 'clear' button.
   */
  constructor(
    locale,
    { in_button = true, out_button = true, clear_button = true } = {}
  ) {
    super(locale, createLabeledInputTimecode);

    const t = locale.t;
    const { time: mediaTime, seekTo: seekMediaTo } = useModule("media_player");

    this._buttons = [];

    if (in_button) {
      this.inButton = new ButtonView(locale);
      this.inButton.set({
        icon: inIcon,
        tooltip: t("Set value to current media time"),
      });
      this.inButton.on("execute", () => {
        this.fieldView.value = unref(mediaTime);
        this.fieldView.fire("input");
      });
      this._buttons.push(this.inButton);
    }
    if (out_button) {
      this.outButton = new ButtonView(locale);
      this.outButton.set({
        icon: outIcon,
        tooltip: t("Set current media time to this value"),
      });
      this.outButton.on("execute", () => {
        seekMediaTo(this.fieldView.value);
      });
      this._buttons.push(this.outButton);
    }
    if (clear_button) {
      this.clearButton = new ButtonView(locale);
      this.clearButton.set({
        icon: clearIcon,
        tooltip: t("Clear value"),
      });
      this.clearButton.on("execute", () => {
        this.fieldView.value = null;
        this.fieldView.fire("input");
      });
      this._buttons.push(this.clearButton);
    }

    this.extendTemplate({
      attributes: {
        class: ["ck-labeled-field-view_timecode"],
      },
    });
  }

  render() {
    super.render();

    if (this._buttons.length > 0) {
      const locale = this.locale;

      const toolbar = new ToolbarView(locale);
      toolbar.items.addMany(this._buttons);
      toolbar.render();

      this.element.appendChild(toolbar.element);
    }
  }
}
