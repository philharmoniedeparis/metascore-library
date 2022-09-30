import Command from "@ckeditor/ckeditor5-core/src/command";
import findAttributeRange from "@ckeditor/ckeditor5-typing/src/utils/findattributerange";

import { isTriggerableElement } from "./utils";

/**
 * The unlink command. It is used by the {@link module:link/link~Link link plugin}.
 *
 * @extends module:core/command~Command
 */
export default class RemoveBehaviorTriggerCommand extends Command {
  /**
   * @inheritDoc
   */
  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const selectedElement = selection.getSelectedElement();

    // A check for any integration that allows linking elements (e.g. `LinkImage`).
    // Currently the selection reads attributes from text nodes only. See #7429 and #7465.
    if (isTriggerableElement(selectedElement, model.schema)) {
      this.isEnabled = model.schema.checkAttribute(
        selectedElement,
        "behaviorTrigger"
      );
    } else {
      this.isEnabled = model.schema.checkAttributeInSelection(
        selection,
        "behaviorTrigger"
      );
    }
  }

  /**
   * Executes the command.
   *
   * When the selection is collapsed, it removes the `behaviorTrigger` attribute from each node with the same `behaviorTrigger` attribute value.
   * When the selection is non-collapsed, it removes the `behaviorTrigger` attribute from each node in selected ranges.
   *
   * # Decorators
   *
   * If {@link module:link/link~LinkConfig#decorators `config.link.decorators`} is specified,
   * all configured decorators are removed together with the `behaviorTrigger` attribute.
   *
   * @fires execute
   */
  execute() {
    const editor = this.editor;
    const model = this.editor.model;
    const selection = model.document.selection;
    const addBehaviorTriggerCommand = editor.commands.get("addBehaviorTrigger");

    model.change((writer) => {
      // Get ranges to unlink.
      const rangesToUnlink = selection.isCollapsed
        ? [
            findAttributeRange(
              selection.getFirstPosition(),
              "behaviorTrigger",
              selection.getAttribute("behaviorTrigger"),
              model
            ),
          ]
        : model.schema.getValidRanges(selection.getRanges(), "behaviorTrigger");

      // Remove `behaviorTrigger` attribute from specified ranges.
      for (const range of rangesToUnlink) {
        writer.removeAttribute("behaviorTrigger", range);
        // If there are registered custom attributes, then remove them during unlink.
        if (addBehaviorTriggerCommand) {
          for (const manualDecorator of addBehaviorTriggerCommand.manualDecorators) {
            writer.removeAttribute(manualDecorator.id, range);
          }
        }
      }
    });
  }
}
