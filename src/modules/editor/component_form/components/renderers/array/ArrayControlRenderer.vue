<template>
  <fieldset v-if="control.visible" :class="styles.arrayList.root">
    <legend v-if="control.label" :class="styles.arrayList.legend">
      <label :class="styles.arrayList.label">
        {{ control.label }}
      </label>
    </legend>
    <div
      v-for="(element, index) in control.data"
      :key="`${control.path}-${index}`"
      :class="styles.arrayList.itemWrapper"
    >
      <dispatch-renderer
        :schema="control.schema[index]"
        :uischema="childUiSchema(index)"
        :path="composePaths(control.path, `items.${index}`)"
        :enabled="control.enabled"
        :renderers="control.renderers"
        :cells="control.cells"
      />
    </div>
  </fieldset>
</template>

<script>
import { composePaths } from "@jsonforms/core";
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
  methods: {
    composePaths,
    childUiSchema(index) {
      return {
        type: "Control",
        scope: `${this.control.uischema.scope}/items/${index}`,
      };
    },
  },
};
</script>
