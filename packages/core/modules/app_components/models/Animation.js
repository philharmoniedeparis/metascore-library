import { merge, round } from "lodash";
import { EmbeddableComponent } from ".";
import {
  createUrlField,
  createIntegerField,
  createTimeField,
  createBooleanField,
  createArrayField,
  createColorField,
} from "@metascore-library/core/utils/schema";

export default class Animation extends EmbeddableComponent {
  /**
   * @inheritdoc
   */
  static baseModel = EmbeddableComponent;

  /**
   * @inheritdoc
   */
  static type = "Animation";

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
        "start-frame": createIntegerField({
          title: "Start frame",
          default: 1,
          minimum: 1,
        }),
        "loop-duration": createTimeField({
          ajv,
          title: "Loop duration",
        }),
        reversed: createBooleanField({
          title: "Reversed",
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
      },
    });
  }

  /**
   * Get defaults embedded in the SVG content
   *
   * @param {string} url The SVG's Url
   * @returns {Promise<object>} A promise that resolves with the defaults
   */
  static async getEmbeddedData(url) {
    const { default: Lottie } = await import("lottie-web");
    const data = {};

    return new Promise((resolve) => {
      const container = document.createElement("div");
      container.style.visibility = "hidden";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);

      const animation = Lottie.loadAnimation({
        container,
        path: url,
        renderer: "svg",
        autoplay: false,
      });
      animation.addEventListener("DOMLoaded", () => {
        // Set loop duration.
        data["loop-duration"] = round(animation.getDuration(), 2);

        // Set colors.
        data.colors = [];
        ["color1", "color2"].forEach((name) => {
          const path = container.querySelector(`.${name} path`);
          if (path) {
            const style = getComputedStyle(path);
            data.colors.push(style.fill);
          }
        });

        animation.destroy();
        container.remove();
        resolve(data);
      });

      animation.addEventListener("error", () => {
        animation.destroy();
        container.remove();
        resolve(data);
      });
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
   * Set defaults from embedded data.
   *
   * @param {Object} data The data to set defaults on.
   */
  setEmbeddedDefaults(data) {
    const { "loop-duration": loop_duration = null, colors = [] } =
      this._embedded_data;

    // Set loop duration.
    if (!("loop-duration" in data) || data["loop-duration"] === null) {
      data["loop-duration"] = loop_duration;
    }

    // Set colors.
    data.colors = colors.map((color, index) => {
      return data.colors?.at(index) ?? color;
    });
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
