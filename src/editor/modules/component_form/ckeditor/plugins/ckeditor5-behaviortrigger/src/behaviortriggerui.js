import { Plugin } from "ckeditor5";
import { ClickObserver } from "ckeditor5";
import {
  ButtonView,
  ContextualBalloon,
  clickOutsideHandler,
  CssTransitionDisablerMixin,
} from "ckeditor5";
import { isWidget } from "ckeditor5";

import BehaviorTriggerFormView from "./ui/behaviortriggerformview";
import BehaviorTriggerActionsView from "./ui/behaviortriggeractionsview";
import { isLinkElement, TRIGGER_KEYSTROKE } from "./utils";

import addBehaviorTriggerIcon from "../theme/icons/addbehaviortrigger.svg?raw";

const VISUAL_SELECTION_MARKER_NAME = "behaviortrigger-ui";

/**
 * The behavior trigger UI plugin. It introduces the `'addbehaviortrigger'` and `'removebehaviortrigger'` buttons and support for the <kbd>Ctrl+T</kbd> keystroke.
 *
 * It uses the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class BehaviorTriggerUI extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [ContextualBalloon];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "BehaviorTriggerUI";
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;

    editor.editing.view.addObserver(ClickObserver);

    /**
     * The actions view displayed inside of the balloon.
     *
     * @member {module:link/ui/BehaviorTriggerActionsView~BehaviorTriggerActionsView}
     */
    this.actionsView = this._createActionsView();

    /**
     * The form view displayed inside the balloon.
     *
     * @member {module:link/ui/BehaviorTriggerFormView~BehaviorTriggerFormView}
     */
    this.formView = this._createFormView();

    /**
     * The contextual balloon plugin instance.
     *
     * @private
     * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
     */
    this._balloon = editor.plugins.get(ContextualBalloon);

    // Create toolbar buttons.
    this._createToolbarAddButton();

    // Attach lifecycle actions to the the balloon.
    this._enableUserBalloonInteractions();

    // Renders a fake visual selection marker on an expanded selection.
    editor.conversion.for("editingDowncast").markerToHighlight({
      model: VISUAL_SELECTION_MARKER_NAME,
      view: {
        classes: ["ck-fake-behaviortrigger-selection"],
      },
    });

    // Renders a fake visual selection marker on a collapsed selection.
    editor.conversion.for("editingDowncast").markerToElement({
      model: VISUAL_SELECTION_MARKER_NAME,
      view: {
        name: "span",
        classes: [
          "ck-fake-behaviortrigger-selection",
          "ck-fake-behaviortrigger-selection_collapsed",
        ],
      },
    });
  }

  /**
   * @inheritDoc
   */
  destroy() {
    super.destroy();

    // Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
    this.formView.destroy();
  }

  /**
   * Creates the {@link module:link/ui/BehaviorTriggerActionsView~BehaviorTriggerActionsView} instance.
   *
   * @private
   * @returns {module:link/ui/BehaviorTriggerActionsView~BehaviorTriggerActionsView} The link actions view instance.
   */
  _createActionsView() {
    const editor = this.editor;
    const actionsView = new BehaviorTriggerActionsView(editor.locale);
    const addBehaviorTriggerCommand = editor.commands.get("addBehaviorTrigger");
    const removeBehaviorTriggerCommand = editor.commands.get(
      "removeBehaviorTrigger"
    );

    actionsView.bind("id").to(addBehaviorTriggerCommand, "value");
    actionsView.editButtonView.bind("isEnabled").to(addBehaviorTriggerCommand);
    actionsView.removeTriggerButtonView
      .bind("isEnabled")
      .to(removeBehaviorTriggerCommand);

    // Execute removeBehaviorTrigger command after clicking on the "Edit" button.
    this.listenTo(actionsView, "edit", () => {
      this._addFormView();
    });

    // Execute removeBehaviorTrigger command after clicking on the "Remove" button.
    this.listenTo(actionsView, "removeBehaviorTrigger", () => {
      editor.execute("removeBehaviorTrigger");
      this._hideUI();
    });

    // Close the panel on esc key press when the **actions have focus**.
    actionsView.keystrokes.set("Esc", (data, cancel) => {
      this._hideUI();
      cancel();
    });

    // Open the form view on Ctrl+K when the **actions have focus**..
    actionsView.keystrokes.set(TRIGGER_KEYSTROKE, (data, cancel) => {
      this._addFormView();
      cancel();
    });

    return actionsView;
  }

  /**
   * Creates the {@link module:link/ui/BehaviorTriggerFormView~BehaviorTriggerFormView} instance.
   *
   * @private
   * @returns {module:link/ui/BehaviorTriggerFormView~BehaviorTriggerFormView} The link form view instance.
   */
  _createFormView() {
    const editor = this.editor;
    const addBehaviorTriggerCommand = editor.commands.get("addBehaviorTrigger");

    const formView = new (CssTransitionDisablerMixin(BehaviorTriggerFormView))(
      editor.locale,
      addBehaviorTriggerCommand
    );

    formView.idInputView.fieldView
      .bind("value")
      .to(addBehaviorTriggerCommand, "value");

    // Form elements should be read-only when corresponding commands are disabled.
    formView.idInputView
      .bind("isReadOnly")
      .to(addBehaviorTriggerCommand, "isEnabled", (value) => !value);
    formView.saveButtonView.bind("isEnabled").to(addBehaviorTriggerCommand);

    // Execute link command after clicking the "Save" button.
    this.listenTo(formView, "submit", () => {
      const { value } = formView.idInputView.fieldView.element;
      editor.execute(
        "addBehaviorTrigger",
        value,
        formView.getDecoratorSwitchesState()
      );
      this._closeFormView();
    });

    // Hide the panel after clicking the "Cancel" button.
    this.listenTo(formView, "cancel", () => {
      this._closeFormView();
    });

    // Close the panel on esc key press when the **form has focus**.
    formView.keystrokes.set("Esc", (data, cancel) => {
      this._closeFormView();
      cancel();
    });

    return formView;
  }

  /**
   * Creates a toolbar Link button. Clicking this button will show
   * a {@link #_balloon} attached to the selection.
   *
   * @private
   */
  _createToolbarAddButton() {
    const editor = this.editor;
    const addBehaviorTriggerCommand = editor.commands.get("addBehaviorTrigger");
    const t = editor.t;

    // Handle the `Ctrl+K` keystroke and show the panel.
    editor.keystrokes.set(TRIGGER_KEYSTROKE, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
      cancel();

      if (addBehaviorTriggerCommand.isEnabled) {
        this._showUI(true);
      }
    });

    editor.ui.componentFactory.add("addBehaviorTrigger", (locale) => {
      const button = new ButtonView(locale);

      button.label = t("Behavior");
      button.icon = addBehaviorTriggerIcon;
      button.keystroke = TRIGGER_KEYSTROKE;
      button.tooltip = true;
      button.withText = true;
      button.isToggleable = true;

      // Bind button to the command.
      button.bind("isEnabled").to(addBehaviorTriggerCommand, "isEnabled");
      button
        .bind("isOn")
        .to(addBehaviorTriggerCommand, "value", (value) => !!value);

      // Show the panel on button click.
      this.listenTo(button, "execute", () => this._showUI(true));

      return button;
    });
  }

  /**
   * Attaches actions that control whether the balloon panel containing the
   * {@link #formView} is visible or not.
   *
   * @private
   */
  _enableUserBalloonInteractions() {
    const viewDocument = this.editor.editing.view.document;

    // Handle click on view document and show panel when selection is placed inside the link element.
    // Keep panel open until selection will be inside the same link element.
    this.listenTo(viewDocument, "click", () => {
      const parentLink = this._getSelectedLinkElement();

      if (parentLink) {
        // Then show panel but keep focus inside editor editable.
        this._showUI();
      }
    });

    // Focus the form if the balloon is visible and the Tab key has been pressed.
    this.editor.keystrokes.set(
      "Tab",
      (data, cancel) => {
        if (
          this._areActionsVisible &&
          !this.actionsView.focusTracker.isFocused
        ) {
          this.actionsView.focus();
          cancel();
        }
      },
      {
        // Use the high priority because the link UI navigation is more important
        // than other feature's actions, e.g. list indentation.
        // https://github.com/ckeditor/ckeditor5-link/issues/146
        priority: "high",
      }
    );

    // Close the panel on the Esc key press when the editable has focus and the balloon is visible.
    this.editor.keystrokes.set("Esc", (data, cancel) => {
      if (this._isUIVisible) {
        this._hideUI();
        cancel();
      }
    });

    // Close on click outside of balloon panel element.
    clickOutsideHandler({
      emitter: this.formView,
      activator: () => this._isUIInPanel,
      contextElements: [this._balloon.view.element],
      callback: () => this._hideUI(),
    });
  }

  /**
   * Adds the {@link #actionsView} to the {@link #_balloon}.
   *
   * @protected
   */
  _addActionsView() {
    if (this._areActionsInPanel) {
      return;
    }

    this._balloon.add({
      view: this.actionsView,
      position: this._getBalloonPositionData(),
    });
  }

  /**
   * Adds the {@link #formView} to the {@link #_balloon}.
   *
   * @protected
   */
  _addFormView() {
    if (this._isFormInPanel) {
      return;
    }

    const editor = this.editor;
    const addBehaviorTriggerCommand = editor.commands.get("addBehaviorTrigger");
    const selection = editor.model.document.selection;

    this.formView.disableCssTransitions();

    this._balloon.add({
      view: this.formView,
      position: this._getBalloonPositionData(),
    });

    // Select input when form view is currently visible.
    if (this._balloon.visibleView === this.formView) {
      this.formView.idInputView.fieldView.select();
    }

    this.formView.enableCssTransitions();

    // Make sure that each time the panel shows up, the URL field remains in sync with the value of
    // the command. If the user typed in the input, then canceled the balloon (`idInputView.fieldView#value` stays
    // unaltered) and re-opened it without changing the value of the link command (e.g. because they
    // clicked the same link), they would see the old value instead of the actual value of the command.
    // https://github.com/ckeditor/ckeditor5-link/issues/78
    // https://github.com/ckeditor/ckeditor5-link/issues/123
    this.formView.idInputView.fieldView.element.value =
      addBehaviorTriggerCommand.value ||
      this._generateIdFromSelection(selection);
  }

  /**
   * Closes the form view. Decides whether the balloon should be hidden completely or if the action view should be shown. This is
   * decided upon the link command value (which has a value if the document selection is in the link).
   *
   * Additionally, if any {@link module:link/link~LinkConfig#decorators} are defined in the editor configuration, the state of
   * switch buttons responsible for manual decorator handling is restored.
   *
   * @private
   */
  _closeFormView() {
    const addBehaviorTriggerCommand =
      this.editor.commands.get("addBehaviorTrigger");

    // Restore manual decorator states to represent the current model state. This case is important to reset the switch buttons
    // when the user cancels the editing form.
    addBehaviorTriggerCommand.restoreManualDecoratorStates();

    if (addBehaviorTriggerCommand.value !== undefined) {
      this._removeFormView();
    } else {
      this._hideUI();
    }
  }

  /**
   * Removes the {@link #formView} from the {@link #_balloon}.
   *
   * @protected
   */
  _removeFormView() {
    if (this._isFormInPanel) {
      // Blur the input element before removing it from DOM to prevent issues in some browsers.
      // See https://github.com/ckeditor/ckeditor5/issues/1501.
      this.formView.saveButtonView.focus();

      this._balloon.remove(this.formView);

      // Because the form has an input which has focus, the focus must be brought back
      // to the editor. Otherwise, it would be lost.
      this.editor.editing.view.focus();

      this._hideFakeVisualSelection();
    }
  }

  /**
   * Shows the correct UI type. It is either {@link #formView} or {@link #actionsView}.
   *
   * @param {Boolean} forceVisible
   * @private
   */
  _showUI(forceVisible = false) {
    // When there's no link under the selection, go straight to the editing UI.
    if (!this._getSelectedLinkElement()) {
      // Show visual selection on a text without a link when the contextual balloon is displayed.
      // See https://github.com/ckeditor/ckeditor5/issues/4721.
      this._showFakeVisualSelection();

      this._addActionsView();

      // Be sure panel with link is visible.
      if (forceVisible) {
        this._balloon.showStack("main");
      }

      this._addFormView();
    }
    // If there's a link under the selection...
    else {
      // Go to the editing UI if actions are already visible.
      if (this._areActionsVisible) {
        this._addFormView();
      }
      // Otherwise display just the actions UI.
      else {
        this._addActionsView();
      }

      // Be sure panel with link is visible.
      if (forceVisible) {
        this._balloon.showStack("main");
      }
    }

    // Begin responding to ui#update once the UI is added.
    this._startUpdatingUI();
  }

  /**
   * Removes the {@link #formView} from the {@link #_balloon}.
   *
   * See {@link #_addFormView}, {@link #_addActionsView}.
   *
   * @protected
   */
  _hideUI() {
    if (!this._isUIInPanel) {
      return;
    }

    const editor = this.editor;

    this.stopListening(editor.ui, "update");
    this.stopListening(this._balloon, "change:visibleView");

    // Make sure the focus always gets back to the editable _before_ removing the focused form view.
    // Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
    editor.editing.view.focus();

    // Remove form first because it's on top of the stack.
    this._removeFormView();

    // Then remove the actions view because it's beneath the form.
    this._balloon.remove(this.actionsView);

    this._hideFakeVisualSelection();
  }

  /**
   * Makes the UI react to the {@link module:core/editor/editorui~EditorUI#event:update} event to
   * reposition itself when the editor UI should be refreshed.
   *
   * See: {@link #_hideUI} to learn when the UI stops reacting to the `update` event.
   *
   * @protected
   */
  _startUpdatingUI() {
    const editor = this.editor;
    const viewDocument = editor.editing.view.document;

    let prevSelectedLink = this._getSelectedLinkElement();
    let prevSelectionParent = getSelectionParent();

    const update = () => {
      const selectedLink = this._getSelectedLinkElement();
      const selectionParent = getSelectionParent();

      // Hide the panel if:
      //
      // * the selection went out of the EXISTING link element. E.g. user moved the caret out
      //   of the link,
      // * the selection went to a different parent when creating a NEW link. E.g. someone
      //   else modified the document.
      // * the selection has expanded (e.g. displaying link actions then pressing SHIFT+Right arrow).
      //
      // Note: #_getSelectedLinkElement will return a link for a non-collapsed selection only
      // when fully selected.
      if (
        (prevSelectedLink && !selectedLink) ||
        (!prevSelectedLink && selectionParent !== prevSelectionParent)
      ) {
        this._hideUI();
      }
      // Update the position of the panel when:
      //  * link panel is in the visible stack
      //  * the selection remains in the original link element,
      //  * there was no link element in the first place, i.e. creating a new link
      else if (this._isUIVisible) {
        // If still in a link element, simply update the position of the balloon.
        // If there was no link (e.g. inserting one), the balloon must be moved
        // to the new position in the editing view (a new native DOM range).
        this._balloon.updatePosition(this._getBalloonPositionData());
      }

      prevSelectedLink = selectedLink;
      prevSelectionParent = selectionParent;
    };

    function getSelectionParent() {
      return viewDocument.selection.focus
        .getAncestors()
        .reverse()
        .find((node) => node.is("element"));
    }

    this.listenTo(editor.ui, "update", update);
    this.listenTo(this._balloon, "change:visibleView", update);
  }

  /**
   * Returns `true` when {@link #formView} is in the {@link #_balloon}.
   *
   * @readonly
   * @protected
   * @type {boolean}
   */
  get _isFormInPanel() {
    return this._balloon.hasView(this.formView);
  }

  /**
   * Returns `true` when {@link #actionsView} is in the {@link #_balloon}.
   *
   * @readonly
   * @protected
   * @type {boolean}
   */
  get _areActionsInPanel() {
    return this._balloon.hasView(this.actionsView);
  }

  /**
   * Returns `true` when {@link #actionsView} is in the {@link #_balloon} and it is
   * currently visible.
   *
   * @readonly
   * @protected
   * @type {boolean}
   */
  get _areActionsVisible() {
    return this._balloon.visibleView === this.actionsView;
  }

  /**
   * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon}.
   *
   * @readonly
   * @protected
   * @type {boolean}
   */
  get _isUIInPanel() {
    return this._isFormInPanel || this._areActionsInPanel;
  }

  /**
   * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon} and it is
   * currently visible.
   *
   * @readonly
   * @protected
   * @type {boolean}
   */
  get _isUIVisible() {
    const visibleView = this._balloon.visibleView;

    return visibleView == this.formView || this._areActionsVisible;
  }

  /**
   * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
   * to the target element or selection.
   *
   * If the selection is collapsed and inside a link element, the panel will be attached to the
   * entire link element. Otherwise, it will be attached to the selection.
   *
   * @private
   * @returns {module:utils/dom/position~Options}
   */
  _getBalloonPositionData() {
    const view = this.editor.editing.view;
    const model = this.editor.model;
    const viewDocument = view.document;
    let target = null;

    if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
      // There are cases when we highlight selection using a marker (#7705, #4721).
      const markerViewElements = Array.from(
        this.editor.editing.mapper.markerNameToElements(
          VISUAL_SELECTION_MARKER_NAME
        )
      );
      const newRange = view.createRange(
        view.createPositionBefore(markerViewElements[0]),
        view.createPositionAfter(
          markerViewElements[markerViewElements.length - 1]
        )
      );

      target = view.domConverter.viewRangeToDom(newRange);
    } else {
      // Make sure the target is calculated on demand at the last moment because a cached DOM range
      // (which is very fragile) can desynchronize with the state of the editing view if there was
      // any rendering done in the meantime. This can happen, for instance, when an inline widget
      // gets unlinked.
      target = () => {
        const targetLink = this._getSelectedLinkElement();

        return targetLink
          ? // When selection is inside link element, then attach panel to this element.
            view.domConverter.mapViewToDom(targetLink)
          : // Otherwise attach panel to the selection.
            view.domConverter.viewRangeToDom(
              viewDocument.selection.getFirstRange()
            );
      };
    }

    return { target };
  }

  /**
   * Returns the link {@link module:engine/view/attributeelement~AttributeElement} under
   * the {@link module:engine/view/document~Document editing view's} selection or `null`
   * if there is none.
   *
   * **Note**: For a non–collapsed selection, the link element is returned when **fully**
   * selected and the **only** element within the selection boundaries, or when
   * a linked widget is selected.
   *
   * @private
   * @returns {module:engine/view/attributeelement~AttributeElement|null}
   */
  _getSelectedLinkElement() {
    const view = this.editor.editing.view;
    const selection = view.document.selection;
    const selectedElement = selection.getSelectedElement();

    // The selection is collapsed or some widget is selected (especially inline widget).
    if (
      selection.isCollapsed ||
      (selectedElement && isWidget(selectedElement))
    ) {
      return findLinkElementAncestor(selection.getFirstPosition());
    } else {
      // The range for fully selected link is usually anchored in adjacent text nodes.
      // Trim it to get closer to the actual link element.
      const range = selection.getFirstRange().getTrimmed();
      const startLink = findLinkElementAncestor(range.start);
      const endLink = findLinkElementAncestor(range.end);

      if (!startLink || startLink != endLink) {
        return null;
      }

      // Check if the link element is fully selected.
      if (view.createRangeIn(startLink).getTrimmed().isEqual(range)) {
        return startLink;
      } else {
        return null;
      }
    }
  }

  /**
   * Displays a fake visual selection when the contextual balloon is displayed.
   *
   * This adds a 'link-ui' marker into the document that is rendered as a highlight on selected text fragment.
   *
   * @private
   */
  _showFakeVisualSelection() {
    const model = this.editor.model;

    model.change((writer) => {
      const range = model.document.selection.getFirstRange();

      if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
        writer.updateMarker(VISUAL_SELECTION_MARKER_NAME, { range });
      } else {
        if (range.start.isAtEnd) {
          const startPosition = range.start.getLastMatchingPosition(
            ({ item }) => !model.schema.isContent(item),
            { boundaries: range }
          );

          writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
            usingOperation: false,
            affectsData: false,
            range: writer.createRange(startPosition, range.end),
          });
        } else {
          writer.addMarker(VISUAL_SELECTION_MARKER_NAME, {
            usingOperation: false,
            affectsData: false,
            range,
          });
        }
      }
    });
  }

  /**
   * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
   *
   * @private
   */
  _hideFakeVisualSelection() {
    const model = this.editor.model;

    if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
      model.change((writer) => {
        writer.removeMarker(VISUAL_SELECTION_MARKER_NAME);
      });
    }
  }

  _generateIdFromSelection(selection) {
    let id = "";

    // Get selection as plain text.
    for (const range of selection.getRanges()) {
      for (const item of range.getItems()) {
        id += viewToPlainText(item);
      }
    }

    // Remove special characters.
    id = id.replace(/[«»!"#$%&'()*+,/:;<=>?@[\\\]^`{|}~]/g, "");

    // Truncate to 10 characters.
    id = id.substring(0, 20);

    // Strip whitespaces from beginning and end.
    id = id.trim();

    // Transform to lowercase.
    id = id.toLowerCase();

    // Replace dots and spaces with a short dash.
    id = id.replace(/(\s|\.)/g, "-");

    // Replace multiple dashes with a single dash.
    id = id.replace(/-{2,}/g, "-");

    // Replace long dash with two short dashes.
    id = id.replace(/—/g, "--");

    return id;
  }
}

// Returns a link element if there's one among the ancestors of the provided `Position`.
//
// @private
// @param {module:engine/view/position~Position} View position to analyze.
// @returns {module:engine/view/attributeelement~AttributeElement|null} Link element at the position or null.
function findLinkElementAncestor(position) {
  return position.getAncestors().find((ancestor) => isLinkElement(ancestor));
}
