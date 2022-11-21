<template>
  <form-group
    :class="['control', 'html', { disabled, editing }]"
    :description="description"
    :required="required"
  >
    <base-button
      type="button"
      :loading="settingUpEditor"
      @click="onButtonClick"
    >
      {{ label }}
    </base-button>

    <div ref="toolbar-container" class="toolbar-container" />
  </form-group>
</template>

<script>
import { markRaw } from "vue";
import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "../../store";

export default {
  props: {
    component: {
      type: Object,
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
    const {
      iframe: appPreveiwIframe,
      getComponentElement,
      preview,
    } = useModule("app_preview");
    return { store, appPreveiwIframe, getComponentElement, preview };
  },
  data() {
    return {
      settingUpEditor: false,
      componentInner: null,
      contentsEl: null,
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
    componentEl() {
      return this.getComponentElement(this.component);
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
    component(value, oldValue) {
      if (oldValue) {
        this.stopEditing(oldValue);
      }
    },
    componentEl: {
      handler(value, oldValue) {
        if (value) {
          value.addEventListener("dblclick", this.onComponentDblclick);

          this.componentInnerEl = value.querySelector(
            ":scope > .metaScore-component--inner"
          );

          this.contentsEl =
            this.componentInnerEl.querySelector(":scope > .contents");
        } else {
          if (oldValue) {
            oldValue.removeEventListener("dblclick", this.onComponentDblclick);
          }
          this.componentInnerEl = null;
          this.contentsEl = null;
        }
      },
      immediate: true,
    },
    preview(value) {
      if (value) {
        this.stopEditing();
      }
    },
  },
  beforeUnmount() {
    if (this.componentEl) {
      this.componentEl.removeEventListener(
        "dblclick",
        this.onComponentDblclick
      );
    }

    this.stopEditing(this.component);
  },
  methods: {
    onComponentDblclick() {
      this.startEditing();
    },
    onComponentInnerElKeyEvent(evt) {
      evt.stopPropagation();
    },
    onButtonClick() {
      if (!this.editing) {
        this.startEditing();
      } else {
        this.stopEditing();
      }
    },
    async startEditing() {
      if (this.editing) {
        return;
      }

      this.editing = true;
      this.settingUpEditor = true;

      const { Editor, getConfig } = await import("../../ckeditor");

      const config = getConfig({
        language: this.$i18n.locale,
        extraFonts: this.extraFonts,
      });

      Editor.create(this.contentsEl, config)
        .then(this.onEditorCreate)
        .catch((e) => {
          // @todo: handle errors.
          console.error(e);
        })
        .finally(() => {
          this.settingUpEditor = false;
        });

      // Prevent key events from propagating.
      this.componentInnerEl.addEventListener(
        "keydown",
        this.onComponentInnerElKeyEvent
      );
      this.componentInnerEl.addEventListener(
        "keyup",
        this.onComponentInnerElKeyEvent
      );
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

      // Add listeners to ContextualBalloon positions
      if (editor.plugins.has("ContextualBalloon")) {
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
      }

      // Add listeners to SourceEditing mode
      if (editor.plugins.has("SourceEditing")) {
        const sourceediting = editor.plugins.get("SourceEditing");
        sourceediting.on(
          "change:isSourceEditingMode",
          this.onEditorSourceEditingModeChange
        );
      }
    },
    onEditorContextualBallonPositionSet(evt, prop, value) {
      const offset = this.appPreveiwIframe.getBoundingClientRect()[prop];
      evt.return = value + offset;
    },
    onEditorSourceEditingModeChange(evt, name, isSourceEditingMode) {
      this.componentEl.classList.toggle("sourceediting", isSourceEditingMode);
    },
    async stopEditing(component = null) {
      if (!this.editing) return;

      component = component ?? this.component;

      if (this.editor) {
        const value = this.editor.getData();

        this.editor.ui.view.toolbar.element.remove();
        await this.editor.destroy();
        this.editor = null;

        this.value = {
          componentsToUpdate: [component],
          value,
        };
      }

      if (this.componentInnerEl) {
        this.componentInnerEl.removeEventListener(
          "keydown",
          this.onComponentInnerElKeyEvent
        );
        this.componentInnerEl.removeEventListener(
          "keyup",
          this.onComponentInnerElKeyEvent
        );
      }

      this.editing = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.control {
  :deep(.input-wrapper) {
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
