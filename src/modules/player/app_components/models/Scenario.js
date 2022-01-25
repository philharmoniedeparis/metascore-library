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
import { createCollectionField } from "../utils/schema";

export class Scenario extends mix(AbstractComponent).with(Backgroundable) {
  static type = "Scenario";

  static baseModel = AbstractComponent;

  static get schema() {
    const ajv = super.ajv;

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

export default Scenario;
