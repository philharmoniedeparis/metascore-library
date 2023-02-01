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
   * Set defaults embedded in the SVG content
   *
   * @param {string} url The SVG's Url
   * @param {object} data The model's data
   * @returns {Promise<object>} A promise that resolves after defaults have been set
   */
  static async setEmbeddedDefaults(url, data) {
    const { default: Lottie } = await import("lottie-web");

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
        data["loop-duration"] = animation.getDuration();
        if (!("loop-duration" in data) || data["loop-duration"] === null) {
          data["loop-duration"] = animation.getDuration();
        }

        // Set colors.
        const colors = [];
        ["color1", "color2"].forEach((name) => {
          const path = container.querySelector(`.${name} path`);
          if (path) {
            const style = getComputedStyle(path);
            colors.push(style.fill);
          }
        });
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
        }

        animation.destroy();
        container.remove();
        resolve();
      });

      animation.addEventListener("error", () => {
        animation.destroy();
        container.remove();
        resolve();
      });
    });
  }

  /**
   * @inheritdoc
   */
  async validate(data) {
    if ("src" in data && data.src && this.src !== data.src) {
      await this.constructor.setEmbeddedDefaults(data.src, data);
    }

    return await super.validate(data);
  }
}
