import { mix } from "mixwith.ts";
import { merge } from "lodash";
import AbstractComponent from "./AbstractComponent";
import Animation from "./Animation";
import Block from "./Block";
import BlockToggler from "./BlockToggler";
import Content from "./Content";
import Controller from "./Controller";
import Cursor from "./Cursor";
import Image from "./Image";
import Media from "./Media";
import SVG from "./SVG";
import VideoRenderer from "./VideoRenderer";
import Backgroundable from "./mixins/Backgroundable";
import Timeable from "./mixins/Timeable";
import { createCollectionField } from "../utils/schema";

export default class Page extends mix(AbstractComponent).with(Backgroundable, Timeable) {
  /**
   * @inheritdoc
   */
  static type = "Page";

  /**
   * @inheritdoc
   */
  static childrenProperty = "children";

  /**
   * @inheritdoc
   */
  static get schema() {
    return merge(super.schema, {
      properties: {
        [this.childrenProperty]: createCollectionField({
          ajv: this.ajv,
          models: [
            Animation,
            Block,
            BlockToggler,
            Content,
            Controller,
            Cursor,
            Image,
            Media,
            SVG,
            VideoRenderer,
          ],
        }),
      },
    });
  }
}
