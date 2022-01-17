import { mix } from "mixwith";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Resizable from "./mixins/Resizable";
import Transformable from "./mixins/Transformable";
import { createEnumField, createUrlField } from "../utils/schema";

export class Media extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Resizable,
  Transformable
) {
  static entity = "Media";

  static baseEntity = "EmbeddableComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        "media-tag": createEnumField({
          title: "Tag",
          enum: ["audio", "video"],
          default: "audio",
        }),
        "media-src": createUrlField({
          ajv,
          title: "Source",
        }),
      },
    });
  }
}

export default Media;
