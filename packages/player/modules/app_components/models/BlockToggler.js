import { mix } from "mixwith";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Resizable from "./mixins/Resizable";
import Transformable from "./mixins/Transformable";
import { createArrayField } from "@metascore-library/core/utils/schema";

export class BlockToggler extends mix(EmbeddableComponent).with(
  Backgroundable,
  Borderable,
  Resizable,
  Transformable
) {
  static type = "BlockToggler";

  static baseModel = EmbeddableComponent;

  static get schema() {
    return merge(super.schema, {
      properties: {
        "background-color": {
          default: "#eee",
        },
        "border-width": {
          default: 1,
        },
        "border-color": {
          default: "#eee",
        },
        dimension: {
          default: [100, 20],
          items: [
            {
              minimum: 10,
            },
            {
              minimum: 10,
            },
          ],
        },
        blocks: createArrayField({
          items: { type: "string" },
        }),
      },
    });
  }
}

export default BlockToggler;
