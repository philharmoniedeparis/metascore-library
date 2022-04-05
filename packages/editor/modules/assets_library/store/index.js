import { defineStore } from "pinia";
import { normalize } from "./utils/normalize";
import { load } from "@metascore-library/core/services/ajax";

export default defineStore("assets-library", {
  state: () => {
    return {
      list: [],
      items: {},
      processing: false,
      upload_progress: null,
      error: null,
    };
  },
  getters: {
    getName() {
      return (item) => {
        return item.name;
      };
    },
    getFile() {
      return (item) => {
        return item.shared ? item.file : item;
      };
    },
    getType() {
      return (item) => {
        if (item.type) {
          return item.type;
        }

        const file = item.shared ? item.file : item;
        const matches = /^(image|audio|video)\/.*/.exec(file.mimetype);
        return matches ? matches[1] : null;
      };
    },
    get() {
      return (id) => {
        const item = this.items[id];
        return item && !item.$deleted ? item : null;
      };
    },
    all() {
      return this.list
        .map((id) => {
          return this.get(id);
        })
        .filter((a) => a);
    },
    filterByType() {
      return (type) => {
        return this.all.filter((a) => {
          return this.getType(a) === type;
        });
      };
    },
  },
  actions: {
    init(data) {
      const normalized = normalize(data);
      this.items = normalized.entities.items;
      this.list = normalized.result;
    },
    add(item) {
      if (this.list.includes(item.id)) {
        return;
      }

      this.items[item.id] = item;
      this.list.push(item.id);
    },
    delete(id) {
      const item = this.items[id];
      if (item) {
        item.$deleted = true;
      }
    },
    upload(url, files) {
      this.processing = true;
      this.upload_progress = 0;

      const data = new FormData();
      files.forEach((file) => {
        data.append(`files[asset][]`, file);
      });

      return load(url, {
        method: "post",
        data,
        onUploadProgress: (evt) => {
          this.upload_progress = evt.loaded / evt.total;
        },
      })
        .then((items) => {
          items.map(this.add);
          return items;
        })
        .catch((e) => {
          this.error = e;
        })
        .finally(() => {
          this.processing = false;
          this.upload_progress = null;
        });
    },
    generate(url, data) {
      this.processing = true;

      return load(url, { method: "post", data })
        .then((item) => {
          this.add(item);
          return item;
        })
        .catch((e) => {
          this.error = e;
        })
        .finally(() => {
          this.processing = false;
        });
    },
  },
});
