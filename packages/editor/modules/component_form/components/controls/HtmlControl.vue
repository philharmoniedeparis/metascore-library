<template>
  <form-group
    :class="['control', 'html', { disabled, editing }]"
    :description="description"
    :required="required"
  >
    <styled-button
      type="button"
      :loading="setting_up_editor"
      @click="onButtonClick"
    >
      {{ label }}
    </styled-button>

    <div ref="toolbar-container" class="toolbar-container" />
  </form-group>
</template>

<script>
import { markRaw } from "vue";
import useStore from "../../store";

export default {
  props: {
    appIframeEl: {
      type: HTMLIFrameElement,
      required: true,
    },
    appComponentEl: {
      type: HTMLElement,
      required: true,
    },
    extraFonts: {
      type: Array,
      default() {
        return [];
      },
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
      type: String,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      setting_up_editor: false,
      editor: null,
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
    editorEl() {
      return this.appComponentEl.querySelector(
        ":scope > .metaScore-component--inner > .contents"
      );
    },
    editing: {
      get() {
        return this.store.editingTextContent;
      },
      set(value) {
        this.store.editingTextContent = value;
      },
    },
  },
  watch: {
    editing(value) {
      if (value) {
        this.setupEditor();
      } else {
        this.destroyEditor();
      }
    },
  },
  beforeUnmount() {
    this.destroyEditor();
  },
  methods: {
    onButtonClick() {
      this.editing = !this.editing;
    },
    async setupEditor() {
      this.setting_up_editor = true;

      const { Editor, getConfig } = await import("../../ckeditor");

      const config = getConfig({
        language: this.$i18n.locale,
        extraFonts: this.extraFonts,
      });

      Editor.create(this.editorEl, config, this.appComponentEl.ownerDocument)
        .then(this.onEditorCreate)
        .catch((e) => {
          // @todo: handle errors.
          console.error(e);
        })
        .finally(() => {
          this.setting_up_editor = false;
        });
    },
    onEditorCreate(editor) {
      editor.editing.view.change((writer) => {
        // Remove ck-editor special classes.
        // See https://github.com/ckeditor/ckeditor5/issues/6280#issuecomment-597059725
        const viewEditableRoot = editor.editing.view.document.getRoot();
        writer.removeClass("ck-editor__editable_inline", viewEditableRoot);
        writer.removeClass("ck-content", viewEditableRoot);
      });

      const toolbar = editor.ui.view.toolbar.element;
      this.editor = markRaw(editor);
      this.$refs["toolbar-container"].appendChild(toolbar);

      const contextualballoon_view =
        editor.plugins.get("ContextualBalloon").view;
      contextualballoon_view.on(
        "set:left",
        this.onEditorContextualBallonPositionSet
      );
      contextualballoon_view.on(
        "set:top",
        this.onEditorContextualBallonPositionSet
      );
    },
    onEditorContextualBallonPositionSet(evt, prop, value) {
      const offset = this.appIframeEl.getBoundingClientRect()[prop];
      evt.return = value + offset;
    },
    destroyEditor() {
      if (this.editor) {
        this.value = this.editor.getData();

        this.editor.ui.view.toolbar.element.remove();
        this.editor.destroy();
        this.editor = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  ::v-deep(.input-wrapper) {
    // #\9 is used here to increase specificity.
    &:not(#\9) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  button {
    padding: 0.5em 1em;
    color: $black;
    background: $white;
    border-radius: 1.5em;
    opacity: 1;
  }

  &.editing {
    button {
      color: $white;
      background: $darkgray;
    }
  }
}
</style>
