import "../mocks/matchMedia";
import { mount } from "@vue/test-utils";
import { createStore } from "../../src/player/store";
import VueDOMPurifyHTML from "vue-dompurify-html";
import Content from "../../src/core/models/components/Content";
import Component from "../../src/player/components/ContentComponent.vue";

describe("ContentComponent.vue", () => {
  const store = createStore();

  it("renders model text when passed", async () => {
    const text = "my content";

    const {
      Content: [content],
    } = await Content.insert({
      data: {
        text,
      },
    });

    const wrapper = mount(Component, {
      global: {
        plugins: [store, VueDOMPurifyHTML],
      },
      props: {
        model: content,
      },
    });

    expect(wrapper.text()).toBe(text);
  });
});
