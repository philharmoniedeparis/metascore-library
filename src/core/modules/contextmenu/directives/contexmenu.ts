import useStore from "../store";

const state = new WeakMap();

function update(el, binding) {
  if (!state.has(el)) {
    state.set(el, {});
  }

  const data = state.get(el);
  data.items = binding.value;

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

function remove(el) {
  if (state.has(el)) {
    const { listener } = state.get(el);
    if (listener) {
      el.removeEventListener("contextmenu", listener);
    }

    state.delete(el);
  }
}

export default {
  mounted(el, binding) {
    update(el, binding);
  },
  updated(el, binding) {
    update(el, binding);
  },
  beforeUnmount(el) {
    remove(el);
  },
};
