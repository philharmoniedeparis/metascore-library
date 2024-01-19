import { LinkImage } from "@ckeditor/ckeditor5-link";

import CustomLinkImageEditing from "./linkimageediting";
import CustomLinkImageUI from "./linkimageui";

export default class CustomLinkImage extends LinkImage {
  static get pluginName() {
    return "CustomLinkImage";
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [CustomLinkImageEditing, CustomLinkImageUI];
  }
}
