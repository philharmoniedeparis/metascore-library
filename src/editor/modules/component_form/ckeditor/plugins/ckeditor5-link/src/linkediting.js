import { LinkEditing } from 'ckeditor5'

import CustomLinkCommand from './linkcommand'

export default class CustomLinkEditing extends LinkEditing {
  /**
   * @inheritDoc
   */
  init() {
    super.init()

    const editor = this.editor
    editor.commands.add('link', new CustomLinkCommand(editor))
  }
}
