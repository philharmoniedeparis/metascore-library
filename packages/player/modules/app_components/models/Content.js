import { mix } from "mixwith";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Resizable from "./mixins/Resizable";
import Transformable from "./mixins/Transformable";
import { createHtmlField } from "../utils/schema";

export class Content extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Resizable,
  Transformable
) {
  static type = "Content";

  static baseModel = EmbeddableComponent;

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        text: createHtmlField({
          ajv,
          title: "Text",
        }),
      },
    });
  }
}

export default Content;
