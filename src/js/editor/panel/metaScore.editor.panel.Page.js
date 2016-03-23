/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Page = (function () {

    /**
     * A panel for {{#crossLink "player.component.Page"}}{{/crossLink}} components
     * 
     * @class Page
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Page', 'menuItems': {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function PagePanel(configs) {
        // call parent constructor
        PagePanel.parent.call(this, configs);

        this.addClass('page');
    }

    PagePanel.defaults = {
        'toolbarConfigs': {
            'title': metaScore.Locale.t('editor.panel.Page.title', 'Page'),
            'menuItems': {
                'new': metaScore.Locale.t('editor.panel.Page.menuItems.new', 'Add a new page'),
                'delete': metaScore.Locale.t('editor.panel.Page.menuItems.delete', 'Delete the active page')
            }
        }
    };

    metaScore.editor.Panel.extend(PagePanel);

    return PagePanel;

})();