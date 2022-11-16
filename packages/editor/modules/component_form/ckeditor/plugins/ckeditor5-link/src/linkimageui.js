import LinkImageUIBase from "@ckeditor/ckeditor5-link/src/linkimageui";
import LinkEditing from "./linkediting";
import LinkUI from "./linkui";

export default class LinkImageUI extends LinkImageUIBase {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [LinkEditing, LinkUI, "ImageBlockEditing"];
  }
}
