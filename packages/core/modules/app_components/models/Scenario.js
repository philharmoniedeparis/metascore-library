import { mix } from "mixwith";
import { merge } from "lodash";
import { createStringField } from "@core/utils/schema";
import { createCollectionField } from "../utils/schema";
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

export default class Scenario extends mix(AbstractComponent).with(
  Backgroundable
) {
  /**
   * @inheritdoc
   */
  static baseModel = AbstractComponent;

  /**
   * @inheritdoc
   */
  static type = "Scenario";

  /**
   * @inheritdoc
   */
  static childrenProperty = "children";

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = super.ajv;

    return merge(super.schema, {
      properties: {
        name: createStringField({
          title: "Name",
          description: "The component's name",
        }),
        slug: createStringField({
          title: "Slug",
          description: "The component's slug for use in api links",
        }),
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
