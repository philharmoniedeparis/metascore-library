import { Command } from 'ckeditor5'
import { findAttributeRange } from 'ckeditor5'
import { Collection, first, toMap } from 'ckeditor5'

import { AutomaticDecorators, isTriggerableElement } from './utils'

/**
 * The link command. It is used by the {@link module:link/link~Link link feature}.
 *
 * @extends module:core/command~Command
 */
export default class AddBehaviorTriggerCommand extends Command {
  /**
   * The value of the `'behaviorTrigger'` attribute if the start of the selection is located in a node with this attribute.
   *
   * @observable
   * @readonly
   * @member {Object|undefined} #value
   */

  constructor(editor) {
    super(editor)

    /**
     * A collection of {@link module:link/utils~ManualDecorator manual decorators}
     * corresponding to the {@link module:link/link~LinkConfig#decorators decorator configuration}.
     *
     * You can consider it a model with states of manual decorators added to the currently selected link.
     *
     * @readonly
     * @type {module:utils/collection~Collection}
     */
    this.manualDecorators = new Collection()

    /**
     * An instance of the helper that ties together all {@link module:link/link~LinkDecoratorAutomaticDefinition}
     * that are used by the {@glink features/link link} and the {@glink features/images/images-linking linking images} features.
     *
     * @readonly
     * @type {module:link/utils~AutomaticDecorators}
     */
    this.automaticDecorators = new AutomaticDecorators()
  }

  /**
   * Synchronizes the state of {@link #manualDecorators} with the currently present elements in the model.
   */
  restoreManualDecoratorStates() {
    for (const manualDecorator of this.manualDecorators) {
      manualDecorator.value = this._getDecoratorStateFromModel(manualDecorator.id)
    }
  }

  /**
   * @inheritDoc
   */
  refresh() {
    const model = this.editor.model
    const selection = model.document.selection
    const selectedElement = selection.getSelectedElement() || first(selection.getSelectedBlocks())

    // A check for any integration that allows linking elements (e.g. `LinkImage`).
    // Currently the selection reads attributes from text nodes only. See #7429 and #7465.
    if (isTriggerableElement(selectedElement, model.schema)) {
      this.value = selectedElement.getAttribute('behaviorTrigger')
      this.isEnabled = model.schema.checkAttribute(selectedElement, 'behaviorTrigger')
    } else {
      this.value = selection.getAttribute('behaviorTrigger')
      this.isEnabled = model.schema.checkAttributeInSelection(selection, 'behaviorTrigger')
    }

    for (const manualDecorator of this.manualDecorators) {
      manualDecorator.value = this._getDecoratorStateFromModel(manualDecorator.id)
    }
  }

