import { AbstractComponent, Page } from "@/player/models/ComponentHierarchy";
import { mix } from "mixwith";
import TimedComponent from "./mixins/TimedComponent";
import PositionableComponent from "./mixins/PositionableComponent";
import ResizableComponent from "./mixins/ResizableComponent";
import {
  createBooleanField,
  createEnumField,
  createCollectionField,
} from "@/core/models/Helpers.js";
import { merge } from "lodash";

export class Block extends mix(AbstractComponent).with(
  TimedComponent,
  PositionableComponent,
  ResizableComponent
) {
  static entity = "Block";

  static baseEntity = "AbstractComponent";

  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      properties: {
        synched: createBooleanField({
          title: "Synched",
        }),
        "pager-visibility": createEnumField({
          title: "Pager visibility",
          allowd_values: ["auto", "hidden", "visible"],
          default: "auto",
        }),
        pages: createCollectionField({
          ajv,
          model: Page,
          foreign_key: "pages_ids",
        }),
      },
    });
  }
}

export default Block;
