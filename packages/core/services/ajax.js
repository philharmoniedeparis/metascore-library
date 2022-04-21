import { merge, omit } from "lodash";

let defaults = {
  baseURL: document.location.origin,
  headers: {},
  credentials: "same-origin",
  responseType: "json",
};

function setDefaults(values) {
  defaults = {
    ...defaults,
    ...values,
  };
}

async function decodeResponse(response, type = "json") {
  switch (type) {
    case "arraybuffer":
    case "blob":
    case "formData":
    case "json":
      return await response[type]();
    default:
      return await response.text();
  }
}

function load(
  url,
  { method = "get", params = {}, data = null, ...config } = {}
) {
  const options = merge({}, defaults, { method, ...config });
  const responseType = options.responseType;

  const _url = new URL(url, options.baseURL);
  Object.entries(params).forEach(([key, value]) => {
    _url.searchParams.append(key, value);
  });

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(
    _url.toString(),
    omit(options, ["baseURL", "data", "responseType"])
  )
    .then(async (response) => {
      if (!response.ok) {
        let data = await decodeResponse(response, responseType);
        response.data = data;
        throw new Error(response, response.statusText);
      }
      return response;
    })
    .then((response) => decodeResponse(response, responseType));
}

export { setDefaults, load };
