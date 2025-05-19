import type { Constructable } from "mixwith.ts"
import { merge } from "lodash";
import { createColorField, createImageField } from "@core/utils/schema";
import AbstractComponent from "../AbstractComponent";
import type { AnySchemaObject } from "ajv";

export default <c extends Constructable<AbstractComponent>>(s : c) => class extends s {
  static get $isBackgroundable() {
    return true;
  }

  static get schema(): AnySchemaObject {
    return merge(this.schema, {
      properties: {
        "background-color": createColorField({
          ajv: this.ajv,
          title: "Background color",
          default: null,
          nullable: true,
        }),
        "background-image": createImageField({
          ajv: this.ajv,
          title: "Background image",
          default: null,
          nullable: true,
        }),
      },
    });
  }

}
