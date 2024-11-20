import { LinkImageEditing } from "@ckeditor/ckeditor5-link";

import CustomLinkEditing from "./linkediting";

export default class CustomLinkImageEditing extends LinkImageEditing {
  /**
   * @inheritDoc
   */
  static get requires() {
    return ["ImageEditing", "ImageUtils", CustomLinkEditing];
  }
}
