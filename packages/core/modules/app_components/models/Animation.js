import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import {
  createUrlField,
  createNumberField,
  createTimeField,
  createBooleanField,
  createArrayField,
  createColorField,
} from "@metascore-library/core/utils/schema";

export class Animation extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static type = "Animation";

  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        src: createUrlField({
          ajv,
          title: "Source",
        }),
        "start-frame": createNumberField({
          title: "Start frame",
          default: 1,
        }),
        "loop-duration": createTimeField({
          ajv,
          title: "Loop duration",
        }),
        reversed: createBooleanField({
          title: "Reversed",
        }),
        colors: createArrayField({
          title: "Colors",
          items: createColorField({ ajv }),
        }),
      },
    });
  }
}

export default Animation;
