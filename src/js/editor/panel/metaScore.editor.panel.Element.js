/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Element = (function () {

    /**
     * A panel for {{#crossLink "player.component.Element"}}{{/crossLink}} components
     * 
     * @class Element
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Element', 'menuItems': {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function ElementPanel(configs) {
        // call parent constructor
        ElementPanel.parent.call(this, configs);

        this.addClass('element');
    }

    ElementPanel.defaults = {
        toolbarConfigs: {
            'title': metaScore.Locale.t('editor.panel.Element.title', 'Element'),
            'menuItems': {
                'Cursor': metaScore.Locale.t('editor.panel.Element.menuItems.Cursor', 'Add a new cursor'),
                'Image': metaScore.Locale.t('editor.panel.Element.menuItems.Image', 'Add a new image'),
                'Text': metaScore.Locale.t('editor.panel.Element.menuItems.Text', 'Add a new text element'),
                'delete': metaScore.Locale.t('editor.panel.Element.menuItems.delete', 'Delete the active element')
            }
        }
    };

    metaScore.editor.Panel.extend(ElementPanel);

    /**
     * The fields' valuechange event handler
     *
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    ElementPanel.prototype.onFieldValueChange = function(evt){
        var component = this.getComponent(),
            name = evt.detail.field.data('name');

        if(component && component.getProperty('type') === 'Image' && evt.detail.field.data('name') === 'background-image'){
            this.onBeforeImageSet(name, evt.detail.value);
        }

        ElementPanel.parent.prototype.onFieldValueChange.call(this, evt);
    };

    /**
     * The beforeimageset event handler
     * 
     * @method onBeforeImageSet
     * @private
     * @param {String} property The updated component property's name
     * @param {String} url The new image url
     */
    ElementPanel.prototype.onBeforeImageSet = function(property, url){
        var panel = this,
            component = panel.getComponent(),
            old_src, new_src;

        old_src = component.getProperty(property);
        new_src = url;

        if(old_src){
            panel.getImageMetadata(old_src, function(old_metadata){
                var name = component.getProperty('name'),
                    width = component.getProperty('width'),
                    height = component.getProperty('height');

                if((old_metadata.name === name) || (old_metadata.width === width && old_metadata.height === height)){
                    panel.getImageMetadata(new_src, function(new_metadata){
                        if(old_metadata.name === name){
                            panel.updateFieldValue('name', new_metadata.name);
                        }

                        if(old_metadata.width === width && old_metadata.height === height){
                            panel.updateFieldValue('width', new_metadata.width);
                            panel.updateFieldValue('height', new_metadata.height);
                        }
                    });
                }
            });
        }
        else{
            panel.getImageMetadata(new_src, function(new_metadata){
                panel.updateFieldValue('name', new_metadata.name);
                panel.updateFieldValue('width', new_metadata.width);
                panel.updateFieldValue('height', new_metadata.height);
            });
        }

    };

    /**
     * Get an image's metadata (name, width, and height)
     * 
     * @method getImageMetadata
     * @private
     * @param {String} url The image's url
     * @param {Function} callback The callback to call with the retreived metadata
     */
    ElementPanel.prototype.getImageMetadata = function(url, callback){
        var img = new metaScore.Dom('<img/>')
            .addListener('load', function(evt){
                var el = img.get(0),
                    matches, name;

                if(matches = el.src.match(/([^/]*)\.[^.]*$/)){
                    name = matches[1];
                }

                callback({
                    'name': name,
                    'width': el.naturalWidth,
                    'height': el.naturalHeight
                });
            })
            .attr('src', url);
    };

    return ElementPanel;

})();