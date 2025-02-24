import { mix } from "mixwith";
import { merge } from "lodash";
import {
  AbstractComponent,
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
} from ".";
import Backgroundable from "./mixins/Backgroundable";
import Timeable from "./mixins/Timeable";
import { createCollectionField } from "../utils/schema";

export default class Page extends mix(AbstractComponent).with(
  Backgroundable,
  Timeable
) {
  /**
   * @inheritdoc
   */
  static baseModel = AbstractComponent;

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
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        [this.childrenProperty]: createCollectionField({
          ajv,
          model: [
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
