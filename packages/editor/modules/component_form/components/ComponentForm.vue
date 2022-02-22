<template>
  <div v-if="masterModel" class="component-form">
    <h2 class="title">{{ title }}</h2>
    <div class="controls">
      <control-dispatcher
        v-for="(subSchema, property) in properties"
        :key="property"
        :property="property"
        :model-value="masterModel[property]"
        :schema="subSchema"
        @update:model-value="update(property, $event)"
      />
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { mapGetters, mapActions } from "vuex";
import { omit, intersection } from "lodash";
import ControlDispatcher from "./controls/ControlDispatcher.vue";

export default {
  components: {
    ControlDispatcher,
  },
  provide() {
    return {
      validator: computed(() => this.validator),
    };
  },
  computed: {
    ...mapGetters({ selectedComponents: "getSelectedComponents" }),
    masterModel() {
      return this.selectedComponents[0];
    },
    validator() {
      return this.masterModel?.$ajv;
    },
    commonClass() {
      let commonClasses = [];
      this.selectedComponents.forEach((model, index) => {
        const modelChain = model.$modelChain;
        commonClasses =
          index > 0 ? intersection(commonClasses, modelChain) : modelChain;
      });
      return commonClasses[0];
    },
    title() {
      return this.commonClass?.entity;
    },
    schema() {
      return this.commonClass?.schema;
    },
    properties() {
      return omit(this.schema.properties, ["id", "type", "editor"]);
    },
  },
  methods: {
    ...mapActions(["updateComponents"]),
    update(property, value) {
      this.updateComponents({
        models: this.selectedComponents,
        data: {
          [property]: value,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.component-form {
  display: flex;
  height: 100%;
  flex-direction: column;
  background: $mediumgray;
  overflow: auto;
  color: $white;

  h2.title {
    position: sticky;
    top: 0;
    flex: 0 0 auto;
    margin: 0;
    padding: 0.5em;
    font-size: 1em;
    font-weight: normal;
    background: $lightgray;
    border-bottom: 0.25em solid $mediumgray;
    z-index: 1;
  }

  .controls {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-content: flex-start;
    background: $lightgray;

    > .control {
      padding: 0.25em 0.5em;
    }
  }

  ::v-deep(.control) {
    margin: 0;

    .input-wrapper {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      flex: 1 1 auto;
    }

    label,
    .control:not(:last-of-type) {
      margin-right: 0.5em;
    }

    label {
      flex: 0 0 auto;
      align-self: center;
      white-space: nowrap;
    }

    input {
      min-width: 0;
      flex: 1;
    }

    &.animated {
      background: $mediumgray;
      order: 2;

      input {
        &:not([type="checkbox"]):not([type="radio"]) {
          background: $lightgray;
        }
      }
    }

    &[data-property="name"] {
      label {
        @include sr-only;
      }
    }
  }
}
</style>
