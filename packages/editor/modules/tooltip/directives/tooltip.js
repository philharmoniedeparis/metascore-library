import { ref, h, createApp } from "vue";
import Component from "../components/TooltipDirective.vue";

let app = null;
let tooltips = ref([]);
let uid = 0;

function install(el = document.body) {
  if (app) return;

  app = createApp({
    name: "TooltipApp",
    setup() {
      return { tooltips };
    },
    render() {
      return this.tooltips.map((tooltip) => {
        return h(Component, {
          ...tooltip.options,
          key: tooltip.id,
        });
      });
    },
  });

  const wrapper = el.ownerDocument.createElement("div");
  wrapper.classList.add("tooltips");
  el.appendChild(wrapper);
  app.mount(wrapper);
}

function bind(el, value) {
  let options = {
    target: el,
  };

  if (el.title) {
    el.$_orig_title = el.title;
    el.title = "";
  }

  if (el.$_orig_title) {
    options.content = el.$_orig_title;
  }

  if (value) {
    switch (typeof value) {
      case "string":
        options.content = value;
        break;

      case "object":
        options = { ...options, ...value };
        break;
    }
  }

  if (!options.content) {
    unbind(el);
  } else if (el.$_tooltip) {
    el.$_tooltip.options.value = options;
  } else {
    const item = {
      id: uid++,
      options: ref(options),
    };
    tooltips.value.push(item);
    el.$_tooltip = item;
  }
}

function unbind(el) {
  if (el.$_tooltip) {
    const index = tooltips.value.indexOf(el.$_tooltip);
    if (index !== -1) tooltips.value.splice(index, 1);

    delete el.$_tooltip;
  }

  if (el.$_orig_title) el.title = el.$_orig_title;
}

function beforeMount(el, { value, modifiers }) {
  bind(el, value, modifiers);
}

function updated(el, { value, modifiers }) {
  bind(el, value, modifiers);
}

function beforeUnmount(el) {
  unbind(el);
}

export default { beforeMount, updated, beforeUnmount };
export { install };
