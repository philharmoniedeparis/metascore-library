/**
* Description
* @class editor.panel.Block
* @extends editor.Panel
*/

metaScore.namespace('editor.panel').Block = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function BlockPanel(configs) {
        // call parent constructor
        BlockPanel.parent.call(this, configs);
        
        this.addClass('block');
    }

    BlockPanel.defaults = {
        toolbarConfigs: metaScore.Object.extend({}, metaScore.editor.Panel.defaults.toolbarConfigs, {
            title: metaScore.Locale.t('editor.panel.Block.title', 'Block'),
            menuItems: {
                'synched': metaScore.Locale.t('editor.panel.Block.menuItems.synched', 'Add a synchronized block'),
                'non-synched': metaScore.Locale.t('editor.panel.Block.menuItems.non-synched', 'Add a non-synchronized block'),
                'delete': metaScore.Locale.t('editor.panel.Block.menuItems.delete', 'Delete the active block')
            }
        })
    };

    metaScore.editor.Panel.extend(BlockPanel);

    return BlockPanel;

})();