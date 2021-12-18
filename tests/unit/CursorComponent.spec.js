import "../mocks/ResizeObserver";
import "../mocks/matchMedia";
import { mount } from "@vue/test-utils";
import { createStore } from "../../src/player/store";
import Cursor from "../../src/core/models/components/Cursor";
import Component from "../../src/player/components/CursorComponent.vue";

describe("CursorComponent.vue", () => {
  const store = createStore();

  it("renders line", async () => {
    const cursor = await Cursor.new();

    store.commit("media/setDuration", 10);
    store.commit("media/setTime", 2);

    const wrapper = mount(Component, {
      global: {
        plugins: [store],
        provide: {
          seekMediaTo: () => {},
        },
      },
      props: {
        model: cursor,
      },
    });

    expect(wrapper.find("canvas").element.toDataURL("image/png")).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABmJLR0QA/wD/AP+gvaeTAAACCElEQVR4nO3UMQ0AIADAMIJ/z2CB8JCFVsGujfGf9ToAuDNfBwCcMiwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyDAsIMOwgAzDAjIMC8gwLCDDsIAMwwIyDAvIMCwgw7CADMMCMgwLyNiZCgIq6PkEjQAAAABJRU5ErkJggg=="
    );
  });
});
