import Overlay from '../../core/ui/Overlay';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Alert from '../../core/ui/overlay/Alert';
import Dom from '../../core/Dom';
import Ajax from '../../core/Ajax';
import Locale from '../../core/Locale';
import Button from '../../core/ui/Button';
import {isEmpty} from '../../core/utils/Var';
import Fieldset from '../Fieldset';
import Field from '../Field';

import {className} from '../../../css/editor/overlay/GuideSelector.scss';

/**
 * A guide selector overlay
 *
 * @emits {submit} Fired when a guide's select button is clicked
 * @param {Object} overlay The overlay instance
 * @param {Object} guide The guide's data
 * @param {Integer} vid The selected vid of the guide
 */
export default class GuideSelector extends Overlay {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @property {Boolean} [toolbar=true] Whether to show a toolbar with a title and close button
     * @property {String} [title='Select a guide'] The overlay's title
     * @property {String} [empty_text='No guides available'] A text to show when no guides are available
     * @property {String} [url=''] The url from which to retreive the list of guides
     * @property {Object} [xhr={}] Custom options to send with each XHR request. See {@link Ajax.send} for available options
     * @property {Integer} [loadMoreDistance=40] The distance at which more guides are loaded
     * @property {Object} [groups={}] The groups the user belongs to
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.next_url = null;

