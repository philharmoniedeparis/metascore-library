import { mix } from "mixwith";
import { merge } from "lodash";
import { createStringField } from "@metascore-library/core/utils/schema";
import { AbstractComponent } from ".";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Timeable from "./mixins/Timeable";

export class EmbeddableComponent extends mix(AbstractComponent).with(
  Hideable,
  Opacitiable,
  Positionable,
  Timeable
) {
  static type = "EmbeddableComponent";

  static baseModel = AbstractComponent;

  static get schema() {
    return merge(super.schema, {
      properties: {
        name: createStringField({
          title: "Name",
          description: "The component's name",
        }),
      },
    });
  }
}

export default EmbeddableComponent;
