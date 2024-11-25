import { LinkImageUI } from 'ckeditor5'

import CustomLinkEditing from './linkediting'
import CustomLinkUI from './linkui'

export default class CustomLinkImageUI extends LinkImageUI {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [CustomLinkEditing, CustomLinkUI, 'ImageBlockEditing']
  }
}
