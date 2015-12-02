/**
* Description
* @class editor.panel.Element
* @extends editor.Panel
*/

metaScore.namespace('editor.panel').Element = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function ElementPanel(configs) {
        // call parent constructor
        ElementPanel.parent.call(this, configs);
        
        this.addClass('element');
    }

    ElementPanel.defaults = {
        toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
            title: metaScore.Locale.t('editor.panel.Element.title', 'Element'),
            menuItems: {
                'Cursor': metaScore.Locale.t('editor.panel.Element.menuItems.Cursor', 'Add a new cursor'),
                'Image': metaScore.Locale.t('editor.panel.Element.menuItems.Image', 'Add a new image'),
                'Text': metaScore.Locale.t('editor.panel.Element.menuItems.Text', 'Add a new text element'),
                'delete': metaScore.Locale.t('editor.panel.Element.menuItems.delete', 'Delete the active element')
            }
        })
    };

    metaScore.editor.Panel.extend(ElementPanel);

    /**
     * Description
     * @method onFieldValueChange
     * @param {} evt
     * @return 
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
     * Description
     * @method onBeforeImageSet
     * @param {} evt
     * @return 
     */
    ElementPanel.prototype.onBeforeImageSet = function(property, value){
        var panel = this,
            component = panel.getComponent(),
            old_src, new_src;
            
        old_src = component.getProperty(property);
        new_src = value;
        
        if(old_src){
            panel.getImageMetaData(old_src, function(old_metadata){
                var name = component.getProperty('name'),
                    width = component.getProperty('width'),
                    height = component.getProperty('height');
            
                if((old_metadata.name === name) || (old_metadata.width === width && old_metadata.height === height)){
                    panel.getImageMetaData(new_src, function(new_metadata){
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
            panel.getImageMetaData(new_src, function(new_metadata){
                panel.updateFieldValue('name', new_metadata.name);
                panel.updateFieldValue('width', new_metadata.width);
                panel.updateFieldValue('height', new_metadata.height);
            });
        }
    
    };

    /**
     * Description
     * @method getImageMetaData
     * @param {} evt
     * @return 
     */
    ElementPanel.prototype.getImageMetaData = function(src, callback){
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
            .attr('src', src);
    };

    return ElementPanel;

})();