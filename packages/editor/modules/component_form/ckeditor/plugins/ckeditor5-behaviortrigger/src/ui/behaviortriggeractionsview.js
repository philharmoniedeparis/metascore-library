import {
  ButtonView,
  LabelView,
  View,
  ViewCollection,
  FocusCycler,
} from "@ckeditor/ckeditor5-ui";
import { FocusTracker, KeystrokeHandler } from "@ckeditor/ckeditor5-utils";
import { icons } from "@ckeditor/ckeditor5-core";

import "@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css";
import "../../theme/behaviortriggeractions.scss";

import removeBehaviorTriggerIcon from "../../theme/icons/removebehaviortrigger.svg";

/**
 * The link actions view class. This view displays the link preview, allows
 * unlinking or editing the link.
 *
 * @extends module:ui/view~View
 */
export default class BehaviorTriggerActionsView extends View {
  /**
   * @inheritDoc
   */
  constructor(locale) {
    super(locale);

    const t = locale.t;

    /**
     * Tracks information about DOM focus in the actions.
     *
     * @readonly
     * @member {module:utils/focustracker~FocusTracker}
     */
    this.focusTracker = new FocusTracker();

    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     *
     * @readonly
     * @member {module:utils/keystrokehandler~KeystrokeHandler}
     */
    this.keystrokes = new KeystrokeHandler();

    /**
     * The id preview view.
     *
     * @member {module:ui/view~View}
     */
    this.previewLabelView = this._createPreviewLabel();

    /**
     * The unlink button view.
     *
     * @member {module:ui/button/buttonview~ButtonView}
     */
    this.removeTriggerButtonView = this._createButton(
      t("Remove"),
      removeBehaviorTriggerIcon,
      "removeBehaviorTrigger"
    );

    /**
     * The edit link button view.
     *
     * @member {module:ui/button/buttonview~ButtonView}
     */
    this.editButtonView = this._createButton(t("Edit"), icons.pencil, "edit");

    /**
     * The value of the trigger "id" attribute of use in the {@link #previewLabelView}.
     *
     * @observable
     * @member {String}
     */
    this.set("id");

    /**
     * A collection of views that can be focused in the view.
     *
     * @readonly
     * @protected
     * @member {module:ui/viewcollection~ViewCollection}
     */
    this._focusables = new ViewCollection();

    /**
     * Helps cycling over {@link #_focusables} in the view.
     *
     * @readonly
     * @protected
     * @member {module:ui/focuscycler~FocusCycler}
     */
    this._focusCycler = new FocusCycler({
      focusables: this._focusables,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        // Navigate fields backwards using the Shift + Tab keystroke.
        focusPrevious: "shift + tab",

        // Navigate fields forwards using the Tab key.
        focusNext: "tab",
      },
    });

    this.setTemplate({
      tag: "div",

      attributes: {
        class: ["ck", "ck-behaviortrigger-actions", "ck-responsive-form"],

        // https://github.com/ckeditor/ckeditor5-link/issues/90
        tabindex: "-1",
      },

      children: [
        this.previewLabelView,
        this.editButtonView,
        this.removeTriggerButtonView,
      ],
    });
  }

  /**
   * @inheritDoc
   */
  render() {
    super.render();

    const childViews = [
      this.previewLabelView,
      this.editButtonView,
      this.removeTriggerButtonView,
    ];

    childViews.forEach((v) => {
      // Register the view as focusable.
      this._focusables.add(v);

      // Register the view in the focus tracker.
      this.focusTracker.add(v.element);
    });

    // Start listening for the keystrokes coming from #element.
    this.keystrokes.listenTo(this.element);
  }

  /**
   * @inheritDoc
   */
  destroy() {
    super.destroy();

    this.focusTracker.destroy();
    this.keystrokes.destroy();
  }

  /**
   * Focuses the fist {@link #_focusables} in the actions.
   */
  focus() {
    this._focusCycler.focusFirst();
  }

  /**
   * Creates a button view.
   *
   * @private
   * @param {String} label The button label.
   * @param {String} icon The button icon.
   * @param {String} [eventName] An event name that the `ButtonView#execute` event will be delegated to.
   * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
   */
  _createButton(label, icon, eventName) {
    const button = new ButtonView(this.locale);

    button.set({
      label,
      icon,
      tooltip: true,
    });

    button.delegate("execute").to(this, eventName);

    return button;
  }

  /**
   * Creates a trigger id preview label.
   *
   * @private
   * @returns {module:ui/label/labelview~LabelView} The label view instance.
   */
  _createPreviewLabel() {
    const label = new LabelView(this.locale);
    const t = this.t;

    label.extendTemplate({
      attributes: {
        class: ["ck", "ck-behaviortrigger-actions__preview"],
      },
    });

    label.bind("text").to(this, "id", (id) => {
      return id || t("This trigger has no ID");
    });

    return label;
  }
}
