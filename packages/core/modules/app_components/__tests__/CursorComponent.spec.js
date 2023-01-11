import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import {
  registerModules,
  useModule,
} from "@metascore-library/core/services/module-manager";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import MediaCuepoints from "@metascore-library/core/modules/media_cuepoints";
import Cursor from "../models/Cursor";
import ComponentWrapper from "../components/ComponentWrapper.vue";
import Component from "../components/CursorComponent.vue";

jest.mock("@metascore-library/core/modules/media_player");

describe("CursorComponent.vue", () => {
  it("renders line", async () => {
    const pinia = createTestingPinia();

    const cursor = await Cursor.create({
      id: "cursor-test",
      form: "linear",
    });

    const wrapper = mount(Component, {
      global: {
        components: {
          ComponentWrapper,
        },
        plugins: [
          pinia,
          {
            install: async (app) => {
              registerModules([MediaPlayer, MediaCuepoints], {
                app,
                pinia,
              });
            },
          },
        ],
      },
      props: {
        component: cursor,
      },
    });

    useModule("media_player").seekTo(10);
    await wrapper.vm.$nextTick();

    expect(wrapper.find("canvas").element.toDataURL("image/png")).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABmJLR0QA/wD/AP+gvaeTAAACCUlEQVR4nO3UsQ0AMAzDsKD//9y+0C0QQD5gT5rZcxe3gaCzfQDgl2ABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQIZgARmCBWQIFpAhWECGYAEZggVkCBaQIVhAhmABGYIFZAgWkCFYQMYDEKECKqANbZwAAAAASUVORK5CYII="
    );
  });
});
