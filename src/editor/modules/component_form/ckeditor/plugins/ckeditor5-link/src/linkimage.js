import { LinkImage } from "ckeditor5";

import CustomLinkImageEditing from "./linkimageediting";
import CustomLinkImageUI from "./linkimageui";

export default class CustomLinkImage extends LinkImage {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [CustomLinkImageEditing, CustomLinkImageUI];
  }
}
