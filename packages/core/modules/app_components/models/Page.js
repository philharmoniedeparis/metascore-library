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
  Media,
  SVG,
  VideoRenderer,
} from ".";
import Backgroundable from "./mixins/Backgroundable";
import Timeable from "./mixins/Timeable";
import { createCollectionField } from "../utils/schema";

export class Page extends mix(AbstractComponent).with(
  Backgroundable,
  Timeable
) {
  static type = "Page";

  static baseModel = AbstractComponent;

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        children: createCollectionField({
          ajv,
          model: [
            Animation,
            Block,
            BlockToggler,
            Content,
            Controller,
            Cursor,
            Media,
            SVG,
            VideoRenderer,
          ],
        }),
      },
    });
  }
}

export default Page;
