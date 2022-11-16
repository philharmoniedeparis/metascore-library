import LinkBase from "@ckeditor/ckeditor5-link/src/link";
import AutoLink from "@ckeditor/ckeditor5-link/src/autolink";
import LinkEditing from "./linkediting";
import LinkUI from "./linkui";

export default class Link extends LinkBase {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [LinkEditing, LinkUI, AutoLink];
  }
}
