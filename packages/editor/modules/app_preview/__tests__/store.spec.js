import { createApp } from "vue";
import { setActivePinia, createPinia } from "pinia";
import { init as createI18n } from "@metascore-library/core/services/i18n";
import {
  registerModules,
  useModule,
} from "@metascore-library/core/services/module-manager";
import AppComponents from "@metascore-library/core/modules/app_components";
import useStore from "../store";

describe("AppPreview store", () => {
  const i18n = createI18n();

  let scenario = null;
  let cursor = null;

  beforeAll(async () => {
    let pinia = createPinia();
    let app = createApp({}).use(i18n);
    app.use(pinia);
    setActivePinia(pinia);

    registerModules([AppComponents], { app, pinia });

    const { init: initComponents, getComponent } = useModule("app_components");

    const components = [
      {
        id: "scenario-1",
        type: "Scenario",
        name: "Scenario 1",
        children: [
          {
            id: "cursor-1",
            type: "Cursor",
            name: "Cursor 1",
          },
        ],
      },
    ];

    await initComponents(components);

    scenario = getComponent("Scenario", "scenario-1");
    cursor = getComponent("Cursor", "cursor-1");
  });

  it("selects a component", () => {
    const store = useStore();

    expect(store.getSelectedComponents).toHaveLength(0);

    store.selectComponent(scenario);
    expect(store.getSelectedComponents).toHaveLength(1);
    expect(store.isComponentSelected(scenario)).toBeTruthy();
    expect(store.getSelectedComponents[0]).toEqual(
      expect.objectContaining({
        type: scenario.type,
        id: scenario.id,
      })
    );
  });

  it("appends a component to the selection", () => {
    const store = useStore();
    store.selectComponent(cursor, true);
    expect(store.getSelectedComponents).toHaveLength(2);
    expect(store.isComponentSelected(cursor)).toBeTruthy();
    expect(store.isComponentSelected(scenario)).toBeTruthy();
    expect(store.getSelectedComponents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: cursor.type,
          id: cursor.id,
        }),
        expect.objectContaining({
          type: scenario.type,
          id: scenario.id,
        }),
      ])
    );
  });

  it("selects a component without keeping existing selection", () => {
    const store = useStore();
    store.selectComponent(cursor);
    expect(store.isComponentSelected(cursor)).toBeTruthy();
    expect(store.isComponentSelected(scenario)).not.toBeTruthy();
    expect(store.getSelectedComponents).toHaveLength(1);
    expect(store.componentHasSelectedDescendents(scenario)).toBeTruthy();
  });
});
