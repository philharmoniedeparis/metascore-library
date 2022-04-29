import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";

export default class DeviceModule extends AbstractModule {
  static id = "device";

  constructor({ app }) {
    super(arguments);

    app.provide(
      "$deviceHasTouch",
      window.matchMedia("(any-pointer: coarse)").matches
    );
  }
}
