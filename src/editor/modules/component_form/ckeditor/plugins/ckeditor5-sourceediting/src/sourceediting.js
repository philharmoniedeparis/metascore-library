import { SourceEditing } from "ckeditor5";

export default class CustomSourceEditing extends SourceEditing {
  _isAllowedToHandleSourceEditingMode() {
    return true;
  }
}
