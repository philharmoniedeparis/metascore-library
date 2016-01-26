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
                'delete': metaScore.Locale.t('editor.panel.Block.menuItems.delete', 'Delete the active block')
            }
        }
    };

    metaScore.editor.Panel.extend(BlockPanel);

    return BlockPanel;

})();