import { useModule } from "@metascore-library/core/services/module-manager";

function uploadFiles(url, files, progress_callback) {
  const data = new FormData();

  files.forEach((file) => {
    data.append(`files[asset][]`, file);
  });

  return useModule("ajax").post(url, {
    data,
    onUploadProgress: progress_callback,
  });
}

function generateAsset(url, data) {
  return useModule("ajax").post(url, {
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
  });
}

export { uploadFiles, generateAsset };
