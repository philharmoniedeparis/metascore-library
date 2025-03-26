import { LinkImageEditing } from "ckeditor5";

import CustomLinkEditing from "./linkediting";

export default class CustomLinkImageEditing extends LinkImageEditing {
  /**
   * @inheritDoc
   */
  static get requires() {
    return ["ImageEditing", "ImageUtils", CustomLinkEditing];
  }
}
