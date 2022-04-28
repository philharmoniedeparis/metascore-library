import CKSourceEditing from "@ckeditor/ckeditor5-source-editing/src/sourceediting";

export default class SourceEditing extends CKSourceEditing {
  _isAllowedToHandleSourceEditingMode() {
    return true;
  }
}
