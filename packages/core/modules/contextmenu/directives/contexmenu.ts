import type { Item } from "../components/ContextMenuItem.vue";
import useStore from "../store";
import type { Directive } from "vue";

const state = new WeakMap();

function update(el: HTMLElement, items: Item[]) {
  if (!state.has(el)) {
    state.set(el, {});
  }

  const data = state.get(el);
  data.items = items;

  if (data.items) {
    if (!("listener" in data)) {
      data.listener = function () {
        const store = useStore();
        store.addItems(data.items);
      };

      el.addEventListener("contextmenu", data.listener);
    }
  } else if ("listener" in data) {
    el.removeEventListener("contextmenu", data.listener);
  }
}

function remove(el: HTMLElement) {
  if (state.has(el)) {
    const { listener } = state.get(el);
    if (listener) {
      el.removeEventListener("contextmenu", listener);
    }

    state.delete(el);
  }
}

export default <Directive<HTMLElement, Item[]>> {
  mounted(el: HTMLElement, binding) {
    update(el, binding.value);
  },
  updated(el: HTMLElement, binding) {
    update(el, binding.value);
  },
  beforeUnmount(el: HTMLElement) {
    remove(el);
  },
};
