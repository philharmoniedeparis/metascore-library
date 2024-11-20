import { AutoLink } from "@ckeditor/ckeditor5-link";

import CustomLinkEditing from "./linkediting";

export default class CustomAutoLink extends AutoLink {
  /**
   * @inheritDoc
   */
  static get requires() {
    return ["Delete", CustomLinkEditing];
  }
}
