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
      {{ formattedLabel }}
    </base-button>

    <div ref="toolbar-container" class="toolbar-container"></div>
  </form-group>
</template>

<script>
import { markRaw } from "vue";
import { isObject } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import { getLocale } from "@metascore-library/core/services/i18n";
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
      freezeComponent,
      unfreezeComponent,
    } = useModule("app_preview");
    return {
      store,
      appPreveiwIframe,
      getComponentElement,
      preview,
      freezeComponent,
      unfreezeComponent,
    };
  },
  data() {
    return {
      settingUpEditor: false,
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
    editing: {
      get() {
        return this.store.editingTextContent;
      },
      set(value) {
        this.store.editingTextContent = value;
      },
    },
    formattedLabel() {
      if (isObject(this.label)) {
        return this.editing ? this.label.off : this.label.on;
      }

      return this.label;
    },
  },
  watch: {
    component: {
      async handler(value, oldValue) {
        if (
          value &&
          oldValue &&
          value.type === oldValue.type &&
          value.id === oldValue.id
        ) {
          return;
        }

        await this.stopEditing();

        if (oldValue) {
          this.getComponentElement(oldValue).removeEventListener(
            "dblclick",
            this.onComponentDblclick
          );
        }

        if (value) {
          this.getComponentElement(value).addEventListener(
            "dblclick",
            this.onComponentDblclick
          );
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
  async beforeUnmount() {
    if (this.component) {
      this.getComponentElement(this.component).removeEventListener(
        "dblclick",
        this.onComponentDblclick
      );
    }

    await this.stopEditing();
  },
  methods: {
    getInnerElement() {
      if (!this.component) return null;

      return this.getComponentElement(this.component)?.querySelector(
        ":scope > .metaScore-component--inner"
      );
    },
    getContentsElement() {
      return this.getInnerElement()?.querySelector(":scope > .contents");
    },
    onComponentDblclick() {
      if (!this.disabled) this.startEditing();
    },
    onComponentInnerElKeyEvent(evt) {
      if (!this.disabled) evt.stopPropagation();
    },
    onButtonClick() {
      this.editing ? this.stopEditing() : this.startEditing();
    },
    async startEditing() {
      if (this.editing) return;

      this.editing = true;
      this.settingUpEditor = true;

      this.freezeComponent(this.component);

      const { default: createEditor } = await import("../../ckeditor");

      try {
        const editor = await createEditor(this.getContentsElement(), {
          language: getLocale(),
          extraFonts: this.extraFonts,
        });
        this.editor = markRaw(editor);
        this.setupEditor();
      } catch (e) {
        // @todo: handle errors.
        console.error(e);
      } finally {
        this.settingUpEditor = false;
      }

      // Prevent key events from propagating.
      const inner_el = this.getInnerElement();
      if (inner_el) {
        inner_el.addEventListener("keydown", this.onComponentInnerElKeyEvent);
        inner_el.addEventListener("keyup", this.onComponentInnerElKeyEvent);
      }
    },
    setupEditor() {
      this.editor.editing.view.change((writer) => {
        // Remove ck-editor special classes.
        // See https://github.com/ckeditor/ckeditor5/issues/6280#issuecomment-597059725
        const viewEditableRoot = this.editor.editing.view.document.getRoot();
        writer.removeClass("ck-editor__editable_inline", viewEditableRoot);
        writer.removeClass("ck-content", viewEditableRoot);
      });

      // Append editor toolbar.
      const toolbar = this.editor.ui.view.toolbar.element;
      this.$refs["toolbar-container"].appendChild(toolbar);

      // Scroll toolbar into view.
      this.$refs["toolbar-container"].scrollIntoView();

      // Listener to document data changes.
      this.editor.model.document.on(
        "change:data",
        this.onEditorDocumentDataChange
      );

      // Add listeners to ContextualBalloon positions
      if (this.editor.plugins.has("ContextualBalloon")) {
        const contextualballoon_view =
          this.editor.plugins.get("ContextualBalloon").view;
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
      if (this.editor.plugins.has("SourceEditing")) {
        const sourceediting = this.editor.plugins.get("SourceEditing");
        sourceediting.on(
          "change:isSourceEditingMode",
          this.onEditorSourceEditingModeChange
        );
      }
    },
    onEditorDocumentDataChange() {
      this.value = this.editor.getData();
    },
    onEditorContextualBallonPositionSet(evt, prop, value) {
      const offset = this.appPreveiwIframe.getBoundingClientRect()[prop];
      evt.return = value + offset;
    },
    onEditorSourceEditingModeChange(evt, name, isSourceEditingMode) {
      if (!this.component) return;

      this.getComponentElement(this.component)?.classList.toggle(
        "sourceediting",
        isSourceEditingMode
      );
    },
    async stopEditing() {
      if (!this.editing) return;

      if (this.editor) {
        this.editor.ui.view.toolbar.element.remove();
        await this.editor.destroy();
        this.editor = null;
      }

      const inner_el = this.getInnerElement();
      if (inner_el) {
        inner_el.removeEventListener(
          "keydown",
          this.onComponentInnerElKeyEvent
        );
        inner_el.removeEventListener("keyup", this.onComponentInnerElKeyEvent);
      }

      this.unfreezeComponent(this.component);

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
    color: var(--metascore-color-black);
    background: var(--metascore-color-white);
    border-radius: 1.5em;
    opacity: 1;
  }

  &.editing {
    button {
      color: var(--metascore-color-white);
      background: var(--metascore-color-bg-primary);
    }
  }

  .toolbar-container {
    :deep(button) {
      opacity: 1;
    }
  }
}
</style>