  /**
   * Executes the command.
   *
   * When the selection is non-collapsed, the `behaviorTrigger` attribute will be applied to nodes inside the selection, but only to
   * those nodes where the `behaviorTrigger` attribute is allowed (disallowed nodes will be omitted).
   *
   * When the selection is collapsed and is not inside the text with the `behaviorTrigger` attribute, a
   * new {@link module:engine/model/text~Text text node} with the `behaviorTrigger` attribute will be inserted in place of the caret, but
   * only if such element is allowed in this place. The `_data` of the inserted text will equal the `href` parameter.
   * The selection will be updated to wrap the just inserted text node.
   *
   * When the selection is collapsed and inside the text with the `behaviorTrigger` attribute, the attribute value will be updated.
   *
   * # Decorators and model attribute management
   *
   * There is an optional argument to this command that applies or removes model
   * {@glink framework/guides/architecture/editing-engine#text-attributes text attributes} brought by
   * {@link module:link/utils~ManualDecorator manual link decorators}.
   *
   * Text attribute names in the model correspond to the entries in the {@link module:link/link~LinkConfig#decorators configuration}.
   * For every decorator configured, a model text attribute exists with the "link" prefix. For example, a `'linkMyDecorator'` attribute
   * corresponds to `'myDecorator'` in the configuration.
   *
   * To learn more about link decorators, check out the {@link module:link/link~LinkConfig#decorators `config.link.decorators`}
   * documentation.
   *
   * Here is how to manage decorator attributes with the addBehaviorTrigger command:
   *
   *		const addBehaviorTriggerCommand = editor.commands.get( 'addBehaviorTrigger' );
   *
   *		// Adding a new decorator attribute.
   *		addBehaviorTriggerCommand.execute( 'my-trigger-id');
   *
   * **Note**: If the decorator attribute name is not specified, its state remains untouched.
   *
   * **Note**: {@link module:link/removeBehaviorTriggerCommand~RemoveBehaviorTriggerCommand#execute `RemoveBehaviorTriggerCommand#execute()`} removes all
   * decorator attributes.
   *
   * @fires execute
   * @param {String} id Trigger id.
   * @param {Object} [manualDecoratorIds={}] The information about manual decorator attributes to be applied or removed upon execution.
   */
  execute(id, manualDecoratorIds = {}) {
    const model = this.editor.model
    const selection = model.document.selection
    // Stores information about manual decorators to turn them on/off when command is applied.
    const truthyManualDecorators = []
    const falsyManualDecorators = []

    for (const name in manualDecoratorIds) {
      if (manualDecoratorIds[name]) {
        truthyManualDecorators.push(name)
      } else {
        falsyManualDecorators.push(name)
      }
    }

    model.change((writer) => {
      // If selection is collapsed then update selected link or insert new one at the place of caret.
      if (selection.isCollapsed) {
        const position = selection.getFirstPosition()

        // When selection is inside text with `behaviorTrigger` attribute.
        if (selection.hasAttribute('behaviorTrigger')) {
          // Then update `behaviorTrigger` value.
          const linkRange = findAttributeRange(
            position,
            'behaviorTrigger',
            selection.getAttribute('behaviorTrigger'),
            model,
          )

          writer.setAttribute('behaviorTrigger', id, linkRange)

          truthyManualDecorators.forEach((item) => {
            writer.setAttribute(item, true, linkRange)
          })

          falsyManualDecorators.forEach((item) => {
            writer.removeAttribute(item, linkRange)
          })

          // Put the selection at the end of the updated link.
          writer.setSelection(writer.createPositionAfter(linkRange.end.nodeBefore))
        }
        // If not then insert text node with `behaviorTrigger` attribute in place of caret.
        // However, since selection is collapsed, attribute value will be used as data for text node.
        // So, if `id` is empty, do not create text node.
        else if (id !== '') {
          const attributes = toMap(selection.getAttributes())

          attributes.set('behaviorTrigger', id)

          truthyManualDecorators.forEach((item) => {
            attributes.set(item, true)
          })

          const { end: positionAfter } = model.insertContent(
            writer.createText(id, attributes),
            position,
          )

          // Put the selection at the end of the inserted link.
          // Using end of range returned from insertContent in case nodes with the same attributes got merged.
          writer.setSelection(positionAfter)
        }

        // Remove the `behaviorTrigger` attribute and all link decorators from the selection.
        // It stops adding a new content into the link element.
        ;['behaviorTrigger', ...truthyManualDecorators, ...falsyManualDecorators].forEach(
          (item) => {
            writer.removeSelectionAttribute(item)
          },
        )
      } else {
        // If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
        // omitting nodes where the `behaviorTrigger` attribute is disallowed.
        const ranges = model.schema.getValidRanges(selection.getRanges(), 'behaviorTrigger')

        // But for the first, check whether the `behaviorTrigger` attribute is allowed on selected blocks (e.g. the "image" element).
        const allowedRanges = []

        for (const element of selection.getSelectedBlocks()) {
          if (model.schema.checkAttribute(element, 'behaviorTrigger')) {
            allowedRanges.push(writer.createRangeOn(element))
          }
        }

        // Ranges that accept the `behaviorTrigger` attribute. Since we will iterate over `allowedRanges`, let's clone it.
        const rangesToUpdate = allowedRanges.slice()

        // For all selection ranges we want to check whether given range is inside an element that accepts the `behaviorTrigger` attribute.
        // If so, we don't want to propagate applying the attribute to its children.
        for (const range of ranges) {
          if (this._isRangeToUpdate(range, allowedRanges)) {
            rangesToUpdate.push(range)
          }
        }

        for (const range of rangesToUpdate) {
          writer.setAttribute('behaviorTrigger', id, range)

          truthyManualDecorators.forEach((item) => {
            writer.setAttribute(item, true, range)
          })

          falsyManualDecorators.forEach((item) => {
            writer.removeAttribute(item, range)
          })
        }
      }
    })
  }

  /**
   * Provides information whether a decorator with a given name is present in the currently processed selection.
   *
   * @private
   * @param {String} decoratorName The name of the manual decorator used in the model
   * @returns {Boolean} The information whether a given decorator is currently present in the selection.
   */
  _getDecoratorStateFromModel(decoratorName) {
    const model = this.editor.model
    const selection = model.document.selection
    const selectedElement = selection.getSelectedElement()

    // A check for the `LinkImage` plugin. If the selection contains an element, get values from the element.
    // Currently the selection reads attributes from text nodes only. See #7429 and #7465.
    if (isTriggerableElement(selectedElement, model.schema)) {
      return selectedElement.getAttribute(decoratorName)
    }

    return selection.getAttribute(decoratorName)
  }

  /**
   * Checks whether specified `range` is inside an element that accepts the `behaviorTrigger` attribute.
   *
   * @private
   * @param {module:engine/view/range~Range} range A range to check.
   * @param {Array.<module:engine/view/range~Range>} allowedRanges An array of ranges created on elements where the attribute is accepted.
   * @returns {Boolean}
   */
  _isRangeToUpdate(range, allowedRanges) {
    for (const allowedRange of allowedRanges) {
      // A range is inside an element that will have the `behaviorTrigger` attribute. Do not modify its nodes.
      if (allowedRange.containsRange(range)) {
        return false
      }
    }

    return true
  }
}
