import LinkEditingBase from "@ckeditor/ckeditor5-link/src/linkediting";
import LinkCommand from "./linkcommand";

export default class LinkEditing extends LinkEditingBase {
  /**
   * @inheritDoc
   */
  init() {
    super.init();

    const editor = this.editor;
    editor.commands.add("link", new LinkCommand(editor));
  }
}
