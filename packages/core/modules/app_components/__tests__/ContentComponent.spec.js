import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import VueDOMPurifyHTML from "vue-dompurify-html";
import { registerModules } from "@metascore-library/core/services/module-manager";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import MediaCuepoints from "@metascore-library/core/modules/media_cuepoints";
import Content from "../models/Content";
import ComponentWrapper from "../components/ComponentWrapper.vue";
import Component from "../components/ContentComponent.vue";

jest.mock("@metascore-library/core/modules/media_player");

describe("ContentComponent.vue", () => {
  it("renders text", async () => {
    const pinia = createTestingPinia();

    const text = "my content";

    const content = await Content.create({
      type: "Content",
      id: "Content-test",
      text,
    });

    const wrapper = mount(Component, {
      global: {
        components: {
          ComponentWrapper,
        },
        plugins: [
          pinia,
          VueDOMPurifyHTML,
          {
            install: (app) => {
              registerModules([MediaPlayer, MediaCuepoints], { app, pinia });
            },
          },
        ],
      },
      props: {
        component: content,
      },
    });

    expect(wrapper.text()).toBe(text);
  });
});
