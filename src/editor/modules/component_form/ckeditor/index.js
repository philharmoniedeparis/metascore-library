import { Alignment } from "ckeditor5";
import { BlockQuote } from "ckeditor5";
import { Bold } from "ckeditor5";
import { Essentials } from "ckeditor5";
import { Font } from "ckeditor5";
import { GeneralHtmlSupport } from "ckeditor5";
import { Heading } from "ckeditor5";
import {
  Image,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
} from "ckeditor5";
import { Indent } from "ckeditor5";
import { IndentBlock } from "ckeditor5";
import { Italic } from "ckeditor5";
import { Link, LinkUI, AutoLink, LinkEditing } from "ckeditor5";
import { LinkImage, LinkImageEditing } from "ckeditor5";
import { List } from "ckeditor5";
import { Paragraph } from "ckeditor5";
import { RemoveFormat } from "ckeditor5";
import { SourceEditing } from "ckeditor5";
import { SpecialCharacters, SpecialCharactersEssentials } from "ckeditor5";
import { Strikethrough, Subscript, Superscript } from "ckeditor5";
import { Table, TableToolbar } from "ckeditor5";
import { Underline } from "ckeditor5";

import { BehaviorTrigger } from './plugins/ckeditor5-behaviortrigger/src'
import { CustomLink, CustomLinkImage } from './plugins/ckeditor5-link/src'
import { CustomSourceEditing } from './plugins/ckeditor5-sourceediting/src'
import { UploadAdapter } from './plugins/ckeditor5-uploadadapter/src'

import { DecoupledEditor } from "ckeditor5";

import coreTranslations from "ckeditor5/translations/fr.js";

import "ckeditor5/ckeditor5.css";
import "./styles.scss";

export default function createEditor(el, { language = 'fr', extraFonts = [] } = {}) {
  return DecoupledEditor.create(el, {
    licenseKey: 'GPL',
    language,
    translations: [coreTranslations],
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
      options: ["default", 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
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
          name: /^(div|a|p|i|em|b|strong|h[1-6]|span|big|small|q|cite|ins|del|var|samp|kbd|code|tt|img)$/,
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
