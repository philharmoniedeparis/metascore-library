import { merge } from "lodash";
import EmbeddableComponent from "./EmbeddableComponent";
import {
  createUrlField,
  createNumberField,
  createEnumField,
  createStringField,
  createArrayField,
  createColorField,
} from "@core/utils/schema";

export const SVG_PROPERTIES = [
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "fill",
  "marker-start",
  "marker-mid",
  "marker-end",
] as const;

export const SVG_ELEMENTS = [
  "circle",
  "ellipse",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
] as const;

export type EmbeddedData = { colors?: string[],  markers?: string[]} & {
 [key in typeof SVG_PROPERTIES[number]]: number|string|null
}

export default class SVG extends EmbeddableComponent {

  /**
   * @inheritdoc
   */
  static type = "SVG";

  /**
   * @inheritdoc
   */
  static get schema() {
    return merge(super.schema, {
      properties: {
        src: createUrlField({
          ajv: this.ajv,
          title: "Source",
        }),
      },
      if: {
        $id: `${this.schemaId}:colors-if`, // Used for Ajv caching.
        properties: {
          colors: createArrayField({
            items: createColorField({ ajv: this.ajv, nullable: false }),
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
              createColorField({ ajv: this.ajv, nullable: false }),
              createColorField({ ajv: this.ajv, nullable: false }),
            ],
          }),
        },
      },
      else: {
        if: {
          $id: `${this.schemaId}:colors-else-if`, // Used for Ajv caching.
          properties: {
            colors: createArrayField({
              items: createColorField({ ajv: this.ajv, nullable: false }),
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
              items: [createColorField({ ajv: this.ajv, nullable: false })],
            }),
          },
        },
        else: {
          properties: {
            stroke: createColorField({
              ajv: this.ajv,
              title: "Stroke",
              nullable: true,
              default: null,
            }),
            "stroke-width": createNumberField({
              title: "Stroke width",
              multipleOf: 1,
              minimum: 0,
              nullable: true,
              default: null,
            }),
            "stroke-dasharray": createEnumField({
              title: "Stroke dasharray",
              enum: [null, "2,2", "5,5", "5,2,2,2", "5,2,2,2,2,2"],
              default: null,
            }),
            fill: createColorField({
              ajv: this.ajv,
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
   */
  #getEmbeddedData(url: string) : Promise<EmbeddedData> {
    const data = {} as EmbeddedData;

    return new Promise((resolve, reject) => {
      const obj = document.createElement("object");
      obj.setAttribute("type", "image/svg+xml");
      obj.style.visibility = "hidden";
      obj.style.pointerEvents = "none";

      let onLoad = null as ((this: HTMLObjectElement, ev: Event) => unknown)|null;
      let onError = null as ((this: HTMLObjectElement, ev: Event) => undefined)|null;

      onLoad = (evt) => {
        obj.removeEventListener("load", onLoad!);
        obj.removeEventListener("error", onError!);

        const svg = (evt.target as HTMLObjectElement).contentDocument?.querySelector("svg");

        if (!svg) {
          reject(data);
          return;
        }

        // Set colors.
        data.colors = [];
        [".color1", ".color2"].forEach((c) => {
          const el = svg.querySelector(c);
          if (el) {
            const style = getComputedStyle(el);
            data.colors!.push(style.fill);
          }
        });
        if (data.colors.length === 0) {
          // Set markers
          data.markers = [];
          svg.querySelectorAll("defs marker").forEach((marker) => {
            const id = marker.getAttribute("id")
            if (id) data.markers!.push(id);
          });

          // Fill other props.
          const root = svg.querySelector(SVG_ELEMENTS.join(","));
          const style = root ? getComputedStyle(root) : null;
          SVG_PROPERTIES.forEach((property) => {
            data[property] = style?.[property] || null;
          });
        }

        evt.target.remove();
        resolve(data);
      };

      onError = (evt) => {
        obj.removeEventListener("load", onLoad!);
        obj.removeEventListener("error", onError!);

        evt.target.remove();
        reject(data);
      };

      obj.addEventListener("load", onLoad);
      obj.addEventListener("error", onError);
      obj.setAttribute("data", url);

      document.body.appendChild(obj);
    });
  }

  #embedded_data = {} as EmbeddedData;

  /**
   * Get embedded SVG markers.
   *
   * @return {array} A list of available markers.
   */
  get markers() {
    return this.#embedded_data.markers ?? [];
  }

  /**
   * Set defaults from embedded data.
   *
   * @param {Object} data The data to set defaults on.
   */
  #setEmbeddedDefaults(data) {
    const { colors = [] } = this.#embedded_data;

    // Set colors.
    data.colors = colors.map((color, index) => {
      return data.colors?.at(index) ?? color;
    });

    if (colors.length > 0) {
      // Remove other properties.
      SVG_PROPERTIES.forEach((property) => {
        delete data[property];
      });
    } else {
      // Set other properties.
      SVG_PROPERTIES.forEach((property) => {
        data[property] = data[property] ?? null;
      });
    }
  }

  /**
   * @inheritdoc
   */
  async validate(data) {
    if ("src" in data && data.src && this.src !== data.src) {
      try {
        this.#embedded_data = await this.#getEmbeddedData(data.src);
        this.#setEmbeddedDefaults(data);
      } catch (e) {
        //
      }
    }

    return await super.validate(data);
  }
}
