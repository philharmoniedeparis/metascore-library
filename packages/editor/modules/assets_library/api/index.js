import { load } from "@metascore-library/core/services/ajax";

function uploadFiles(url, files, progress_callback) {
  const data = new FormData();
  files.forEach((file) => {
    data.append(`files[asset][]`, file);
  });

  return load(url, {
    method: "POST",
    data,
    onUploadProgress: progress_callback,
  });
}

function generateAsset(url, data) {
  return load(url, {
    method: "POST",
    data,
  });
}

export { uploadFiles, generateAsset };
