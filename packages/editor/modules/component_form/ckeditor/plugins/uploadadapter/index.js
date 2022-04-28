import { Plugin } from "ckeditor5/src/core";
import Adapter from "./Adapter";

export default class UploadAdapter extends Plugin {
  /**
   * @inheritdoc
   */
  constructor(editor) {
    super(editor);

    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return new Adapter(loader);
    };
  }
}
