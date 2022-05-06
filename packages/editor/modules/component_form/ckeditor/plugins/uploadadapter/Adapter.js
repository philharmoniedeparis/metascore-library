import { useModule } from "@metascore-library/core/services/module-manager";

export default class Adapter {
  constructor(loader) {
    // The file loader instance to use during the upload.
    this.loader = loader;
  }

  // Starts the upload process.
  // @todo: handle uplaod progress
  upload() {
    const { uploadFiles } = useModule("assets_library");

    return this.loader.file.then((file) =>
      uploadFiles([file]).then((assets) => {
        return {
          default: assets[0].url,
        };
      })
    );
  }
}
