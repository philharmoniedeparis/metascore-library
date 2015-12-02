/**
* Description
* @class editor.MainMenu
* @extends Dom
*/

metaScore.namespace('editor').MainMenu = (function(){

    /**
     * Description
     * @constructor
     */
    function MainMenu() {
        // call parent constructor
        MainMenu.parent.call(this, '<div/>', {'class': 'main-menu clearfix'});

        this.setupUI();
    }

    metaScore.Dom.extend(MainMenu);

    /**
     * Description
     * @method setupUI
     * @return
     */
    MainMenu.prototype.setupUI = function(){
        var btn_group, sub_menu;

        new metaScore.Dom('<div/>', {'class': 'logo-philharmonie'})
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.new', 'New')
            })
            .data('action', 'new')
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.open', 'Open')
            })
            .data('action', 'open')
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.edit', 'Edit')
            })
            .data('action', 'edit')
            .appendTo(this);

        btn_group = new metaScore.Dom('<div/>', {'class': 'button-group'}).appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.saveDraft', 'Save as draft')
            })
            .data('action', 'save-draft')
            .appendTo(btn_group);

        sub_menu = new metaScore.Dom('<div/>', {'class': 'sub-menu'}).appendTo(btn_group);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.saveCopy', 'Save as copy')
            })
            .data('action', 'save-copy')
            .appendTo(sub_menu);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.Publish', 'Save & Publish')
            })
            .data('action', 'publish')
            .appendTo(sub_menu);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.delete', 'Delete')
            })
            .data('action', 'delete')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.download', 'Download')
            })
            .data('action', 'download')
            .disable()
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this.timefield = new metaScore.editor.field.Time()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.time', 'Time')
            })
            .addClass('time')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this.rindexfield = new metaScore.editor.field.Number({
                min: 0,
                max: 999
            })
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.r-index', 'Reading index')
            })
            .addClass('r-index')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.edit-toggle', 'Toggle edit mode')
            })
            .data('action', 'edit-toggle')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.revert', 'Revert')
            })
            .data('action', 'revert')
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.undo', 'Undo')
            })
            .data('action', 'undo')
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.redo', 'Redo')
            })
            .data('action', 'redo')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .css('flex', '20')
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.settings', 'Settings')
            })
            .data('action', 'settings')
            .disable()
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.help', 'Help')
            })
            .data('action', 'help')
            .disable()
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.logout', 'Logout')
            })
            .data('action', 'logout')
            .appendTo(this);

    };

    /**
     * Description
     * @method toggleButton
     * @param {} action
     * @param {} state
     * @return ThisExpression
     */
    MainMenu.prototype.toggleButton = function(action, state){
        this.find('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

        return this;
    };

    return MainMenu;

})();