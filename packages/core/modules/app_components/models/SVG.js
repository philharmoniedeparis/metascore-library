import { v4 as uuid } from "uuid";
import { merge } from "lodash";
import { EmbeddableComponent } from ".";
import {
  createUrlField,
  createNumberField,
  createEnumField,
  createStringField,
  createArrayField,
  createColorField,
} from "@metascore-library/core/utils/schema";

export class SVG extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static type = "SVG";

  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  static get ajv() {
    const ajv = super.ajv;

    if (!ajv.getKeyword("generate")) {
      ajv.addKeyword("generate", {
        modifying: true,
        errors: true,
        async: true,
        compile(schema) {
          return async (data, path, parent, key) => {
            for (const [field, generator] of Object.entries(schema)) {
              if (!(field in data)) {
                data[field] = await generator(data, path, parent, key);
              }
            }
            return true;
          };
        },
      });
    }

    return ajv;
  }

  /**
   * @inheritdoc
   */
  static get schema() {
    const ajv = this.ajv;

    return merge(super.schema, {
      $async: true,
      generate: {
        $colors_count: async (data) => {
          try {
            const response = await fetch(data.src);
            const content = await response.text();
            console.log(content);
            return 2;
          } catch (e) {
            return 0;
          }
        },
      },
      properties: {
        src: {
          ...createUrlField({
            ajv,
            title: "Source",
          }),
          //"metaScore-hasColors": { property: "$colors_count" },
        },
        $colors_count: {
          type: "number",
        },
        stroke: createColorField({
          ajv,
          title: "Stroke",
        }),
        "stroke-width": createNumberField({
          ajv,
          title: "Stroke width",
          multipleOf: 1,
          minimum: 0,
        }),
        "stroke-dasharray": createEnumField({
          title: "Stroke width",
          enum: [null, "2,2", "5,5", "5,2,2,2", "5,2,2,2,2,2"],
        }),
        "marker-start": createStringField({
          title: "Marker start",
        }),
        "marker-mid": createStringField({
          title: "Marker mid",
        }),
        "marker-end": createStringField({
          title: "Marker end",
        }),
        $colors_count: {
          type: "number",
        },
        if: {
          $id: uuid(), // Used for Ajv caching.
          properties: {
            $colors_count: { const: 1 },
          },
        },
        then: {
          properties: {
            colors: createArrayField({
              title: "Colors",
              items: [createColorField({ ajv })],
            }),
          },
        },
        else: {
          if: {
            $id: uuid(), // Used for Ajv caching.
            $async: true,
            properties: {
              $colors_count: { const: 2 },
            },
          },
          then: {
            properties: {
              colors: createArrayField({
                title: "Colors",
                items: [createColorField({ ajv }), createColorField({ ajv })],
              }),
            },
          },
          else: {
            properties: {
              fill: createColorField({
                ajv,
                title: "Fill",
              }),
            },
          },
        },
      },
      required: ["src"],
    });
  }
}

export default SVG;
