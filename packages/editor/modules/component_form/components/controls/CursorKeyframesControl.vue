<i18n>
{
  "fr": {
    "on": "Enregistrer les positions",
    "off": "Arrêter l’enregistrement",
  },
  "en": {
    "on": "Record positions",
    "off": "Stop recording",
  },
}
</i18n>

<template>
  <form-group
    :class="['control', 'cursor-keyframes', { disabled, recording }]"
    :description="description"
  >
    <base-button type="button" @click="onButtonClick">
      {{ formattedLabel }}
    </base-button>

    <teleport v-if="recording" :to="componentEl">
      <cursor-keyframes-editor v-model="value" />
    </teleport>

    <element-highlighter
      v-if="recording"
      v-bind:[scopeAttribute]="''"
      class="cursor-keyframes-control-highlighter"
      :border-width="0"
      :rect="highlighterRect"
      :teleport-target="appRendererEl"
      :allow-interaction="true"
      @click="onHighlighterClick"
    />
  </form-group>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";
import { isObject } from "lodash";
import useStore from "../../store";
import CursorKeyframesEditor from "./CursorKeyframesEditor.vue";

export default {
  components: {
    CursorKeyframesEditor,
  },
  props: {
    component: {
      type: Object,
      required: true,
    },
    label: {
      type: [String, Object],
      default: null,
      validator(value) {
        if (isObject(value)) {
          return "on" in value && "off" in value;
        }
        return true;
      },
    },
    description: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  emits: ["update:modelValue"],
  setup() {
    const store = useStore();
    const { el: appRendererEl } = useModule("app_renderer");
    const { getComponentElement } = useModule("app_preview");
    return { store, appRendererEl, getComponentElement };
  },
  data() {
    return {
      scopeId: null,
      highlighterRect: null,
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    componentEl() {
      return this.getComponentElement(this.component);
    },
    recording: {
      get() {
        return this.store.recordingCursorKeyframes;
      },
      set(value) {
        this.store.recordingCursorKeyframes = value;
      },
    },
    formattedLabel() {
      if (isObject(this.label)) {
        return this.recording ? this.label.off : this.label.on;
      }

      return this.label;
    },
  },
  watch: {
    recording(value) {
      if (value) {
        this.highlighterRect = this.componentEl.getBoundingClientRect();
        this.componentEl.setAttribute(this.scopeAttribute, "");
      } else {
        this.highlighterRect = null;
        this.componentEl.removeAttribute(this.scopeAttribute);
      }
    },
  },
  mounted() {
    this.scopeAttribute = this.$options.__scopeId;
  },
  beforeUnmount() {
    this.recording = false;
  },
  methods: {
    onButtonClick() {
      this.recording = !this.recording;
    },
    onHighlighterClick() {
      this.recording = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }

  button {
    padding: 0.5em 1em 0.5em 0.5em;
    color: var(--metascore-color-black);
    background: var(--metascore-color-white);
    border-radius: 1.5em;
    opacity: 1;

    &::before {
      content: "";
      display: block;
      background: #f00;
      width: 1em;
      height: 1em;
      border-radius: 100%;
      margin-right: 0.5em;
    }
  }

  &.recording {
    button {
      background: var(--metascore-color-bg-tertiary);

      &::before {
        animation: pulse 1s ease infinite;
      }
    }
  }
}

.cursor-keyframes-control-highlighter {
  z-index: 0;

  :deep(.overlay) {
    z-index: 998;
  }

  :deep(.highlight) {
    border-radius: 0;
    z-index: 999;
  }
}

// The scoping is done via scopeAttribute.
.metaScore-component {
  z-index: 1;
}
</style>
