import {Panel} from '../Panel';
import {Locale} from '../../core/Locale';

export default class Block extends Panel {

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
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('block');
    }

    BlockPanel.defaults = {
        'toolbarConfigs': {
            'title': Locale.t('editor.panel.Block.title', 'Block'),
            'menuItems': {
                'synched': Locale.t('editor.panel.Block.menuItems.synched', 'Add a synchronized block'),
                'non-synched': Locale.t('editor.panel.Block.menuItems.non-synched', 'Add a non-synchronized block'),
                'block-toggler': Locale.t('editor.panel.Block.menuItems.block-toggler', 'Add a block toggler'),
                'delete': Locale.t('editor.panel.Block.menuItems.delete', 'Delete the active block')
            }
        }
    };

    /**
     * Get the currently associated component's label
     *
     * @method getSelectorLabel
     * @return {String} The component's label for use in the selector
     */
    getSelectorLabel(component){
        if(component.instanceOf('Block')){
            if(component.getProperty('synched')){
                return Locale.t('editor.panel.Block.selector.labelSynched', '!name (synched)', {'!name': component.getName()});
            }
            else{
                return Locale.t('editor.panel.Block.selector.labelNotSynched', '!name (not synched)', {'!name': component.getName()});
            }
        }
        
        return BlockPanel.parent.prototype.getSelectorLabel.call(this, component);
    };

}