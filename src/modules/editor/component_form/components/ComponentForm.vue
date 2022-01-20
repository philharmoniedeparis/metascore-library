<template>
  <div v-if="masterModel" class="component-form">
    <h2 class="title">{{ title }}</h2>
    <div class="controls">
      <template v-for="(subSchema, key) in properties" :key="key">
        <control-dispatcher
          :property="key"
          :schema="subSchema"
          :value="masterModel[key]"
          @change="onChange"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { omit, intersection } from "lodash";
import ControlDispatcher from "./controls/ControlDispatcher.vue";

export default {
  components: {
    ControlDispatcher,
  },
  provide() {
    return {
      getAjv: () => {
        return this.masterModel?.$ajv;
      },
    };
  },
  computed: {
    ...mapGetters({ selectedComponents: "getSelectedComponents" }),
    masterModel() {
      return this.selectedComponents[0];
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
    onChange(evt) {
      const data = {
        [evt.property]: evt.value,
      };

      this.updateComponents({
        models: this.selectedComponents,
        data,
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
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex: 1 1 auto;

    label,
    .control:not(:last-of-type) {
      margin-right: 0.5em;
    }

    label {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    input {
      flex: 1;
      font-family: inherit;
      color: inherit;
      border: 0;

      &:not([type]),
      &[type=""],
      &[type="text"] {
        border-radius: 0.25em;
      }

      &:not([type="checkbox"]):not([type="radio"]) {
        width: 100%;
        padding: 0.25em 0.5em;
        background: $mediumgray;
        box-sizing: border-box;
      }
    }

    &.animated {
      order: 2;
      background: $mediumgray;

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
