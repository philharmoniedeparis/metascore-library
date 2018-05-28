/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Block = (function () {

    /**
     * A panel for {{#crossLink "player.component.Block"}}{{/crossLink}} components
     * 
     * @class Block
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Block', 'menuItems': {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function BlockPanel(configs) {
        // call parent constructor
        BlockPanel.parent.call(this, configs);

        this.addClass('block');
    }

    BlockPanel.defaults = {
        'toolbarConfigs': {
            'title': metaScore.Locale.t('editor.panel.Block.title', 'Block'),
            'menuItems': {
                'synched': metaScore.Locale.t('editor.panel.Block.menuItems.synched', 'Add a synchronized block'),
                'non-synched': metaScore.Locale.t('editor.panel.Block.menuItems.non-synched', 'Add a non-synchronized block'),
                'block-toggler': metaScore.Locale.t('editor.panel.Block.menuItems.block-toggler', 'Add a block toggler'),
                'delete': metaScore.Locale.t('editor.panel.Block.menuItems.delete', 'Delete the active block')
            }
        }
    };

    metaScore.editor.Panel.extend(BlockPanel);

    /**
     * Get the currently associated component's label
     *
     * @method getSelectorLabel
     * @return {String} The component's label for use in the selector
     */
    BlockPanel.prototype.getSelectorLabel = function(component){
        if(component.instanceOf('Block')){
            if(component.getProperty('synched')){
                return metaScore.Locale.t('editor.panel.Block.selector.labelSynched', '!name (synched)', {'!name': component.getName()});
            }
            else{
                return metaScore.Locale.t('editor.panel.Block.selector.labelNotSynched', '!name (not synched)', {'!name': component.getName()});
            }
        }
        
        return BlockPanel.parent.prototype.getSelectorLabel.call(this, component);
    };

    return BlockPanel;

})();