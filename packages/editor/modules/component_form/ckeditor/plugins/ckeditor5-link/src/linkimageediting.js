import LinkImageEditingBase from "@ckeditor/ckeditor5-link/src/linkimageediting";
import LinkEditing from "./linkediting";

export default class LinkImageEditing extends LinkImageEditingBase {
  /**
   * @inheritDoc
   */
  static get requires() {
    return ["ImageEditing", "ImageUtils", LinkEditing];
  }
}
