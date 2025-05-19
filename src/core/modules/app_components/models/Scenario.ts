import { mix } from "mixwith.ts";
import { merge } from "lodash";
import { createStringField } from "@core/utils/schema";
import { createCollectionField } from "../utils/schema";
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

export default class Scenario extends mix(AbstractComponent).with(Backgroundable) {

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

