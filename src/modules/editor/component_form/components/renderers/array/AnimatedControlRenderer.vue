<template>
  <fieldset v-if="control.visible" :class="styles.arrayList.root">
    <legend :class="styles.arrayList.legend">
      <label :class="styles.arrayList.label">
        {{ control.label }}
      </label>
    </legend>
    <input type="checkbox" />
    <dispatch-renderer
      :schema="control.schema"
      :uischema="childUiSchema"
      :path="composePaths(control.path, 'items.1')"
      :enabled="control.enabled"
      :renderers="control.renderers"
    />
  </fieldset>
</template>

<script>
import { composePaths, createDefaultValue } from "@jsonforms/core";
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsArrayControl,
} from "@jsonforms/vue";
import { useVanillaArrayControl } from "@jsonforms/vue-vanilla";

export default {
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps(),
  },
  setup(props) {
    return useVanillaArrayControl(useJsonFormsArrayControl(props));
  },
  computed: {
    noData() {
      return !this.control.data || this.control.data.length === 0;
    },
  },
  methods: {
    composePaths,
    createDefaultValue,
    addButtonClick() {
      this.addItem(
        this.control.path,
        createDefaultValue(this.control.schema)
      )();
    },
  },
};
</script>
