import { useModule } from "@metascore-library/core/services/module-manager";

function uploadFiles(url, files, progress_callback) {
  const data = new FormData();
  files.forEach((file) => {
    data.append(`files[asset][]`, file);
  });

  return useModule("ajax").load(url, {
    method: "POST",
    data,
    onUploadProgress: progress_callback,
  });
}

function generateAsset(url, data) {
  return useModule("ajax").load(url, {
    method: "POST",
    data,
  });
}

export { uploadFiles, generateAsset };
