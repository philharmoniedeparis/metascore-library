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
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
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
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    GuideSelector.prototype.setupUI = function(){
        var contents, fieldset;
        
        GuideSelector.parent.prototype.setupUI.call(this);
        
        contents = this.getContents();

        this.filters_form = new metaScore.Dom('<form>', {'class': 'filters', 'method': 'GET'})
            .addListener('submit', metaScore.Function.proxy(this.onFilterFormSubmit, this))
            .appendTo(contents);
            
        fieldset = new metaScore.editor.Fieldset({
                'legend_text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.fieldset.legend', 'Search'),
                'collapsible': true,
                'collapsed': true
            })
            .appendTo(this.filters_form)
            .getContents();
        
        this.filter_fields = {};
        
        this.filter_fields['fulltext'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.fulltext.label', 'Full-text search'),
                'description': metaScore.Locale.t('editor.overlay.GuideSelector.filters.fulltext.description', "Search in the guide's title, credits, description and blocks")
            })
            .data('name', 'filters[fulltext]')
            .appendTo(fieldset);
            
        this.filter_fields['tag'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.tag.label', 'Tag'),
                'value': ''
            })
            .data('name', 'filters[tag]')
            .appendTo(fieldset);
            
        this.filter_fields['author'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.author.label', "Guide's author"),
                'value': ''
            })
            .data('name', 'filters[author]')
            .appendTo(fieldset);
            
        this.filter_fields['group'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.group.label', 'Group'),
                'value': ''
            })
            .data('name', 'filters[group]')
            .appendTo(fieldset);
            
        this.filter_fields['status'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.status.label', 'Status'),
                'options': [
                    {
                        'value': '',
                        'text': ''
                    },
                    {
                        'value': '1',
                        'text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.status.published.lable', 'Published')
                    },
                    {
                        'value': '0',
                        'text': metaScore.Locale.t('editor.overlay.GuideSelector.filters.status.unpublished.lable', 'Unpublished')
                    }
                ],
                'value': ''
            })
            .data('name', 'filters[status]')
            .appendTo(fieldset);
            
        new metaScore.Button({'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.submit.label', 'Submit')})
            .addClass('submit')
            .appendTo(fieldset);

        new metaScore.Button({'label': metaScore.Locale.t('editor.overlay.GuideSelector.filters.reset.label', 'Reset')})
            .addClass('reset')
            .addListener('click', metaScore.Function.proxy(this.onFiltersResetClick, this))
            .appendTo(fieldset);
            
        this.results = new metaScore.Dom('<table/>', {'class': 'results'})
            .appendTo(contents);
    };

    /**
     * Show the overlay
     * 
     * @method show
     * @chainable
     */
    GuideSelector.prototype.show = function(){
        GuideSelector.parent.prototype.show.call(this);
        
        this.load();

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
        var data = JSON.parse(xhr.response);

        if('tags' in data){
            this.filter_fields['tag'].clear().addOption('', '');
            
            metaScore.Object.each(data['tags'], function(key, value){
                this.filter_fields['tag'].addOption(key, value);
            }, this);
        }

        if('authors' in data){
            this.filter_fields['author'].clear().addOption('', '');
            
            metaScore.Object.each(data['authors'], function(key, value){
                this.filter_fields['author'].addOption(key, value);
            }, this);
        }

        if('groups' in data){
            this.filter_fields['group'].clear().addOption('', '');
            
            metaScore.Object.each(data['groups'], function(key, value){
                this.filter_fields['group'].addOption(key, value);
            }, this);
        }
        
        this.setupResults(data['items']);

        this.loadmask.hide();
        delete this.loadmask;
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

    /**
     * The filter form submit event handler
     * 
     * @method onFilterFormSubmit
     * @private
     * @param {Event} evt The event object
     */
    GuideSelector.prototype.onFilterFormSubmit = function(evt){
        var data = {};
        
        metaScore.Object.each(this.filter_fields, function(key, field){
            data[field.data('name')] = field.getValue();
        });
        
        this.load(data);
    
        evt.preventDefault();
        evt.stopPropagation();
    };

    /**
     * The filters reset button click event handler
     * 
     * @method onFiltersResetClick
     * @private
     * @param {Event} evt The event object
     */
    GuideSelector.prototype.onFiltersResetClick = function(evt){
        metaScore.Object.each(this.filter_fields, function(key, field){
            field.reset();
        });
    };

    /**
     * Setup the results
     * 
     * @method setupResults
     * @private
     * @chainable
     */
    GuideSelector.prototype.setupResults = function(guides){
        var row,
            revision_wrapper, revision_field, last_vid,
            groups, button;
            
        this.results.empty();
        
        if(metaScore.Var.isEmpty(guides)){
            this.results.text(this.configs.empty_text);
        }
        else{
            metaScore.Array.each(guides, function(index, guide){
                if(!(guide.permissions.update || guide.permissions.clone)){
                    return;
                }
                
                row = new metaScore.Dom('<tr/>', {'class': 'guide-'+ guide.id})
                    .appendTo(this.results);

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
                    .addClass('submit')
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
            }, this);
        }
            
        return this;
    };

    /**
     * Load guides
     * 
     * @method load
     * @param {FormData} data The data to send with the request
     * @private
     * @chainable
     */
    GuideSelector.prototype.load = function(data){
        this.loadmask = new metaScore.overlay.LoadMask({
            'parent': this.getContents(),
            'autoShow': true
        });

        metaScore.Ajax.get(this.configs.url, {
            'data': data,
            'dataType': 'json',
            'success': metaScore.Function.proxy(this.onLoadSuccess, this),
            'error': metaScore.Function.proxy(this.onLoadError, this)
        });
    };

    return GuideSelector;

})();