/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').GuideSelector = (function () {

    /**
     * Fired when a guide's select button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {Object} guide The guide's data
     * @param {Integer} vid The selected vid of the guide
     */
    var EVT_SUBMIT = 'submit';

    /**
     * A guide selector overlay
     *
     * @class GuideSelector
     * @namespace editor.overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.title='Select a guide'] The overlay's title
     * @param {String} [configs.empty_text='No guides available'] A text to show when no guides are available
     * @param {String} [configs.url=''] The url from which to retreive the list of guides
     */
    function GuideSelector(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        GuideSelector.parent.call(this, this.configs);

        this.addClass('guide-selector');
    }

    GuideSelector.defaults = {
        'parent': '.metaScore-editor',
        'toolbar': true,
        'title': metaScore.Locale.t('editor.overlay.GuideSelector.title', 'Select a guide'),
        'empty_text': metaScore.Locale.t('editor.overlay.GuideSelector.emptyText', 'No guides available'),
        'url': null
    };

    metaScore.Overlay.extend(GuideSelector);

    /**
     * Show the overlay
     * 
     * @method show
     * @chainable
     */
    GuideSelector.prototype.show = function(){
        this.loadmask = new metaScore.overlay.LoadMask({
            'parent': this.configs.parent,
            'autoShow': true
        });

        metaScore.Ajax.get(this.configs.url, {
            'success': metaScore.Function.proxy(this.onLoadSuccess, this),
            'error': metaScore.Function.proxy(this.onLoadError, this)
        });

        return this;
    };

    /**
     * The onload success event handler
     * 
     * @method onLoadSuccess
     * @private
     * @param {XMLHttpRequest} xhr The <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest" target="_blank">XMLHttpRequest</a> object
     */
    GuideSelector.prototype.onLoadSuccess = function(xhr){
        var contents = this.getContents(),
            data = JSON.parse(xhr.response),
            guides = data.items,
            table, row, rowCount = 0,
            revision_wrapper, revision_field, last_vid,
            groups, button;

        table = new metaScore.Dom('<table/>', {'class': 'guides'})
            .appendTo(contents);

        if(metaScore.Var.isEmpty(guides)){
            contents.text(this.configs.empty_text);
        }
        else{
            metaScore.Array.each(guides, function(index, guide){
                if(!(guide.permissions.update || guide.permissions.clone)){
                    return;
                }
                
                row = new metaScore.Dom('<tr/>', {'class': 'guide guide-'+ guide.id +' '+ (rowCount%2 === 0 ? 'even' : 'odd')})
                    .appendTo(table);

                new metaScore.Dom('<td/>', {'class': 'thumbnail'})
                    .append(new metaScore.Dom('<img/>', {'src': guide.thumbnail ? guide.thumbnail.url : null}))
                    .appendTo(row);

                revision_field = new metaScore.editor.field.Select({
                        'label': metaScore.Locale.t('editor.overlay.GuideSelector.revisionLabel', 'Version')
                    })
                    .addClass('revisions');

                if('revisions' in guide){
                    groups = {};

                    metaScore.Object.each(guide.revisions, function(vid, revision){
                        var group_id, group_label, group, text;

                        switch(revision.state){
                            case 0: // archives
                                group_id = 'archives';
                                group_label = metaScore.Locale.t('editor.overlay.GuideSelector.archivesGroup', 'archives');
                                break;

                            case 1: // published
                                group_id = 'published';
                                group_label = metaScore.Locale.t('editor.overlay.GuideSelector.publishedGroup', 'published');
                                break;

                            case 2: // drafts
                                group_id = 'drafts';
                                group_label = metaScore.Locale.t('editor.overlay.GuideSelector.draftsGroup', 'drafts');
                                break;
                        }

                        if(!(group_id in groups)){
                            groups[group_id] = revision_field.addGroup(group_label).addClass(group_id);
                        }

                        group = groups[group_id];

                        text = metaScore.Locale.t('editor.overlay.GuideSelector.revisionText', '!date by !author (!id:!vid)', {'!date': revision.date, '!author': revision.author, '!id': guide.id, '!vid': vid});

                        revision_field.addOption(vid, text, group);
                    });

                    if('latest_revision' in guide){
                        revision_field.setValue(guide.latest_revision);
                    }
                }
                else{
                    revision_field.disable();
                }

                button = new metaScore.Button()
                    .setLabel(metaScore.Locale.t('editor.overlay.GuideSelector.button', 'Select'))
                    .addListener('click', metaScore.Function.proxy(function(guide, revision_field, evt){
                        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'guide': guide, 'vid': revision_field.getValue()}, true, false);

                        this.hide();

                        evt.stopPropagation();
                    }, this, [guide, revision_field]))
                    .data('action', 'select');

                revision_wrapper = new metaScore.Dom('<div/>', {'class': 'revision-wrapper'})
                    .append(revision_field)
                    .append(button);

                new metaScore.Dom('<td/>', {'class': 'details'})
                    .append(new metaScore.Dom('<h1/>', {'class': 'title', 'text': guide.title}))
                    .append(new metaScore.Dom('<p/>', {'class': 'description', 'text': guide.description}))
                    .append(new metaScore.Dom('<p/>', {'class': 'tags', 'text': metaScore.Locale.t('editor.overlay.GuideSelector.tagsText', 'tags: <em>!tags</em>', {'!tags': guide.tags})}))
                    .append(new metaScore.Dom('<p/>', {'class': 'author', 'text': metaScore.Locale.t('editor.overlay.GuideSelector.authorText', 'created by <em>!author</em>', {'!author': guide.author})}))
                    .append(revision_wrapper)
                    .appendTo(row);
                    
                rowCount++;
            }, this);
        }

        this.loadmask.hide();
        delete this.loadmask;

        if(this.configs.modal){
            this.mask.appendTo(this.configs.parent);
        }

        this.appendTo(this.configs.parent);
    };

    /**
     * The load error event handler
     * 
     * @method onLoadError
     * @private
     * @param {XMLHttpRequest} xhr The <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest" target="_blank">XMLHttpRequest</a> object
     */
    GuideSelector.prototype.onLoadError = function(xhr){
    };

    return GuideSelector;

})();