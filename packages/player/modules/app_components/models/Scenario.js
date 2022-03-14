import { mix } from "mixwith";
import { merge } from "lodash";
import { createStringField } from "@metascore-library/core/utils/schema";
import { createCollectionField } from "../utils/schema";
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

export class Scenario extends mix(AbstractComponent).with(Backgroundable) {
  static type = "Scenario";

  static baseModel = AbstractComponent;

  static get schema() {
    const ajv = super.ajv;

    return merge(super.schema, {
      properties: {
        name: createStringField({
          title: "Name",
          description: "The component's name",
        }),
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
