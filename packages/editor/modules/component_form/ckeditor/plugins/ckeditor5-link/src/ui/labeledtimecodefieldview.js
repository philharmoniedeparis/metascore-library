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
   * Creates an instance of the input view.
   *
   * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
   * @param {Object} [options] The options of the input.
   * @param {Number} [options.min] The value of the `min` DOM attribute (the lowest accepted value).
   * @param {Number} [options.max] The value of the `max` DOM attribute (the highest accepted value).
   */
  constructor(locale) {
    super(locale, createLabeledInputTimecode);

    this.extendTemplate({
      attributes: {
        class: ["ck-labeled-field-view_timecode"],
      },
    });
  }

  render() {
    const locale = this.locale;
    const t = locale.t;
    const { time: mediaTime, seekTo: seekMediaTo } = useModule("media_player");

    super.render();

    const in_button = new ButtonView(locale);
    in_button.set({
      icon: inIcon,
      tooltip: t("Set value to current media time"),
    });
    in_button.on("execute", () => {
      this.fieldView.value = unref(mediaTime);
    });

    const out_button = new ButtonView(locale);
    out_button.set({
      icon: outIcon,
      tooltip: t("Set current media time to this value"),
    });
    out_button.on("execute", () => {
      seekMediaTo(this.fieldView.value);
    });

    const clear_button = new ButtonView(locale);
    clear_button.set({
      icon: clearIcon,
      tooltip: t("Clear value"),
    });
    clear_button.on("execute", () => {
      this.fieldView.value = null;
    });

    const toolbar = new ToolbarView(locale);
    toolbar.items.addMany([in_button, out_button, clear_button]);
    toolbar.render();

    this.element.appendChild(toolbar.element);
  }
}
