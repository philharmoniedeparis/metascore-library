import { useModule } from "@metascore-library/core/services/module-manager";

export default class Adapter {
  constructor(loader) {
    // The file loader instance to use during the upload.
    this.loader = loader;
  }

  // Starts the upload process.
  // @todo: handle uplaod progress
  async upload() {
    const { uploadFiles } = useModule("assets_library");

    const file = await this.loader.file;
    const assets = await uploadFiles([file]);

    return {
      default: assets[0].url,
    };
  }
}
