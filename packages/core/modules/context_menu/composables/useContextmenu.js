import { ref } from "vue";

const items = ref([]);

function addItem(item) {
  items.value.push(item);
}

function addItems(new_items) {
  items.value.push(...new_items);
}

function reset() {
  items.value = [];
}

export default function () {
  return {
    items,
    addItem,
    addItems,
    reset,
  };
}
