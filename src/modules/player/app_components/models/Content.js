import { mix } from "mixwith";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Resizable from "./mixins/Resizable";
import Transformable from "./mixins/Transformable";
import { createStringField } from "../utils/schema";

export class Content extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Resizable,
  Transformable
) {
  static entity = "Content";

  static baseEntity = "EmbeddableComponent";

  static get schema() {
    return merge(super.schema, {
      properties: {
        "content-text": createStringField({
          title: "Text",
        }),
      },
    });
  }
}

export default Content;
