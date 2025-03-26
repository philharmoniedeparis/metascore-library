import { mix } from "mixwith";
import { merge } from "lodash";
import { createStringField } from "@core/utils/schema";
import { AbstractComponent } from ".";
import Backgroundable from "./mixins/Backgroundable";
import Borderable from "./mixins/Borderable";
import Hideable from "./mixins/Hideable";
import Opacitiable from "./mixins/Opacitiable";
import Positionable from "./mixins/Positionable";
import Resizable from "./mixins/Resizable";
import Timeable from "./mixins/Timeable";
import Transformable from "./mixins/Transformable";

export default class EmbeddableComponent extends mix(AbstractComponent).with(
  Backgroundable,
  Borderable,
  Hideable,
  Opacitiable,
  Positionable,
  Resizable,
  Timeable,
  Transformable
) {
  /**
   * @inheritdoc
   */
  static baseModel = AbstractComponent;

  /**
   * @inheritdoc
   */
  static type = "EmbeddableComponent";

  /**
   * @inheritdoc
   */
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
