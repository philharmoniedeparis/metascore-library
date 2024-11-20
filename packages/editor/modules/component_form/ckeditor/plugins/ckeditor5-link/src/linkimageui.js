import { LinkImageUI } from "@ckeditor/ckeditor5-link";

import CustomLinkEditing from "./linkediting";
import CustomLinkUI from "./linkui";

export default class CustomLinkImageUI extends LinkImageUI {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [CustomLinkEditing, CustomLinkUI, "ImageBlockEditing"];
  }
}
