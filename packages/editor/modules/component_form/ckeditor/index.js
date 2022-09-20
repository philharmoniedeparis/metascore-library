import Editor from "@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor";

import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";
import BehavorTrigger from "./plugins/behaviortrigger/src/behaviortrigger";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Font from "@ckeditor/ckeditor5-font/src/font";
import GeneralHtmlSupport from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Image from "@ckeditor/ckeditor5-image/src/image";
import ImageResize from "@ckeditor/ckeditor5-image/src/imageresize";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
import ImageTextAlternative from "@ckeditor/ckeditor5-image/src/imagetextalternative";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload";
import Indent from "@ckeditor/ckeditor5-indent/src/indent";
import IndentBlock from "@ckeditor/ckeditor5-indent/src/indentblock";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Link from "@ckeditor/ckeditor5-link/src/link";
import LinkImage from "@ckeditor/ckeditor5-link/src/linkimage";
import List from "@ckeditor/ckeditor5-list/src/list";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import RemoveFormat from "@ckeditor/ckeditor5-remove-format/src/removeformat";
import SourceEditing from "./plugins/sourceediting";
import SpecialCharacters from "@ckeditor/ckeditor5-special-characters/src/specialcharacters";
import SpecialCharactersEssentials from "@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials";
import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";
import Style from "@ckeditor/ckeditor5-style/src/style";
import Subscript from "@ckeditor/ckeditor5-basic-styles/src/subscript";
import Superscript from "@ckeditor/ckeditor5-basic-styles/src/superscript";
import Table from "@ckeditor/ckeditor5-table/src/table";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
import UploadAdapter from "./plugins/uploadadapter";

import "./styles.scss";

function getConfig({ language = "fr", extraFonts = [] } = {}) {
  return {
    language,
    plugins: [
      Alignment,
      BehavorTrigger,
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
      Link,
      LinkImage,
      List,
      Paragraph,
      RemoveFormat,
      SourceEditing,
      SpecialCharacters,
      SpecialCharactersEssentials,
      Strikethrough,
      Style,
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
        "style",
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
        "link",
        "addBehaviorTrigger",
        "uploadImage",
        "insertTable",
        "|",
        "specialCharacters",
        "sourceEditing",
      ],
      shouldNotGroupWhenFull: true,
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
          name: /^(div|a|p|i|em|b|strong|h[2-4]|span)$/,
          classes: true,
          styles: true,
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
  };
}

export { Editor, getConfig };
