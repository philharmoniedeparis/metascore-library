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
        $id: `${this.schemaId}:colors-if`, // Used for Ajv caching.
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
          $id: `${this.schemaId}:colors-else-if`, // Used for Ajv caching.
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
              default: null,
            }),
            "stroke-width": createNumberField({
              ajv,
              title: "Stroke width",
              multipleOf: 1,
              minimum: 0,
              nullable: true,
              default: null,
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
              default: null,
            }),
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
      required: ["src"],
    });
  }

  /**
   * Get defaults embedded in the SVG content
   *
   * @param {string} url The SVG's Url
   * @returns {Promise<object>} A promise that resolves with the defaults
   */
  static getEmbeddedData(url) {
    const data = {};

    return new Promise((resolve) => {
      const obj = document.createElement("object");
      obj.style.visibility = "hidden";
      obj.style.pointerEvents = "none";
      obj.addEventListener("load", (evt) => {
        const svg = evt.target.contentDocument.querySelector("svg");

        // Set colors.
        data.colors = [];
        [".color1", ".color2"].forEach((c) => {
          const el = svg.querySelector(c);
          if (el) {
            const style = getComputedStyle(el);
            data.colors.push(style.fill);
          }
        });
        if (data.colors.length === 0) {
          ["stroke", "stroke-width", "stroke-dasharray", "fill"].forEach(
            (prop) => {
              data[prop] = null;
            }
          );

          // Set markers
          data.markers = [];
          svg.querySelectorAll("defs marker").forEach((marker) => {
            data.markers.push(marker.getAttribute("id"));
          });
          if (data.markers.length > 0) {
            ["marker-start", "marker-mid", "marker-end"].forEach((prop) => {
              if (!(prop in data) || !data[prop]) {
                data[prop] = null;
              }
            });
          }
        }

        evt.target.remove();
        resolve(data);
      });

      obj.addEventListener("error", (evt) => {
        evt.target.remove();
        resolve(data);
      });

      obj.setAttribute("type", "image/svg+xml");
      obj.setAttribute("data", url);
      document.body.appendChild(obj);
    });
  }

  /**
   * @inheritdoc
   */
  constructor() {
    super();

    this._embedded_data = {};
  }

  /**
   * Get embedded SVG markers.
   *
   * @return {array} A list of available markers.
   */
  get markers() {
    return this._embedded_data.markers ?? [];
  }

  /**
   * Set defaults from embedded data.
   *
   * @param {Object} data The data to set defaults on.
   */
  setEmbeddedDefaults(data) {
    const { colors = [], markers = [] } = this._embedded_data;

    if (colors.length > 0) {
      if (!("colors" in data) || data.colors === null) {
        data.colors = colors;
      } else {
        colors.forEach((color, index) => {
          if (!data.colors[index]) {
            data.colors[index] = color;
          }
        });
      }
    } else {
      // @todo: fix empty values in CMS
      ["stroke", "stroke-width", "stroke-dasharray", "fill"].forEach((prop) => {
        if (!(prop in data) || !data[prop]) {
          data[prop] = null;
        }
      });

      // Set markers
      if (markers.length > 0) {
        // @todo: fix empty values in CMS
        ["marker-start", "marker-mid", "marker-end"].forEach((prop) => {
          if (!(prop in data) || !data[prop]) {
            data[prop] = null;
          }
        });
      }
    }
  }

  /**
   * @inheritdoc
   */
  async validate(data) {
    if ("src" in data && data.src && this.src !== data.src) {
      this._embedded_data = await this.constructor.getEmbeddedData(data.src);
      this.setEmbeddedDefaults(data);
    }

    return await super.validate(data);
  }
}
