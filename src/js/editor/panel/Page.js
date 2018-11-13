import Panel from '../Panel';
import Locale from '../../core/Locale';

/**
 * A panel for Page components
 */
export default class Page extends Panel {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [toolbarConfigs={title:'Page', menuItems: {...}}] Configs to pass to the toolbar (see {@link Toolbar})
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('page');
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'toolbarConfigs': {
                'title': Locale.t('editor.panel.Page.title', 'Page'),
                'menuItems': {
                    'new': Locale.t('editor.panel.Page.menuItems.new', 'Add a new page'),
                    'delete': Locale.t('editor.panel.Page.menuItems.delete', 'Delete the selected pages')
                }
            }
        });
    }
}
