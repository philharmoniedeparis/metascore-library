export default function createDirective(store) {
  return {
    mounted(el, bindings) {
      const { value: items, modifiers } = bindings;

      function onContextMenu(evt) {
        if (evt.ctrlKey) {
          return;
        }

        if (store.state.contextmenu.isShown) {
          store.commit("contextmenu/hide");
        }

        if (Array.isArray(items) && items.length) {
          items.forEach((item) => {
            store.commit("contextmenu/addItem", item);
          });
        }

        if (modifiers.stop) {
          evt.stopPropagation();
        }

        if (modifiers.show) {
          store.commit("contextmenu/show", {
            x: evt.pageX,
            y: evt.pageY,
            target: evt.target,
          });
        }

        evt.preventDefault();
      }

      el.addEventListener("contextmenu", onContextMenu);
      el._onContextMenu = onContextMenu;
    },
    beforeUnmount(el) {
      if (el._onContextMenu) {
        el.removeEventListener("contextmenu", el._onContextMenu);
      }
    },
  };
}
