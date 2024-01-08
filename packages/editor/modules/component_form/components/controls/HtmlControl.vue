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

    <element-highlighter
      v-if="editing"
      :[scopeAttribute]="''"
      class="html-control-highlighter"
      :border-width="0"
      :rect="highlighterRect"
      :teleport-target="appRendererEl"
      :overlay-opacity="0.5"
      :allow-interaction="true"
      @click="onHighlighterClick"
    />
  </form-group>
</template>

<script>
import { markRaw } from "vue";
import { isObject } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import { getLocale } from "@metascore-library/core/services/i18n";
import { getRectWithoutTransforms } from "@metascore-library/core/utils/dom";
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
    const { el: appRendererEl, getComponentElement } =
      useModule("app_renderer");
    const { preview, freezeComponent, unfreezeComponent } =
      useModule("app_preview");
    return {
      store,
      appRendererEl,
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
      scopeAttribute: null,
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
        if (oldValue) {
          await this.stopEditing(oldValue);

          this.getComponentElement(oldValue)?.removeEventListener(
            "dblclick",
            this.onComponentDblclick
          );
        }

        if (value) {
          this.getComponentElement(value)?.addEventListener(
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
    editing(value) {
      if (value) {
        this.getComponentElement(this.component).setAttribute(
          this.scopeAttribute,
          ""
        );
      } else {
        this.getComponentElement(this.component).removeAttribute(
          this.scopeAttribute
        );
      }
    },
  },
  mounted() {
    this.scopeAttribute = this.$options.__scopeId;
  },
  async beforeUnmount() {
    if (this.component) {
      this.getComponentElement(this.component)?.removeEventListener(
        "dblclick",
        this.onComponentDblclick
      );
    }

    await this.stopEditing();
  },
  methods: {
    getInnerElement(component = this.component) {
      if (!component) return null;

      return this.getComponentElement(component)?.querySelector(
        ":scope > .metaScore-component--inner"
      );
    },
    getContentsElement() {
      return this.getInnerElement()?.querySelector(":scope > .contents");
    },
    onComponentDblclick() {
      if (!this.disabled) this.startEditing();
    },
    onButtonClick() {
      this.editing ? this.stopEditing() : this.startEditing();
    },
    stopEvent(evt) {
      if (!this.disabled) evt.stopPropagation();
    },
    async startEditing() {
      if (this.editing) return;

      this.editing = true;
      this.settingUpEditor = true;

      this.freezeComponent(this.component);

      const { default: createEditor } = await import("../../ckeditor");

      try {
        const el = this.getContentsElement();
        const editor = await createEditor(el, {
          language: getLocale(),
          extraFonts: this.extraFonts,
        });
        this.editor = markRaw(editor);
        this.setupEditor();

        const inner_el = this.getInnerElement();
        if (inner_el) {
          // Prevent pointerdown events from propagating,
          // to prevent the swipe action in blocks.
          inner_el.addEventListener("pointerdown", this.stopEvent);
          // Prevent key events from propagating.
          inner_el.addEventListener("keydown", this.stopEvent);
          inner_el.addEventListener("keyup", this.stopEvent);
        }

        this.highlighterRect = getRectWithoutTransforms(
          this.getComponentElement(this.component)
        );
      } catch (e) {
        // @todo: handle errors.
        console.error(e);
      } finally {
        this.settingUpEditor = false;
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

      // Listener to drag and drop events.
      this.editor.editing.view.document.on("dragover", this.onEditorDragover, {
        priority: "high",
      });
      this.editor.editing.view.document.on("drop", this.onEditorDrop, {
        priority: "high",
      });

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
    onEditorSourceEditingModeChange(evt, name, isSourceEditingMode) {
      if (!this.component) return;

      this.getComponentElement(this.component)?.classList.toggle(
        "sourceediting",
        isSourceEditingMode
      );
    },
    isDropAllowed(evt) {
      const { types } = evt.dataTransfer;
      const is_metascore_data = types.some((type) => {
        return type.startsWith("metascore/");
      });

      return !is_metascore_data || types.includes("text/html");
    },
    onEditorDragover(evt, data) {
      const { domEvent } = data;
      if (!this.isDropAllowed(domEvent)) {
        domEvent.stopPropagation();
        domEvent.dataTransfer.dropEffect = "none";
        evt.stop();
      }
    },
    onEditorDrop(evt, data) {
      const { domEvent } = data;
      if (!this.isDropAllowed(domEvent)) {
        domEvent.preventDefault();
        domEvent.stopPropagation();
        evt.stop();
      }
    },
    onHighlighterClick() {
      this.stopEditing();
    },
    async stopEditing(component = this.component) {
      if (!this.editing) return;

      if (this.editor) {
        this.editor.ui.view.toolbar.element.remove();
        await this.editor.destroy();
        this.editor = null;
      }

      const inner_el = this.getInnerElement(component);
      if (inner_el) {
        inner_el.removeEventListener("pointerdown", this.stopEvent);
        inner_el.removeEventListener("keydown", this.stopEvent);
        inner_el.removeEventListener("keyup", this.stopEvent);
      }

      this.unfreezeComponent(component);

      this.editing = false;
      this.highlighterRect = null;
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
      background: var(--metascore-color-bg-tertiary);
    }
  }

  .toolbar-container {
    :deep(button) {
      opacity: 1;
    }
  }
}

// Scoping is done via scopeAttribute.
.html-control-highlighter {
  z-index: 0;

  :deep(.overlay) {
    z-index: 998;
  }

  :deep(.highlight) {
    border-radius: 0;
    z-index: 999;
  }
}

// Scoping is done via scopeAttribute.
.metaScore-component {
  z-index: 1;
}
</style>
