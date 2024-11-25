import { useModule } from "@core/services/module-manager";

async function uploadFiles(url, files, progress_callback) {
  const data = new FormData();

  files.forEach((file) => {
    data.append(`files[asset][]`, file);
  });

  return await useModule("ajax").post(url, {
    data,
    onUploadProgress: progress_callback,
  });
}

async function generateAsset(url, data) {
  return await useModule("ajax").post(url, {
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
  });
}

export { uploadFiles, generateAsset };
