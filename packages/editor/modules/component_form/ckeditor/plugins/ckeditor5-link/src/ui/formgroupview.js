import { View } from "@ckeditor/ckeditor5-ui";

import "../../theme/formgroup.scss";

export default class FormGroupView extends View {
  /**
   * Creates an instance of the form group class.
   *
   * @param {module:utils/locale~Locale} locale The locale instance.
   * @param {Object} options
   * @param {Array.<module:ui/view~View>} options.children
   * @param {String} [options.class]
   * DOM attributes and gets described by the label.
   */
  constructor(locale, options = {}) {
    super(locale);

    const bind = this.bindTemplate;

    /**
     * Controls whether the groupis visible. Visible by default, groups are hidden
     * using a CSS class.
     *
     * @observable
     * @default true
     * @member {Boolean} #isVisible
     */
    this.set("isVisible", true);

    /**
     * An additional CSS class added to the {@link #element}.
     *
     * @observable
     * @member {String} #class
     */
    this.set("class", options.class || null);

    /**
     * A collection of row items (buttons, dropdowns, etc.).
     *
     * @readonly
     * @member {module:ui/viewcollection~ViewCollection}
     */
    this.children = this.createCollection();

    if (options.children) {
      options.children.forEach((child) => this.children.add(child));
    }

    /**
     * The role property reflected by the `role` DOM attribute of the {@link #element}.
     *
     * **Note**: Used only when a `labelView` is passed to constructor `options`.
     *
     * @private
     * @observable
     * @member {String} #role
     */
    this.set("_role", null);

    this.setTemplate({
      tag: "div",
      attributes: {
        class: [
          "ck",
          "ck-form__group",
          bind.to("class"),
          bind.if("isVisible", "ck-hidden", (value) => !value),
        ],
        role: bind.to("_role"),
      },
      children: this.children,
    });
  }
}
