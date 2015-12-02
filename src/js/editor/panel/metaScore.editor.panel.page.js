/**
* Description
* @class editor.panel.Page
* @extends editor.Panel
*/

metaScore.namespace('editor.panel').Page = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function PagePanel(configs) {
        // call parent constructor
        PagePanel.parent.call(this, configs);

        this.addClass('page');
    }

    PagePanel.defaults = {
        toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
            title: metaScore.Locale.t('editor.panel.Page.title', 'Page'),
            menuItems: {
                'new': metaScore.Locale.t('editor.panel.Page.menuItems.new', 'Add a new page'),
                'delete': metaScore.Locale.t('editor.panel.Page.menuItems.delete', 'Delete the active page')
            }
        })
    };

    metaScore.editor.Panel.extend(PagePanel);

    return PagePanel;

})();