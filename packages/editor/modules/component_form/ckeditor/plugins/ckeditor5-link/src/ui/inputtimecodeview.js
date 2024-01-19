import { InputView } from "@ckeditor/ckeditor5-ui";
import "timecode-input";

import "../../theme/inputtimecodeview.scss";

/**
 * The timecode input view class.
 */
export default class InputTimecodeView extends InputView {
  /**
   * Creates an instance of the input view.
   *
   * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
   * @param {Object} [options] The options of the input.
   * @param {Number} [options.min] The value of the `min` DOM attribute (the lowest accepted value).
   * @param {Number} [options.max] The value of the `max` DOM attribute (the highest accepted value).
   */
  constructor(locale, { min, max } = {}) {
    super(locale);

    const bind = this.bindTemplate;

    /**
     * The value of the `min` DOM attribute (the lowest accepted value) set on the {@link #element}.
     *
     * @observable
     * @default undefined
     * @member {Number} #min
     */
    this.set("min", min);

    /**
     * The value of the `max` DOM attribute (the highest accepted value) set on the {@link #element}.
     *
     * @observable
     * @default undefined
     * @member {Number} #max
     */
    this.set("max", max);

    this.inputMode = null;

    // extendTemplate doesn't allow changing the tag.
    this.template.tag = "timecode-input";

    this.extendTemplate({
      attributes: {
        class: ["ck-input-timecode"],
        min: bind.to("min"),
        max: bind.to("max"),
      },
    });
  }

  /**
   * @inheritdoc
   */
  _updateIsEmpty() {
    this.isEmpty = this.element.value === null;
  }
}
