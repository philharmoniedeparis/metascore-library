<i18n>
{
  "fr": {
    "start_recording": "Enregistrer les positions",
    "stop_recording": "Arrêter l'enregistrement",
  },
  "en": {
    "start_recording": "Record positions",
    "stop_recording": "Stop recording",
  },
}
</i18n>

<template>
  <form-group
    :class="['control', 'cursor-keyframes', { disabled, recording }]"
    :description="description"
  >
    <styled-button type="button" @click="onButtonClick">
      <template v-if="recording">
        {{ $t("stop_recording") }}
      </template>
      <template v-else>
        {{ $t("start_recording") }}
      </template>
    </styled-button>

    <teleport v-if="recording" :to="componentEl">
      <cursor-keyframes-editor v-model="value" />
    </teleport>
  </form-group>
</template>

<script>
import CursorKeyframesEditor from "./CursorKeyframesEditor.vue";

export default {
  components: {
    CursorKeyframesEditor,
  },
  props: {
    componentEl: {
      type: HTMLElement,
      required: true,
    },
    label: {
      type: String,
      default: null,
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
  data() {
    return {
      recording: false,
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
  },
  beforeUnmount() {
    this.$eventBus.emit("component_form:cursorkeyframesrecordstop");
  },
  methods: {
    onButtonClick() {
      this.recording = !this.recording;

      this.$eventBus.emit(
        `component_form:cursorkeyframesrecord${
          this.recording ? "start" : "stop"
        }`
      );
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
    color: $black;
    background: $white;
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
      background: $darkgray;

      &::before {
        animation: pulse 1s ease infinite;
      }
    }
  }
}
</style>
