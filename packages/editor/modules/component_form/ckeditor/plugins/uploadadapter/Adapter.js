import { useModule } from "@metascore-library/core/services/module-manager";

export default class Adapter {
  constructor(loader) {
    // The file loader instance to use during the upload.
    this.loader = loader;
  }

  // Starts the upload process.
  // @todo: handle uplaod progress
  upload() {
    const assetsStore = useModule("assets_library").store;

    return this.loader.file.then((file) =>
      assetsStore.upload([file]).then((assets) => {
        return {
          default: assets[0].url,
        };
      })
    );
  }
}
