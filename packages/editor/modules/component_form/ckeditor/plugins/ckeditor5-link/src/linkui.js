import { LinkUI } from "@ckeditor/ckeditor5-link";
import { ButtonView } from "@ckeditor/ckeditor5-ui";
import {
  addLinkProtocolIfApplicable,
  LINK_KEYSTROKE,
} from "@ckeditor/ckeditor5-link/src/utils";
import { CssTransitionDisablerMixin } from "@ckeditor/ckeditor5-ui";
import CustomLinkFormView from "./ui/linkformview";

import linkIcon from "../theme/icons/link.svg";

export default class CustomLinkUI extends LinkUI {
  static get pluginName() {
    return "CustomLinkUI";
  }

  /**
   * @inheritDoc
   */
  _createFormView() {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");
    const defaultProtocol = editor.config.get("link.defaultProtocol");
    const allowCreatingEmptyLinks = editor.config.get(
      "link.allowCreatingEmptyLinks"
    );

    const formView = new (CssTransitionDisablerMixin(CustomLinkFormView))(
      editor.locale,
      linkCommand
    );

    formView.urlInputView.fieldView.bind("value").to(linkCommand, "value");

    // Form elements should be read-only when corresponding commands are disabled.
    formView.typeInputView.bind("isEnabled").to(linkCommand, "isEnabled");
    formView.urlInputView.bind("isEnabled").to(linkCommand, "isEnabled");

    // Disable the "save" button if the command is disabled or the input is empty despite being required.
    formView.saveButtonView
      .bind("isEnabled")
      .to(
        linkCommand,
        "isEnabled",
        formView.urlInputView,
        "isEmpty",
        (isCommandEnabled, isInputEmpty) =>
          isCommandEnabled && (allowCreatingEmptyLinks || !isInputEmpty)
      );

    // Execute link command after clicking the "Save" button.
    this.listenTo(formView, "submit", () => {
      const { value } = formView.urlInputView.fieldView.element;
      const parsedUrl = addLinkProtocolIfApplicable(value, defaultProtocol);
      editor.execute("link", parsedUrl, formView.getDecoratorSwitchesState());
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

    // Update the balloon's position when the form updates.
    formView.on("update", () => {
      if (this._isUIVisible) {
        this._balloon.updatePosition();
      }
    });

    return formView;
  }

  /**
   * @inheritDoc
   */
  _createToolbarLinkButton() {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");
    const t = editor.t;

    editor.ui.componentFactory.add("link", (locale) => {
      const button = new ButtonView(locale);

      button.isEnabled = true;
      button.label = t("Link");
      button.icon = linkIcon;
      button.keystroke = LINK_KEYSTROKE;
      button.tooltip = true;
      button.withText = true;
      button.isToggleable = true;

      // Bind button to the command.
      button.bind("isEnabled").to(linkCommand, "isEnabled");
      button.bind("isOn").to(linkCommand, "value", (value) => !!value);

      // Show the panel on button click.
      this.listenTo(button, "execute", () => this._showUI(true));

      return button;
    });
  }

  _addFormView() {
    super._addFormView();

    const editor = this.editor;
    const linkCommand = editor.commands.get("link");

    // Make sure that each time the panel shows up, all fields remain in sync
    // with the values of the command.
    this.formView.unbind("type", "params");
    this.formView.bind("type", "params").to(linkCommand);
    this.formView.updateValue();
  }
}
