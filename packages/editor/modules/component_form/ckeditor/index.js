import { Alignment } from "@ckeditor/ckeditor5-alignment";
import { BlockQuote } from "@ckeditor/ckeditor5-block-quote";
import { Bold } from "@ckeditor/ckeditor5-basic-styles";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { Font } from "@ckeditor/ckeditor5-font";
import { GeneralHtmlSupport } from "@ckeditor/ckeditor5-html-support";
import { Heading } from "@ckeditor/ckeditor5-heading";
import { Image } from "@ckeditor/ckeditor5-image";
import { ImageResize } from "@ckeditor/ckeditor5-image";
import { ImageStyle } from "@ckeditor/ckeditor5-image";
import { ImageTextAlternative } from "@ckeditor/ckeditor5-image";
import { ImageToolbar } from "@ckeditor/ckeditor5-image";
import { ImageUpload } from "@ckeditor/ckeditor5-image";
import { Indent } from "@ckeditor/ckeditor5-indent";
import { IndentBlock } from "@ckeditor/ckeditor5-indent";
import { Italic } from "@ckeditor/ckeditor5-basic-styles";
import { Link } from "@ckeditor/ckeditor5-link";
import { LinkUI } from "@ckeditor/ckeditor5-link";
import { AutoLink } from "@ckeditor/ckeditor5-link";
import { LinkEditing } from "@ckeditor/ckeditor5-link";
import { LinkImage } from "@ckeditor/ckeditor5-link";
import { LinkImageEditing } from "@ckeditor/ckeditor5-link";
import { List } from "@ckeditor/ckeditor5-list";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { RemoveFormat } from "@ckeditor/ckeditor5-remove-format";
import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";
import { SpecialCharacters } from "@ckeditor/ckeditor5-special-characters";
import { SpecialCharactersEssentials } from "@ckeditor/ckeditor5-special-characters";
import { Strikethrough } from "@ckeditor/ckeditor5-basic-styles";
import { Subscript } from "@ckeditor/ckeditor5-basic-styles";
import { Superscript } from "@ckeditor/ckeditor5-basic-styles";
import { Table } from "@ckeditor/ckeditor5-table";
import { TableToolbar } from "@ckeditor/ckeditor5-table";
import { Underline } from "@ckeditor/ckeditor5-basic-styles";

import { BehaviorTrigger } from "./plugins/ckeditor5-behaviortrigger/src";
import { CustomLink, CustomLinkImage } from "./plugins/ckeditor5-link/src";
import { CustomSourceEditing } from "./plugins/ckeditor5-sourceediting/src";
import { UploadAdapter } from "./plugins/ckeditor5-uploadadapter/src";

import { DecoupledEditor } from "@ckeditor/ckeditor5-editor-decoupled";

import "./styles.scss";

export default function createEditor(
  el,
  { language = "fr", extraFonts = [] } = {}
) {
  return DecoupledEditor.create(el, {
    language,
    removePlugins: [
      Link,
      AutoLink,
      LinkEditing,
      LinkUI,
      LinkImage,
      LinkImageEditing,
      SourceEditing,
    ],
    plugins: [
      Alignment,
      BehaviorTrigger,
      BlockQuote,
      Bold,
      Essentials,
      Font,
      GeneralHtmlSupport,
      Heading,
      Image,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      CustomLink,
      CustomLinkImage,
      List,
      Paragraph,
      RemoveFormat,
      CustomSourceEditing,
      SpecialCharacters,
      SpecialCharactersEssentials,
      Strikethrough,
      Subscript,
      Superscript,
      Table,
      TableToolbar,
      Underline,
      UploadAdapter,
    ],
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "subscript",
        "superscript",
        "|",
        "heading",
        "blockQuote",
        "removeFormat",
        "|",
        "fontFamily",
        "fontSize",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "numberedList",
        "bulletedList",
        "outdent",
        "indent",
        "|",
        "alignment",
        "|",
        "uploadImage",
        "insertTable",
        "specialCharacters",
        "-",
        "link",
        "addBehaviorTrigger",
        "|",
        "sourceEditing",
      ],
      shouldNotGroupWhenFull: true,
    },
    heading: {
      options: [
        { model: "paragraph", title: "Paragraph" },
        { model: "heading1", view: "h1", title: "Heading 1" },
        { model: "heading2", view: "h2", title: "Heading 2" },
        { model: "heading3", view: "h3", title: "Heading 3" },
        { model: "heading4", view: "h4", title: "Heading 4" },
        { model: "heading5", view: "h5", title: "Heading 5" },
        { model: "heading6", view: "h6", title: "Heading 6" },
        { model: "div", view: "div", title: "Division" },
        { model: "pre", view: "pre", title: "Preformatted" },
        { model: "address", view: "address", title: "Address" },
      ],
    },
    fontFamily: {
      options: [
        "default",
        ...extraFonts,
        "Arial, Helvetica, sans-serif",
        "Courier New, Courier, monospace",
        "Georgia, serif",
        "Lucida Sans Unicode, Lucida Grande, sans-serif",
        "Tahoma, Geneva, sans-serif",
        "Times New Roman, Times, serif",
        "Trebuchet MS, Helvetica, sans-serif",
        "Verdana, Geneva, sans-serif",
      ],
      supportAllValues: true,
    },
    fontSize: {
      options: [
        "default",
        8,
        9,
        10,
        11,
        12,
        14,
        16,
        18,
        20,
        22,
        24,
        26,
        28,
        36,
        48,
        72,
      ],
      supportAllValues: true,
    },
    image: {
      toolbar: [
        "linkImage",
        "|",
        "imageStyle:inline",
        "imageStyle:block",
        "imageStyle:side",
        "|",
        "imageTextAlternative",
      ],
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
    htmlSupport: {
      allow: [
        {
          name: /^(div|a|p|i|em|b|strong|h[1-6]|span|big|small|q|cite|ins|del|var|samp|kbd|code|tt)$/,
          classes: true,
          styles: true,
          attributes: {
            dir: /^(rtl|ltr)$/,
          },
        },
        {
          name: "a",
          attributes: {
            target: "_blank",
            rel: /^(noopener|nofollow)$/,
          },
        },
      ],
      disallow: [],
    },
    updateSourceElementOnDestroy: true,
  });
}
