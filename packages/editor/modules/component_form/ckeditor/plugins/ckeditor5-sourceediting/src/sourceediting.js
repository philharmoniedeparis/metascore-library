import SourceEditingBase from "@ckeditor/ckeditor5-source-editing/src/sourceediting";

export default class SourceEditing extends SourceEditingBase {
  _isAllowedToHandleSourceEditingMode() {
    return true;
  }
}
