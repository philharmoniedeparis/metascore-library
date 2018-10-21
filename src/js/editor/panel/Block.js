import Panel from '../Panel';
import Locale from '../../core/Locale';

/**
 * A panel for Block components
 */
export default class Block extends Panel {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [toolbarConfigs={title:'Block', multiSelection: true, menuItems: {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('block');
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'toolbarConfigs': {
                'title': Locale.t('editor.panel.Block.title', 'Block'),
                'menuItems': {
                    'synched': Locale.t('editor.panel.Block.menuItems.synched', 'Add a synchronized block'),
                    'non-synched': Locale.t('editor.panel.Block.menuItems.non-synched', 'Add a non-synchronized block'),
                    'block-toggler': Locale.t('editor.panel.Block.menuItems.block-toggler', 'Add a block toggler'),
                    'delete': Locale.t('editor.panel.Block.menuItems.delete', 'Delete the selected blocks')
                }
            }
        });
    }

    /**
     * Setup the panel's UI
     *
     * @private
     */
    updateUI(){
        super.updateUI();

        if(this.components.length > 0){
            const show_delete = this.components.length > 0 && this.components.every((comp) => {
                return !comp.instanceOf('Controller') && !comp.instanceOf('Media');
            });

            this.getToolbar().toggleMenuItem('delete', show_delete);
        }

        return this;
    }

    /**
     * Get the currently associated component's label
     *
     * @method getSelectorLabel
     * @return {String} The component's label for use in the selector
     */
    getSelectorLabel(component){
        if(component.instanceOf('Block')){
            if(component.getPropertyValue('synched')){
                return Locale.t('editor.panel.Block.selector.labelSynched', '!name (synched)', {'!name': component.getName()});
            }

            return Locale.t('editor.panel.Block.selector.labelNotSynched', '!name (not synched)', {'!name': component.getName()});

        }

        return super.getSelectorLabel(component);
    }

}
