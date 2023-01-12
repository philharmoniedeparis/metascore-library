import { v4 as uuid } from "uuid";
import { merge } from "lodash";
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
      },
    });
  }

  /**
   * Get data embedded in the SVG content
   *
   * @param {string} url The SVG's Url
   * @returns {Promise<object>} A promise that resolves with the embedded data
   */
  static async getEmbeddedData(url) {
    const { default: Lottie } = await import("lottie-web");

    return new Promise((resolve) => {
      const data = {};

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
        // Get duration.
        data.duration = animation.getDuration();

        // Get colors.
        const colors = [];
        ["color1", "color2"].forEach((c) => {
          const path = container.querySelector(`.${c} path`);
          if (path) {
            const style = getComputedStyle(path);
            colors.push(style.fill);
          }
        });
        if (colors.length > 0) {
          data.colors = colors;
        }

        animation.destroy();
        container.remove();
        resolve(data);
      });

      animation.addEventListener("error", () => {
        animation.destroy();
        container.remove();
        resolve({});
      });
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

    return await super.validate(data);
  }
}
