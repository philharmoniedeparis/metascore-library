import Overlay from '../../core/ui/Overlay';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Alert from '../../core/ui/overlay/Alert';
import Dom from '../../core/Dom';
import Ajax from '../../core/Ajax';
import Locale from '../../core/Locale';
import Button from '../../core/ui/Button';
import {isEmpty} from '../../core/utils/Var';
import Fieldset from '../Fieldset';
import SelectField from '../field/Select';
import TextField from '../field/Text';

import '../../../css/editor/overlay/GuideSelector.less';

/**
 * Fired when a guide's select button is clicked
 *
 * @event submit
 * @param {Object} overlay The overlay instance
 * @param {Object} guide The guide's data
 * @param {Integer} vid The selected vid of the guide
 */
const EVT_SUBMIT = 'submit';

export default class GuideSelector extends Overlay {

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
     * @param {Object} [configs.xhr={}] Custom options to send with each XHR request. See {{#crossLink "Ajax/send:method"}}Ajax.send{{/crossLink}} for available options
     * @param {Integer} [configs.loadMoreDistance=40] The distance at which more guides are loaded
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.onScroll = this.onScroll.bind(this);

        this.addClass('guide-selector');
    }

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
     * @method setupUI
     * @private
     */
    setupUI() {
        super.setupUI();

        const contents = this.getContents();

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

        this.filter_fields = {};

        this.filter_fields.fulltext = new TextField({
                'label': Locale.t('editor.overlay.GuideSelector.filters.fulltext.label', 'Full-text search'),
                'description': Locale.t('editor.overlay.GuideSelector.filters.fulltext.description', "Search in the guide's title, credits, description and blocks")
            })
            .data('name', 'filters[fulltext]')
            .appendTo(fieldset);

        this.filter_fields.tag = new SelectField({
                'label': Locale.t('editor.overlay.GuideSelector.filters.tag.label', 'Tag'),
                'value': ''
            })
            .data('name', 'filters[tag]')
            .appendTo(fieldset);

        this.filter_fields.author = new SelectField({
                'label': Locale.t('editor.overlay.GuideSelector.filters.author.label', "Guide's author"),
                'value': ''
            })
            .data('name', 'filters[author]')
            .appendTo(fieldset);

        this.filter_fields.group = new SelectField({
                'label': Locale.t('editor.overlay.GuideSelector.filters.group.label', 'Group'),
                'value': ''
            })
            .data('name', 'filters[group]')
            .appendTo(fieldset);

        this.filter_fields.status = new SelectField({
                'label': Locale.t('editor.overlay.GuideSelector.filters.status.label', 'Status'),
                'options': [
                    {
                        'value': '',
                        'text': ''
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
            })
            .data('name', 'filters[status]')
            .appendTo(fieldset);

        this.filter_fields.sort_by = new SelectField({
                'label': Locale.t('editor.overlay.GuideSelector.filters.sort_by.label', 'Sort by'),
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
            })
            .data('name', 'sort_by')
            .appendTo(fieldset);

        this.filter_fields.sort_order = new SelectField({
                'label': Locale.t('editor.overlay.GuideSelector.filters.sort_order.label', 'Order'),
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

        this.results = new Dom('<table/>', {'class': 'results'})
            .appendTo(contents);
    }

    onScroll(evt) {
        const el = evt.target;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - this.configs.loadMoreDistance) {
            this.loadMore();
        }
    }

    /**
     * The onload success event handler
     *
     * @method onLoadSuccess
     * @private
     * @param {Event} evt The event object
     */
    onLoadSuccess(evt){
        const data = JSON.parse(evt.target.getResponse());

        if('filters' in data){
			Object.entries(data.filters).forEach(([field, values]) => {
                if(field in this.filter_fields){
                    this.filter_fields[field].clear().addOption('', '');

					Object.entries(values).forEach(([key, value]) => {
                        this.filter_fields[field].addOption(key, value);
                    });
                }
            });
        }

        let appended = 0;

        if(!data.page){
            this.results.empty();

            if(isEmpty(data.items)){
                this.results.text(this.configs.empty_text);
            }
            else{
                appended = this.appendResults(data.items);
            }
        }
        else{
            appended = this.appendResults(data.items);
        }

        delete this.load_request;

        if(data.count > (data.page + 1) * data.page_size){
            this.load_more_params.page = data.page + 1;

            if(data.page === 0){
                this.getContents()
                    .addClass('has-more')
                    .addListener('scroll', this.onScroll);
            }

            const el = this.getContents().get(0);
            if(appended === 0 || el.clientHeight === el.scrollHeight){
                this.loadMore();
            }
        }
        else{
            delete this.load_more_params;

            this.getContents()
                .removeClass('has-more')
                .removeListener('scroll', this.onScroll);
        }
    }

    /**
     * The load error event handler
     *
     * @method onLoadError
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
     * @method onLoadAbort
     * @private
     * @param {Event} evt The event object
     */
    onLoadAbort(){
        delete this.load_request;
    }

    /**
     * The filter form submit event handler
     *
     * @method onFilterFormSubmit
     * @private
     * @param {Event} evt The event object
     */
    onFilterFormSubmit(evt){
        this.load_more_params = this.getFilters();
        this.load(Object.assign({}, this.load_more_params));

        evt.preventDefault();
        evt.stopPropagation();
    }

    /**
     * The filters reset button click event handler
     *
     * @method onFiltersResetClick
     * @private
     */
    onFiltersResetClick(){
		Object.entries(this.filter_fields).forEach(([, field]) => {
            field.reset();
        });
    }

    /**
     * The submit event handler
     *
     * @method onGuideSelect
     * @private
     * @param {Object} guide The selected guide
     * @param {SelectField} revision_field The revision selection field
     * @param {Event} evt The event object
     */
    onGuideSelect(guide, revision_field, evt){
        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'guide': guide, 'vid': revision_field.getValue()}, true, false);

        this.hide();

        evt.stopPropagation();
    }

    /**
     * Setup the results
     *
     * @method setupResults
     * @private
     */
    appendResults(guides){
        let count = 0;

        guides.forEach((guide) => {
            if(!(guide.permissions.update || guide.permissions.clone)){
                return;
            }

            const row = new Dom('<tr/>', {'class': `guide-${guide.id}`})
                .appendTo(this.results);

            new Dom('<td/>', {'class': 'thumbnail'})
                .append(new Dom('<img/>', {'src': guide.thumbnail ? guide.thumbnail.url : null}))
                .appendTo(row);

            const revision_field = new SelectField({
                    'label': Locale.t('editor.overlay.GuideSelector.revisionLabel', 'Version')
                })
                .addClass('revisions');

            if('revisions' in guide){
                const groups = {};

                Object.entries(guide.revisions).forEach(([vid, revision]) => {
                    let group_id = null;
                    let group_label = null;

                    switch(revision.state){
                        case 0: // archives
                            group_id = 'archives';
                            group_label = Locale.t('editor.overlay.GuideSelector.archivesGroup', 'archives');
                            break;

                        case 1: // published
                            group_id = 'published';
                            group_label = Locale.t('editor.overlay.GuideSelector.publishedGroup', 'published');
                            break;

                        case 2: // drafts
                            group_id = 'drafts';
                            group_label = Locale.t('editor.overlay.GuideSelector.draftsGroup', 'drafts');
                            break;
                    }

                    if(!(group_id in groups)){
                        groups[group_id] = revision_field.addGroup(group_label).addClass(group_id);
                    }

                    const group = groups[group_id];
                    const text = Locale.t('editor.overlay.GuideSelector.revisionText', '!date by !author (!id:!vid)', {'!date': revision.date, '!author': revision.author, '!id': guide.id, '!vid': vid});

                    revision_field.addOption(vid, text, group);
                });

                if('latest_revision' in guide){
                    revision_field.setValue(guide.latest_revision);
                }
            }
            else{
                revision_field.disable();
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

            count++;
        });

        return count;
    }

    /**
     * Load guides
     *
     * @method load
     * @private
     * @chainable
     */
    load(params){
        const loadmask = new LoadMask({
            'parent': this.getContents(),
            'autoShow': true
        });

        const options = Object.assign({}, {
            'data': params,
            'dataType': 'json',
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

        this.load_request = Ajax.GET(this.configs.url, options);
    }

    loadMore(){
        if(!this.load_request){
            const options = Object.assign({}, {
                'data': this.load_more_params,
                'dataType': 'json',
                'onSuccess': this.onLoadSuccess.bind(this),
                'onError': this.onLoadError.bind(this),
                'onAbort': this.onLoadAbort.bind(this)
            }, this.configs.xhr);

            this.load_request = Ajax.GET(this.configs.url, options);
        }
    }

    getFilters(){
        const data = {};

		Object.entries(this.filter_fields).forEach(([, field]) => {
            data[field.data('name')] = field.getValue();
        });

        return data;
    }

    /**
     * Show the overlay
     *
     * @method show
     * @chainable
     */
    show() {
        super.show();

        this.load_more_params = this.getFilters();

        const params = Object.assign({}, this.load_more_params, {with_filter_options: true});
        this.load(params);

        return this;
    }

    hide(){
        if(this.load_request){
            this.load_request.abort();
        }

        super.hide();
    }

}
