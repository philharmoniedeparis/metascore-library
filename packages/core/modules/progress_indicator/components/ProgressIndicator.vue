<template>
  <base-modal class="progress-indicator">
    <label>
      <div v-if="text || $slots.text" class="text">
        <template v-if="text">{{ text }}</template>
        <slot v-else name="text" />
      </div>

      <progress
        role="progressbar"
        aria-describedby="loading-zone"
        tabindex="-1"
        :max="max"
        :value="value"
      ></progress>
    </label>
  </base-modal>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: null,
    },
    max: {
      type: Number,
      default: 1,
    },
    value: {
      type: Number,
      default: null,
    },
  },
};
</script>

<style scoped lang="scss">
.progress-indicator {
  @keyframes indeterminate-progress {
    50% {
      background-position: left;
    }
  }

  label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75em;
    color: var(--metascore-color-white);
  }

  progress {
    position: relative;
    appearance: none;
    inline-size: 100%;
    width: 10em;
    height: 0.5em;
    background-color: var(--metascore-color-bg-secondary);
    border: none;
    border-radius: 1em;
    overflow: hidden;

    &[value] {
      &::-moz-progress-bar,
      &::-webkit-progress-value {
        background-color: var(--metascore-color-white);
      }
      &::-webkit-progress-bar {
        background-color: var(--metascore-color-bg-secondary);
      }
    }

    &:indeterminate {
      &::-moz-progress-bar,
      &::-webkit-progress-bar,
      &::after {
        background: linear-gradient(
          to right,
          var(--metascore-color-bg-secondary) 45%,
          var(--metascore-color-white) 0%,
          var(--metascore-color-white) 55%,
          var(--metascore-color-bg-secondary) 0%
        );
        background-size: 225% 100%;
        background-position: right;
        animation: indeterminate-progress 1.5s infinite ease;
      }

      &::after {
        content: "";
        inset: 0;
        position: absolute;
      }
    }
  }
}
</style>
