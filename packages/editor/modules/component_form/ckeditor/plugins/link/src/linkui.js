import LinkUIBase from "@ckeditor/ckeditor5-link/src/linkui";
import {
  addLinkProtocolIfApplicable,
  LINK_KEYSTROKE,
} from "@ckeditor/ckeditor5-link/src/utils";
import { ButtonView } from "@ckeditor/ckeditor5-ui/src/index";
import LinkFormView from "./ui/linkformview";

import linkIcon from "@ckeditor/ckeditor5-link//theme/icons/link.svg";

export default class LinkUI extends LinkUIBase {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "CustomLinkUI";
  }

  /**
   * @inheritDoc
   */
  _createToolbarLinkButton() {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");
    const t = editor.t;

    // Handle the `Ctrl+K` keystroke and show the panel.
    editor.keystrokes.set(LINK_KEYSTROKE, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
      cancel();

      if (linkCommand.isEnabled) {
        this._showUI(true);
      }
    });

    editor.ui.componentFactory.add("customlink", (locale) => {
      const button = new ButtonView(locale);

      button.isEnabled = true;
      button.label = t("Link");
      button.icon = linkIcon;
      button.keystroke = LINK_KEYSTROKE;
      button.tooltip = true;
      button.isToggleable = true;

      // Bind button to the command.
      button.bind("isEnabled").to(linkCommand, "isEnabled");
      button.bind("isOn").to(linkCommand, "value", (value) => !!value);

      // Show the panel on button click.
      this.listenTo(button, "execute", () => this._showUI(true));

      return button;
    });
  }

  /**
   * @inheritDoc
   */
  _createFormView() {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");
    const defaultProtocol = editor.config.get("link.defaultProtocol");

    const formView = new LinkFormView(editor.locale, linkCommand);

    formView.urlInputView.fieldView.bind("value").to(linkCommand, "value");

    // Form elements should be read-only when corresponding commands are disabled.
    formView.urlInputView
      .bind("isReadOnly")
      .to(linkCommand, "isEnabled", (value) => !value);
    formView.saveButtonView.bind("isEnabled").to(linkCommand);

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

    return formView;
  }
}
