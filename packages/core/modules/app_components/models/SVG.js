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

export default class SVG extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  /**
   * @inheritdoc
   */
  static type = "SVG";

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
      },
      if: {
        $id: uuid(), // Used for Ajv caching.
        properties: {
          colors: createArrayField({
            items: createColorField({ ajv, nullable: false }),
            minItems: 2,
            maxItems: 2,
          }),
        },
        required: ["colors"],
      },
      then: {
        properties: {
          colors: createArrayField({
            title: "Colors",
            items: [
              createColorField({ ajv, nullable: false }),
              createColorField({ ajv, nullable: false }),
            ],
          }),
        },
      },
      else: {
        if: {
          $id: uuid(), // Used for Ajv caching.
          properties: {
            colors: createArrayField({
              items: createColorField({ ajv, nullable: false }),
              minItems: 1,
              maxItems: 1,
            }),
          },
          required: ["colors"],
        },
        then: {
          properties: {
            colors: createArrayField({
              title: "Colors",
              items: [createColorField({ ajv, nullable: false })],
            }),
          },
        },
        else: {
          properties: {
            stroke: createColorField({
              ajv,
              title: "Stroke",
              nullable: true,
            }),
            "stroke-width": createNumberField({
              ajv,
              title: "Stroke width",
              multipleOf: 1,
              minimum: 0,
              nullable: true,
            }),
            "stroke-dasharray": createEnumField({
              title: "Stroke dasharray",
              enum: [null, "2,2", "5,5", "5,2,2,2", "5,2,2,2,2,2"],
              nullable: true,
              default: null,
            }),
            fill: createColorField({
              ajv,
              title: "Fill",
              nullable: true,
            }),
          },
          if: {
            $id: uuid(), // Used for Ajv caching.
            properties: {
              markers: createArrayField({
                minItems: 1,
              }),
            },
          },
          then: {
            properties: {
              "marker-start": createStringField({
                title: "Marker start",
                nullable: true,
              }),
              "marker-mid": createStringField({
                title: "Marker mid",
                nullable: true,
              }),
              "marker-end": createStringField({
                title: "Marker end",
                nullable: true,
              }),
            },
          },
        },
      },
      required: ["src"],
    });
  }

  /**
   * Get data embedded in the SVG content
   *
   * @param {string} url The SVG's Url
   * @returns {Promise<object>} A promise that resolves with the embedded data
   */
  static async getEmbeddedData(url) {
    return new Promise((resolve) => {
      const data = {};

      const obj = document.createElement("object");
      obj.style.visibility = "hidden";
      obj.style.pointerEvents = "none";
      obj.addEventListener("load", (evt) => {
        const svg = evt.target.contentDocument.querySelector("svg");

        // Get colors.
        const colors = [];
        [".color1", ".color2"].forEach((c) => {
          const el = svg.querySelector(c);
          if (el) {
            const style = getComputedStyle(el);
            colors.push(style.fill);
          }
        });
        if (colors.length > 0) {
          data.colors = colors;
        } else {
          data.stroke = null;
          data["stroke-width"] = null;
          data["stroke-dasharray"] = null;
          data.fill = null;

          // Get markers
          const markers = [];
          svg.querySelectorAll("defs marker").forEach((marker) => {
            markers.push(marker.getAttribute("id"));
          });
          if (markers.length > 0) {
            data.markers = markers;
            data["marker-start"] = null;
            data["marker-mid"] = null;
            data["marker-end"] = null;
          }
        }

        evt.target.remove();
        resolve(data);
      });

      obj.addEventListener("error", (evt) => {
        evt.target.remove();
        resolve({
          stroke: null,
          "stroke-width": null,
          "stroke-dasharray": null,
          fill: null,
        });
      });

      obj.setAttribute("type", "image/svg+xml");
      obj.setAttribute("data", url);
      document.body.appendChild(obj);
    });
  }

  /**
   * @inheritdoc
   */
  async validate(data) {
    if ("src" in data && data.src && this.src !== data.src) {
      const embedded_data = await this.constructor.getEmbeddedData(data.src);
      Object.assign(data, embedded_data);
    }

    return super.validate(data);
  }
}