        this.addClass(`guide-selector ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'parent': '.metaScore-editor',
            'toolbar': true,
            'title': Locale.t('editor.overlay.GuideSelector.title', 'Select a guide'),
            'empty_text': Locale.t('editor.overlay.GuideSelector.emptyText', 'No guides available'),
            'url': null,
            'xhr': {},
            'loadMoreDistance': 40
        });
    }

    /**
     * Setup the overlay's UI
     *
     * @private
     */
    setupUI() {
        // fix event handlers scope
        this.onScroll = this.onScroll.bind(this);

        super.setupUI();

        const contents = this.getContents();

        /**
         * The filters <form> element
         * @type {Dom}
         */
        this.filters_form = new Dom('<form/>', {'class': 'filters', 'method': 'GET'})
            .addListener('submit', this.onFilterFormSubmit.bind(this))
            .appendTo(contents);

        const fieldset = new Fieldset({
                'legend_text': Locale.t('editor.overlay.GuideSelector.filters.fieldset.legend', 'Search'),
                'collapsible': true,
                'collapsed': true
            })
            .appendTo(this.filters_form)
            .getContents();

        /**
         * The list of filter fields
         * @type {Object}
         */
        this.filter_fields = {};

        this.filter_fields.fulltext = new Field({
                'type': 'text',
                'label': Locale.t('editor.overlay.GuideSelector.filters.fulltext.label', 'Full-text search'),
                'description': Locale.t('editor.overlay.GuideSelector.filters.fulltext.description', "Search in the guide's title, credits, description and blocks")
            })
            .data('name', 'filters[fulltext]')
            .appendTo(fieldset);

        this.filter_fields.tag = new Field({
                'type': 'text',
                'label': Locale.t('editor.overlay.GuideSelector.filters.tag.label', 'Tag')
            })
            .data('name', 'filters[tag]')
            .appendTo(fieldset);

        this.filter_fields.author = new Field({
                'type': 'text',
                'label': Locale.t('editor.overlay.GuideSelector.filters.author.label', "Author")
            })
            .data('name', 'filters[author]')
            .appendTo(fieldset);

        this.filter_fields.group = new Field({
                'type': 'select',
                'input': {
                    'options': [
                        {
                            'value': '',
                            'text': Locale.t('editor.overlay.GuideSelector.filters.group.all.label', '- Any -')
                        }
                    ],
                    'value': ''
                },
                'label': Locale.t('editor.overlay.GuideSelector.filters.group.label', 'Group')
            })
            .data('name', 'filters[group]')
            .appendTo(fieldset);

        if(!isEmpty(this.configs.groups)){
            this.configs.groups.forEach((group) => {
                this.filter_fields.group.addOption(group.id, group.title);
            });
        }
        else{
            this.filter_fields.group.disable();
        }

        this.filter_fields.status = new Field({
                'type': 'select',
                'input': {
                    'options': [
                        {
                            'value': '',
                            'text': Locale.t('editor.overlay.GuideSelector.filters.status.all.label', '- Any -')
                        },
                        {
                            'value': '1',
                            'text': Locale.t('editor.overlay.GuideSelector.filters.status.published.lable', 'Published')
                        },
                        {
                            'value': '0',
                            'text': Locale.t('editor.overlay.GuideSelector.filters.status.unpublished.lable', 'Unpublished')
                        }
                    ],
                    'value': ''
                },
                'label': Locale.t('editor.overlay.GuideSelector.filters.status.label', 'Status')
            })
            .data('name', 'filters[status]')
            .appendTo(fieldset);

        this.filter_fields.sort_by = new Field({
                'type': 'select',
                'input': {
                    'options': [
                        {
                            'value': 'title',
                            'text': Locale.t('editor.overlay.GuideSelector.filters.sort_by.title.lable', 'Title')
                        },
                        {
                            'value': 'created',
                            'text': Locale.t('editor.overlay.GuideSelector.filters.sort_by.created.lable', 'Creation date')
                        },
                        {
                            'value': 'changed',
                            'text': Locale.t('editor.overlay.GuideSelector.filters.sort_by.changed.lable', 'Last update date')
                        }
                    ],
                    'value': 'changed'
                },
                'label': Locale.t('editor.overlay.GuideSelector.filters.sort_by.label', 'Sort by')
            })
            .data('name', 'sort_by')
            .appendTo(fieldset);

        this.filter_fields.sort_order = new Field({
                'type': 'select',
                'input': {
                    'options': [
                        {
                            'value': 'ASC',
                            'text': Locale.t('editor.overlay.GuideSelector.filters.sort_order.asc.lable', 'Asc')
                        },
                        {
                            'value': 'DESC',
                            'text': Locale.t('editor.overlay.GuideSelector.filters.sort_order.desc.lable', 'Desc')
                        }
                    ],
                    'value': 'DESC'
                },
                'label': Locale.t('editor.overlay.GuideSelector.filters.sort_order.label', 'Order')
            })
            .data('name', 'sort_order')
            .appendTo(fieldset);

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(fieldset);

        new Button({'label': Locale.t('editor.overlay.GuideSelector.filters.submit.label', 'Submit')})
            .addClass('submit')
            .appendTo(buttons);

        new Button({'label': Locale.t('editor.overlay.GuideSelector.filters.reset.label', 'Reset')})
            .addClass('reset')
            .addListener('click', this.onFiltersResetClick.bind(this))
            .appendTo(buttons);

        /**
         * The results <table> element
         * @type {Dom}
         */
        this.results = new Dom('<table/>', {'class': 'results'})
            .appendTo(contents);
    }

    /**
     * The scroll event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onScroll(evt) {
        const el = evt.target;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - this.configs.loadMoreDistance) {
            this.loadMore();
        }
    }

    /**
     * The onload success event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onLoadSuccess(evt, append){
        const response = evt.target.getResponse();

        if(isEmpty(response.data)){
            this.results.text(this.configs.empty_text);
        }
        else{
            this.renderGuides(response.data, append);
        }

        this.next_url = 'next' in response.links ? response.links.next : null;

        if(this.next_url){
            this.getContents()
                .addClass('has-more')
                .addListener('scroll', this.onScroll);
        }
        else{
            this.getContents()
                .removeClass('has-more')
                .removeListener('scroll', this.onScroll);
        }

        delete this.load_request;
    }

    /**
     * The load error event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onLoadError(evt){
        delete this.load_request;

        new Alert({
            'parent': this,
            'text': Locale.t('editor.overlay.GuideSelector.onLoadError.msg', 'The following error occured:<br/><strong><em>@code @error</em></strong><br/>Please try again.', {'@error': evt.target.getStatusText(), '@code': evt.target.getStatus()}),
            'buttons': {
                'ok': Locale.t('editor.overlay.GuideSelector.onLoadError.ok', 'OK'),
            },
            'autoShow': true
        });
    }

    /**
     * The load abort event handler
     *
     * @private
     */
    onLoadAbort(){
        delete this.load_request;
    }

    /**
     * The filter form submit event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onFilterFormSubmit(evt){
        this.load(Object.assign({}, this.getFilters()));

        evt.preventDefault();
        evt.stopPropagation();
    }

    /**
     * The filters reset button click event handler
     *
     * @private
     */
    onFiltersResetClick(){
		Object.entries(this.filter_fields).forEach(([, field]) => {
            field.getInput().reset();
        });
    }

    /**
     * The submit event handler
     *
     * @private
     * @param {Object} guide The selected guide
     * @param {Field} revision_field The revision selection field
     * @param {Event} evt The event object
     */
    onGuideSelect(guide, revision_field, evt){
        this.triggerEvent('submit', {'overlay': this, 'guide': guide, 'vid': revision_field.getInput().getValue()}, true, false);

        this.hide();

        evt.stopPropagation();
    }

    /**
     * Render guides from a results array
     *
     * @param {Array} guides The guides to render
     * @param {Boolean} append Whether to append the guides to the existing ones
     *
     * @private
     */
    renderGuides(guides, append){
        if(append !== true){
            this.results.empty();
        }

        guides.forEach((guide) => {
            const row = new Dom('<tr/>', {'class': `guide-${guide.id}`})
                .appendTo(this.results);

            new Dom('<td/>', {'class': 'thumbnail'})
                .append(new Dom('<img/>', {'src': guide.thumbnail ? guide.thumbnail.url : null}))
                .appendTo(row);

            const revision_field = new Field({
                    'type': 'select',
                    'label': Locale.t('editor.overlay.GuideSelector.revisionLabel', 'Version')
                })
                .addClass('revisions');

            if('revisions' in guide){
                const groups = {};

                guide.revisions.forEach((revision) => {
                    let group_id = null;
                    let group_label = null;

                    switch(revision.state){
                        case 'archive':
                            group_id = 'archives';
                            group_label = Locale.t('editor.overlay.GuideSelector.archivesGroup', 'archives');
                            break;

                        case 'default':
                            group_id = 'default';
                            group_label = Locale.t('editor.overlay.GuideSelector.defaultGroup', 'current');
                            break;

                        case 'draft':
                            group_id = 'drafts';
                            group_label = Locale.t('editor.overlay.GuideSelector.draftsGroup', 'drafts');
                            break;
                    }

                    if(!(group_id in groups)){
                        groups[group_id] = revision_field.getInput().addGroup(group_label).addClass(group_id);
                    }

                    const group = groups[group_id];
                    const text = Locale.t('editor.overlay.GuideSelector.revisionText', '!date by !author (!id:!vid)', {'!date': revision.date, '!author': revision.author, '!id': guide.id, '!vid': revision.vid});

                    revision_field.getInput().addOption(revision.vid, text, group);
                });

                if('latest_revision' in guide){
                    revision_field.getInput().setValue(guide.latest_revision);
                }
            }
            else{
                revision_field.getInput().disable();
            }

            const button = new Button()
                .addClass('submit')
                .setLabel(Locale.t('editor.overlay.GuideSelector.button', 'Select'))
                .addListener('click', this.onGuideSelect.bind(this, guide, revision_field))
                .data('action', 'select');

            const revision_wrapper = new Dom('<div/>', {'class': 'revision-wrapper'})
                .append(revision_field)
                .append(button);

            new Dom('<td/>', {'class': 'details'})
                .append(new Dom('<h1/>', {'class': 'title', 'text': guide.title}))
                .append(new Dom('<p/>', {'class': 'description', 'text': guide.description}))
                .append(new Dom('<p/>', {'class': 'tags', 'text': Locale.t('editor.overlay.GuideSelector.tagsText', 'tags: <em>!tags</em>', {'!tags': guide.tags})}))
                .append(new Dom('<p/>', {'class': 'author', 'text': Locale.t('editor.overlay.GuideSelector.authorText', 'created by <em>!author</em>', {'!author': guide.author})}))
                .append(revision_wrapper)
                .appendTo(row);
        });
    }

    /**
     * Load guides
     *
     * @private
     * @return {this}
     */
    load(params){
        const loadmask = new LoadMask({
            'parent': this.getContents(),
            'autoShow': true
        });

        const options = Object.assign({}, {
            'data': params,
            'responseType': 'json',
            'onSuccess': (evt) => {
                this.onLoadSuccess(evt);
                loadmask.hide();
            },
            'onError': (evt) => {
                this.onLoadError(evt);
                loadmask.hide();
            },
            'onAbort': (evt) => {
                this.onLoadAbort(evt);
                loadmask.hide();
            }
        }, this.configs.xhr);

        /**
         * The load request
         * @type {Ajax}
         */
        this.load_request = Ajax.GET(this.configs.url, options);
    }

    /**
     * Load more guides
     *
     * @return {this}
     */
    loadMore(){
        if(!this.load_request && this.next_url){
            const options = Object.assign({}, {
                'responseType': 'json',
                'onSuccess': (evt) => {
                    this.onLoadSuccess(evt, true);
                },
                'onError': (evt) => {
                    this.onLoadError(evt);
                },
                'onAbort': (evt) => {
                    this.onLoadAbort(evt);
                }
            }, this.configs.xhr);

            this.load_request = Ajax.GET(this.next_url, options);
        }

        return this;
    }

    /**
     * Get the values of the filter fields
     *
     * @return {Object} The values
     */
    getFilters(){
        const data = {};

		Object.entries(this.filter_fields).forEach(([, field]) => {
            const input =  field.getInput();
            data[input.getName()] = input.getValue();
        });

        return data;
    }

    /**
     * Show the overlay
     *
     * @return {this}
     */
    show() {
        super.show();

        this.load(this.getFilters());

        return this;
    }

    /**
     * Hide the overlay
     *
     * @return {this}
     */
    hide(){
        if(this.load_request){
            this.load_request.abort();
        }

        super.hide();

        return this;
    }

}
