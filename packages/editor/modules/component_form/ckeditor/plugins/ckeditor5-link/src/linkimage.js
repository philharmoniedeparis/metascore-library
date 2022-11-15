import LinkImageBase from "@ckeditor/ckeditor5-link/src/linkimage";
import LinkImageEditing from "@ckeditor/ckeditor5-link/src/linkimageediting";
import LinkImageUI from "./linkimageui";

export default class LinkImage extends LinkImageBase {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [LinkImageEditing, LinkImageUI];
  }
}
