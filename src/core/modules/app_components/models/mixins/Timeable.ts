import type { Constructable } from "mixwith.ts"
import { merge, round } from "lodash";
import { createTimeField } from "@core/utils/schema";
import type { Data as AbstractData } from "@/core/models/AbstractModel";
import AbstractComponent from "../AbstractComponent";
import type { AnySchemaObject } from "ajv";

export type Data = AbstractData & {
  "start-time"?: number|null
  "end-time"?: number|null
}

export default <c extends Constructable<AbstractComponent>>(s : c) => class extends s {
  static get $isTimeable() {
    return true;
  }

  static get schema(): AnySchemaObject {
    return merge(super.schema, {
      properties: {
        "start-time": createTimeField({
          ajv: this.ajv,
          title: "Start time",
          default: null,
          nullable: true,
        }),
        "end-time": createTimeField({
          ajv: this.ajv,
          title: "End time",
          default: null,
          nullable: true,
        }),
      },
    });
  }

  async update(data: Data, validate = true) {
    if (data["start-time"]) {
      data["start-time"] = round(data["start-time"], 2);
    }
    if (data["end-time"]) {
      data["end-time"] = round(data["end-time"], 2);
    }
    return await super.update(data, validate);
  }
}
