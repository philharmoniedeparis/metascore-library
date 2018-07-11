import Panel from '../Panel';
import Locale from '../../core/Locale';

export default class Page extends Panel {

    /**
     * A panel for {{#crossLink "player.component.Page"}}{{/crossLink}} components
     *
     * @class Page
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={title:'Page', menuItems: {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('page');
    }

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
