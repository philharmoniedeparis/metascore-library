import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import LinkUI from "./linkui";
import AutoLink from "@ckeditor/ckeditor5-link/src/autolink";

export default class Link extends Plugin {
  static get requires() {
    return [LinkEditing, LinkUI, AutoLink];
  }

  static get pluginName() {
    return "CustomLink";
  }
}
