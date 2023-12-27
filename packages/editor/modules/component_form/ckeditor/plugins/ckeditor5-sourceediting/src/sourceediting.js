import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";

export default class CustomSourceEditing extends SourceEditing {
  _isAllowedToHandleSourceEditingMode() {
    return true;
  }
}
