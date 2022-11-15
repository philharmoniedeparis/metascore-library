import LinkUIBase from "@ckeditor/ckeditor5-link/src/linkui";
import { addLinkProtocolIfApplicable } from "@ckeditor/ckeditor5-link/src/utils";
import LinkFormView from "./ui/linkformview";

export default class LinkUI extends LinkUIBase {
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
