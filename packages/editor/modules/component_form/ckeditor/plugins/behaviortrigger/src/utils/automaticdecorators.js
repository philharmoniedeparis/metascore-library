/**
 * Helper class that ties together all {@link module:link/link~LinkDecoratorAutomaticDefinition} and provides
 * the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement downcast dispatchers} for them.
 */
export default class AutomaticDecorators {
  constructor() {
    /**
     * Stores the definition of {@link module:link/link~LinkDecoratorAutomaticDefinition automatic decorators}.
     * This data is used as a source for a downcast dispatcher to create a proper conversion to output data.
     *
     * @private
     * @type {Set}
     */
    this._definitions = new Set();
  }

  /**
   * Gives information about the number of decorators stored in the {@link module:link/utils~AutomaticDecorators} instance.
   *
   * @readonly
   * @protected
   * @type {Number}
   */
  get length() {
    return this._definitions.size;
  }

  /**
   * Adds automatic decorator objects or an array with them to be used during downcasting.
   *
   * @param {module:link/link~LinkDecoratorAutomaticDefinition|Array.<module:link/link~LinkDecoratorAutomaticDefinition>} item
   * A configuration object of automatic rules for decorating links. It might also be an array of such objects.
   */
  add(item) {
    if (Array.isArray(item)) {
      item.forEach((item) => this._definitions.add(item));
    } else {
      this._definitions.add(item);
    }
  }

  /**
   * Provides the conversion helper used in the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add} method.
   *
   * @returns {Function} A dispatcher function used as conversion helper
   * in {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add}.
   */
  getDispatcher() {
    return (dispatcher) => {
      dispatcher.on(
        "attribute:behaviorTrigger",
        (evt, data, conversionApi) => {
          // There is only test as this behavior decorates links and
          // it is run before dispatcher which actually consumes this node.
          // This allows on writing own dispatcher with highest priority,
          // which blocks both native converter and this additional decoration.
          if (
            !conversionApi.consumable.test(
              data.item,
              "attribute:behaviorTrigger"
            )
          ) {
            return;
          }

          // Automatic decorators for block links are handled e.g. in LinkImageEditing.
          if (
            !(
              data.item.is("selection") ||
              conversionApi.schema.isInline(data.item)
            )
          ) {
            return;
          }

          const viewWriter = conversionApi.writer;
          const viewSelection = viewWriter.document.selection;

          for (const item of this._definitions) {
            const viewElement = viewWriter.createAttributeElement(
              "a",
              item.attributes,
              {
                priority: 5,
              }
            );

            if (item.classes) {
              viewWriter.addClass(item.classes, viewElement);
            }

            for (const key in item.styles) {
              viewWriter.setStyle(key, item.styles[key], viewElement);
            }

            viewWriter.setCustomProperty("behaviorTrigger", true, viewElement);
            if (item.callback(data.attributeNewValue)) {
              if (data.item.is("selection")) {
                viewWriter.wrap(viewSelection.getFirstRange(), viewElement);
              } else {
                viewWriter.wrap(
                  conversionApi.mapper.toViewRange(data.range),
                  viewElement
                );
              }
            } else {
              viewWriter.unwrap(
                conversionApi.mapper.toViewRange(data.range),
                viewElement
              );
            }
          }
        },
        { priority: "high" }
      );
    };
  }
}
