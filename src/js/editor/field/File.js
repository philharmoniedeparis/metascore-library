import Field from '../Field';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {uuid} from '../../core/utils/String';
import {getFileMime} from '../../core/utils/Media';

import '../../../css/editor/field/File.less';

/**
 * Fired when the field's value changes
 *
 * @event valuechange
 * @param {Object} field The field instance
 * @param {Mixed} value The new value
 */
const EVT_VALUECHANGE = 'valuechange';

export default class File extends Field {

    /**
     * A file field based on an HTML input[type=file] element
     *
     * @class FileField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('filefield');
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'sources': {
                'upload': {
                    'label': Locale.t('editor.field.File.sources.upload.label', 'Upload'),
                    'accept': null
                },
                'url': {
                    'label': Locale.t('editor.field.File.sources.url.label', 'URL'),
                }
            }
        });
    }

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        const uid = `field-${uuid(5)}`;

        this.values = {};

        if(this.configs.label){
            this.label = new Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.sources_selector = new Dom('<div/>', {'class': 'sources-selector'})
            .appendTo(this.input_wrapper);

        this.inputs = new Dom('<div/>', {'class': 'inputs'})
            .appendTo(this.input_wrapper);

        Object.entries(this.configs.sources).forEach(([source, config]) => {
            const radio_uid = `source_selector-${uuid(5)}`;

            const radio_wrapper = new Dom('<div/>', {'class': 'source-selector-wrapper'})
                .appendTo(this.sources_selector);

            new Dom('<input/>', {'id': radio_uid, 'type': 'radio', 'value': source})
                .attr('name', `${uid}-source-selector`)
                .addListener('click', this.onSourceSelectorClick.bind(this))
                .addListener('change', this.onSourceSelectorChange.bind(this))
                .appendTo(radio_wrapper);

            if('label' in config){
                new Dom('<label/>', {'text': config.label, 'for': radio_uid})
                    .appendTo(radio_wrapper);
            }

            const input = new Dom('<div/>', {'class': 'input'})
                .addListener('change', this.onInputChange.bind(this))
                .data('source', source)
                .appendTo(this.inputs);

            switch(source){
                case 'upload':
                    new Dom('<input/>', {'type': 'file'})
                        .attr('required', this.configs.required ? '' : null)
                        .attr('accept', 'accept' in config ? config.accept : null)
                        .appendTo(input);
                    new Dom('<div/>', {'class': 'current'})
                        .appendTo(input);
                    break;

                case 'url':
                    new Dom('<input/>', {'type': 'url'})
                        .attr('required', this.configs.required ? '' : null)
                        .attr('pattern', 'pattern' in config ? config.pattern : null)
                        .appendTo(input);
                    break;
            }

            if('description' in config){
                new Dom('<div/>', {'class': 'description', 'text': config.description})
                    .appendTo(input);
            }
        });

        this.setActiveSource(Object.keys(this.configs.sources)[0]);

        if(Object.keys(this.configs.sources).length < 2){
            this.sources_selector.hide();
        }
    }

    onInputChange(evt){
        const input = new Dom(evt.target);
        const parent = input.parents();
        const source = parent.data('source');

        this.values[source] = null;

        switch(source){
            case 'url': {
                const url = input.val();

                if(url){
                    this.values[source] = {
                        'url': url,
                        'source': source,
                        'mime': getFileMime(url)
                    };
                }
                break;
            }

            default: {
                 const file = input.get(0).files[0];
                 const current = parent.find('.current');

                 current.empty();

                 if(file){
                     const file_obj = {
                         'name': file.name,
                         'url': URL.createObjectURL(file),
                         'mime': file.type,
                         'object': file,
                         'source': source
                     };

                     this.values[source] = file_obj;

                     const info = new Dom('<a/>', {'text': file_obj.name})
                         .attr('target', '_blank')
                         .appendTo(current);

                     if('url' in file_obj){
                         info.attr('href', file_obj.url);
                     }
                 }
             }
        }

        this.setActiveSource(source);

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    }

    /**
     * The click event handler
     *
     * @method onSourceSelectorClick
     * @private
     * @param {Event} evt The event object
     */
    onSourceSelectorClick(evt){
        if(this.is_readonly){
            evt.preventDefault();
        }
    }

    /**
     * The change event handler
     *
     * @method onSourceSelectorChange
     * @private
     * @param {Event} evt The event object
     */
    onSourceSelectorChange(evt){
        if(this.is_readonly){
            evt.preventDefault();
            return;
        }

        const source = Dom.val(evt.target);
        this.setActiveSource(source);

        evt.stopPropagation();
    }

    /**
     * Set the field's value
     *
     * @method setValue
     * @param {Object} [value] The new value
     * @param {String} value.name The file's name
     * @param {String} [value.url] The file's url
     * @chainable
     */
    setValue(value, supressEvent){
        const active_source = value && 'source' in value ? value.source : 'upload';

        this.values = {};

        this.sources_selector.find('input').forEach((selector_el) => {
            const selector = new Dom(selector_el);
            const source = selector.val();
            const input = this.inputs.find(`.input[data-source="${source}"] input`);

            switch(active_source){
                case 'url':
                    input.val('');
                    break;

                default:
                    input.parents().find('.current').empty();
                    input.val('');

                    if(this.configs.required){
                        input.attr('required', '');
                    }
            }

            selector_el.checked = source === active_source;
        });

        const input = this.inputs.find(`.input[data-source="${active_source}"] input`);

        switch(active_source){
            case 'url': {
                input.val(value && 'url' in value ? value.url : '');
                break;
            }

            default: {
                const current = input.parents().find('.current');

                if(value && ('name' in value)){
                    const info = new Dom('<a/>', {'text': value.name})
                        .attr('target', '_blank')
                        .appendTo(current);

                    if('url' in value){
                        info.attr('href', value.url);
                    }

                    input.attr('required', null);
                }
            }
        }

        this.values[active_source] = value;

        this.setActiveSource(active_source);

        if(supressEvent !== true){
            input.triggerEvent('change');
        }

        return this;
    }

    setActiveSource(source){
        const inputs = this.inputs.children('.input');

        inputs.hide()
            .children('input').attr('disabled', 'disabled');

        inputs.filter(`[data-source="${source}"`).show()
            .children('input').attr('disabled', null);

        this.value = source in this.values ? this.values[source] : null;
    }

    /**
     * Disable the field
     *
     * @method disable
     * @chainable
     */
    disable() {
        super.disable();

        this.inputs.children('input').attr('disabled', 'disabled');

        return this;
    }

    /**
     * Enable the field
     *
     * @method enable
     * @chainable
     */
    enable() {
        super.enable();

        this.inputs.children('input').attr('disabled', null);

        return this;
    }

    /**
     * Toggle the field's readonly state
     *
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    readonly(readonly){
        super.readonly(readonly);

        this.inputs.children('input').attr('readonly', this.is_readonly ? "readonly" : null);

        return this;
    }

}
