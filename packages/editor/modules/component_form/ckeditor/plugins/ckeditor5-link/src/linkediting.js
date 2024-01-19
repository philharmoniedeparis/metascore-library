import { LinkEditing } from "@ckeditor/ckeditor5-link";

import CustomLinkCommand from "./linkcommand";

export default class CustomLinkEditing extends LinkEditing {
  static get pluginName() {
    return "CustomLinkEditing";
  }

  /**
   * @inheritDoc
   */
  init() {
    super.init();

    const editor = this.editor;
    editor.commands.add("link", new CustomLinkCommand(editor));
  }
}
