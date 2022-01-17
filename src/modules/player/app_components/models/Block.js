import { mix } from "mixwith";
import { merge } from "lodash";
import { EmbeddableComponent, Page } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Resizable from "./mixins/Resizable";
import Transformable from "./mixins/Transformable";
import {
  createBooleanField,
  createEnumField,
  createCollectionField,
} from "../utils/schema";

export class Block extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Resizable,
  Transformable
) {
  static entity = "Block";

  static baseEntity = "EmbeddableComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        "background-color": {
          default: "rgb(238, 238, 238)",
        },
        "border-width": {
          default: 1,
        },
        "border-color": {
          default: "rgb(204, 204, 204)",
        },
        "border-radius": {
          default: "10px",
        },
        dimension: {
          default: [200, 200],
        },
        "block-synched": createBooleanField({
          title: "Synched",
        }),
        "block-pager-visibility": createEnumField({
          title: "Pager visibility",
          enum: ["auto", "hidden", "visible"],
          default: "auto",
        }),
        "block-pages": createCollectionField({
          ajv,
          model: Page,
          foreign_key: "$pages_ids",
        }),
      },
    });
  }
}

export default Block;
