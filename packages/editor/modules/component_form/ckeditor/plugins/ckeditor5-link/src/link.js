import LinkBase from "@ckeditor/ckeditor5-link/src/link";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import AutoLink from "@ckeditor/ckeditor5-link/src/autolink";
import LinkUI from "./linkui";

export default class Link extends LinkBase {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [LinkEditing, LinkUI, AutoLink];
  }
}
