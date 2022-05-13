import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import VueDOMPurifyHTML from "vue-dompurify-html";
import { registerModule } from "@metascore-library/core/services/module-manager";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import Content from "../models/Content";
import ComponentWrapper from "../components/ComponentWrapper.vue";
import Component from "../components/ContentComponent.vue";

describe("ContentComponent.vue", () => {
  it("renders text", async () => {
    const text = "my content";

    const content = await Content.create({
      type: "Content",
      id: "Content-test",
      text,
    });

    const wrapper = mount(Component, {
      global: {
        plugins: [
          createTestingPinia(),
          VueDOMPurifyHTML,
          {
            install(app) {
              registerModule(MediaPlayer, { app });
              app.component("ComponentWrapper", ComponentWrapper);
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
