import Overlay from '../../core/ui/Overlay';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Dom from '../../core/Dom';
import Ajax from '../../core/Ajax';
import {t} from '../../core/utils/Locale';
import Button from '../../core/ui/Button';
import {isEmpty} from '../../core/utils/Var';
import Fieldset from '../Fieldset';
import SelectField from '../field/Select';
import TextField from '../field/Text';

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
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('guide-selector');
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'parent': '.metaScore-editor',
            'toolbar': true,
            'title': t('editor.overlay.GuideSelector.title', 'Select a guide'),
            'empty_text': t('editor.overlay.GuideSelector.emptyText', 'No guides available'),
            'url': null
        });
    }

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        let contents, fieldset, buttons;

        super.setupUI();

        contents = this.getContents();

        this.filters_form = new Dom('<form/>', {'class': 'filters', 'method': 'GET'})
            .addListener('submit', this.onFilterFormSubmit.bind(this))
            .appendTo(contents);

        fieldset = new Fieldset({
                'legend_text': t('editor.overlay.GuideSelector.filters.fieldset.legend', 'Search'),
                'collapsible': true,
                'collapsed': true
            })
            .appendTo(this.filters_form)
            .getContents();

        this.filter_fields = {};

        this.filter_fields.fulltext = new TextField({
                'label': t('editor.overlay.GuideSelector.filters.fulltext.label', 'Full-text search'),
                'description': t('editor.overlay.GuideSelector.filters.fulltext.description', "Search in the guide's title, credits, description and blocks")
            })
            .data('name', 'filters[fulltext]')
            .appendTo(fieldset);

        this.filter_fields.tag = new SelectField({
                'label': t('editor.overlay.GuideSelector.filters.tag.label', 'Tag'),
                'value': ''
            })
            .data('name', 'filters[tag]')
            .appendTo(fieldset);

        this.filter_fields.author = new SelectField({
                'label': t('editor.overlay.GuideSelector.filters.author.label', "Guide's author"),
                'value': ''
            })
            .data('name', 'filters[author]')
            .appendTo(fieldset);

        this.filter_fields.group = new SelectField({
                'label': t('editor.overlay.GuideSelector.filters.group.label', 'Group'),
                'value': ''
            })
            .data('name', 'filters[group]')
            .appendTo(fieldset);

        this.filter_fields.status = new SelectField({
                'label': t('editor.overlay.GuideSelector.filters.status.label', 'Status'),
                'options': [
                    {
                        'value': '',
                        'text': ''
                    },
                    {
                        'value': '1',
                        'text': t('editor.overlay.GuideSelector.filters.status.published.lable', 'Published')
                    },
                    {
                        'value': '0',
                        'text': t('editor.overlay.GuideSelector.filters.status.unpublished.lable', 'Unpublished')
                    }
                ],
                'value': ''
            })
            .data('name', 'filters[status]')
            .appendTo(fieldset);

        this.filter_fields.sort_by = new SelectField({
                'label': t('editor.overlay.GuideSelector.filters.sort_by.label', 'Sort by'),
                'options': [
                    {
                        'value': 'title',
                        'text': t('editor.overlay.GuideSelector.filters.sort_by.title.lable', 'Title')
                    },
                    {
                        'value': 'created',
                        'text': t('editor.overlay.GuideSelector.filters.sort_by.created.lable', 'Creation date')
                    },
                    {
                        'value': 'changed',
                        'text': t('editor.overlay.GuideSelector.filters.sort_by.changed.lable', 'Last update date')
                    }
                ],
                'value': 'changed'
            })
            .data('name', 'sort_by')
            .appendTo(fieldset);

        this.filter_fields.sort_order = new SelectField({
                'label': t('editor.overlay.GuideSelector.filters.sort_order.label', 'Order'),
                'options': [
                    {
                        'value': 'ASC',
                        'text': t('editor.overlay.GuideSelector.filters.sort_order.asc.lable', 'Asc')
                    },
                    {
                        'value': 'DESC',
                        'text': t('editor.overlay.GuideSelector.filters.sort_order.desc.lable', 'Desc')
                    }
                ],
                'value': 'DESC'
            })
            .data('name', 'sort_order')
            .appendTo(fieldset);

        buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(fieldset);

        new Button({'label': t('editor.overlay.GuideSelector.filters.submit.label', 'Submit')})
            .addClass('submit')
            .appendTo(buttons);

        new Button({'label': t('editor.overlay.GuideSelector.filters.reset.label', 'Reset')})
            .addClass('reset')
            .addListener('click', this.onFiltersResetClick.bind(this))
            .appendTo(buttons);

        this.results = new Dom('<table/>', {'class': 'results'})
            .appendTo(contents);
    }

    /**
     * Show the overlay
     *
     * @method show
     * @chainable
     */
    show() {
        super.show();

        this.load(true);

        return this;
    }

    /**
     * The onload success event handler
     *
     * @method onLoadSuccess
     * @private
     * @param {XMLHttpRequest} xhr The <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest" target="_blank">XMLHttpRequest</a> object
     */
    onLoadSuccess(xhr){
        const data = JSON.parse(xhr.response);

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

        this.setupResults(data.items);

        this.loadmask.hide();
        delete this.loadmask;
    }

    /**
     * The load error event handler
     *
     * @method onLoadError
     * @private
     * @param {XMLHttpRequest} xhr The <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest" target="_blank">XMLHttpRequest</a> object
     * @TODO
     */
    onLoadError(){
    }

    /**
     * The filter form submit event handler
     *
     * @method onFilterFormSubmit
     * @private
     * @param {Event} evt The event object
     */
    onFilterFormSubmit(evt){
        this.load();

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
     * Setup the results
     *
     * @method setupResults
     * @private
     * @chainable
     */
    setupResults(guides){
        let row,
            revision_wrapper, revision_field,
            groups, button;

        this.results.empty();

        if(isEmpty(guides)){
            this.results.text(this.configs.empty_text);
        }
        else{
            guides.forEach((guide) => {
                if(!(guide.permissions.update || guide.permissions.clone)){
                    return;
                }

                row = new Dom('<tr/>', {'class': `guide-${guide.id}`})
                    .appendTo(this.results);

                new Dom('<td/>', {'class': 'thumbnail'})
                    .append(new Dom('<img/>', {'src': guide.thumbnail ? guide.thumbnail.url : null}))
                    .appendTo(row);

                revision_field = new SelectField({
                        'label': t('editor.overlay.GuideSelector.revisionLabel', 'Version')
                    })
                    .addClass('revisions');

                if('revisions' in guide){
                    groups = {};

					Object.entries(guide.revisions).forEach(([vid, revision]) => {
                        let group_id, group_label, group, text;

                        switch(revision.state){
                            case 0: // archives
                                group_id = 'archives';
                                group_label = t('editor.overlay.GuideSelector.archivesGroup', 'archives');
                                break;

                            case 1: // published
                                group_id = 'published';
                                group_label = t('editor.overlay.GuideSelector.publishedGroup', 'published');
                                break;

                            case 2: // drafts
                                group_id = 'drafts';
                                group_label = t('editor.overlay.GuideSelector.draftsGroup', 'drafts');
                                break;
                        }

                        if(!(group_id in groups)){
                            groups[group_id] = revision_field.addGroup(group_label).addClass(group_id);
                        }

                        group = groups[group_id];

                        text = t('editor.overlay.GuideSelector.revisionText', '!date by !author (!id:!vid)', {'!date': revision.date, '!author': revision.author, '!id': guide.id, '!vid': vid});

                        revision_field.addOption(vid, text, group);
                    });

                    if('latest_revision' in guide){
                        revision_field.setValue(guide.latest_revision);
                    }
                }
                else{
                    revision_field.disable();
                }

                button = new Button()
                    .addClass('submit')
                    .setLabel(t('editor.overlay.GuideSelector.button', 'Select'))
                    .addListener('click', this.onGuideSelect.bind(this, guide, revision_field))
                    .data('action', 'select');

                revision_wrapper = new Dom('<div/>', {'class': 'revision-wrapper'})
                    .append(revision_field)
                    .append(button);

                new Dom('<td/>', {'class': 'details'})
                    .append(new Dom('<h1/>', {'class': 'title', 'text': guide.title}))
                    .append(new Dom('<p/>', {'class': 'description', 'text': guide.description}))
                    .append(new Dom('<p/>', {'class': 'tags', 'text': t('editor.overlay.GuideSelector.tagsText', 'tags: <em>!tags</em>', {'!tags': guide.tags})}))
                    .append(new Dom('<p/>', {'class': 'author', 'text': t('editor.overlay.GuideSelector.authorText', 'created by <em>!author</em>', {'!author': guide.author})}))
                    .append(revision_wrapper)
                    .appendTo(row);
            });
        }

        return this;
    }

    /**
     * Load guides
     *
     * @method load
     * @private
     * @chainable
     */
    load(initial){
        const data = {};

		Object.entries(this.filter_fields).forEach(([, field]) => {
            data[field.data('name')] = field.getValue();
        });

        if(initial === true){
            data.with_filter_options = true;
        }

        this.loadmask = new LoadMask({
            'parent': this.getContents(),
            'autoShow': true
        });

        Ajax.get(this.configs.url, {
            'data': data,
            'dataType': 'json',
            'success': this.onLoadSuccess.bind(this),
            'error': this.onLoadError.bind(this)
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

}
