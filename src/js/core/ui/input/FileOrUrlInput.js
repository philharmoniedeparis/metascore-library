import Input from '../Input';
import Dom from '../../Dom';
import Locale from '../../Locale';
import {uuid} from '../../utils/String';
import {getMimeTypeFromURL} from '../../utils/Media';

import {className} from '../../../../css/core/ui/input/FileOrUrlInput.scss';

/**
 * A multi-source file input based on an HTML input[type=file] element
 *
 * @emits {valuechange} Fired when the input's value changes
 * @param {Object} input The input instance
 * @param {Mixed} value The new value
 */
export default class FileOrUrlInput extends Input {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`fileorurl ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'file': {
                'label': Locale.t('core.ui.input.FileInput.sources.file.label', 'File'),
                'accept': null
            },
            'url': {
                'label': Locale.t('core.ui.input.FileInput.sources.url.label', 'URL'),
            }
        });
    }

    /**
     * Setup the input's UI
     *
     * @private
     */
    setupUI() {
        /**
         * The current value for each source type
         * @type {Object}
         */
        this.values = {};

        /**
         * The source-selector container
         * @type {Dom}
         */
        this.sources_selector = new Dom('<div/>', {'class': 'sources-selector'})
            .appendTo(this);

        /**
         * The inputs container
         * @type {Dom}
         */
        this.inputs = new Dom('<div/>', {'class': 'inputs'})
            .appendTo(this);

        const id = this.getId();

        Object.entries({'file': this.configs.file, 'url': this.configs.url}).forEach(([source, config]) => {
            const radio_uid = `source_selector-${uuid(5)}`;

            const radio_wrapper = new Dom('<div/>', {'class': 'source-selector-wrapper'})
                .appendTo(this.sources_selector);

            new Dom('<input/>', {'id': radio_uid, 'type': 'radio', 'value': source})
                .attr('name', `${id}-source-selector`)
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
                case 'file':
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
        });

        this.setActiveSource(Object.keys(this.configs.sources)[0]);

        if(Object.keys(this.configs.sources).length < 2){
            this.sources_selector.hide();
        }
    }

    /**
     * The inputs change event handler
     *
     * @private
     * @param {Event} evt The event object
     */
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
                        'mimetype': getMimeTypeFromURL(url)
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

        this.triggerEvent('valuechange', {'input': this, 'value': this.value}, true, false);
    }

    /**
     * The click event handler
     *
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
     * Set the input's value
     *
     * @param {Object} value The new value
     * @property {String} name The file's name
     * @property {String} url The file's url
     * @property {String} source The file's source type
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        const active_source = value && 'source' in value ? value.source : 'file';

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

    /**
     * Set the active source type
     *
     * @param {String} [source] The source type to activate
     * @return {this}
     */
    setActiveSource(source){
        const inputs = this.inputs.children('.input');

        inputs.hide()
            .children('input').attr('disabled', 'true');

        inputs.filter(`[data-source="${source}"`).show()
            .children('input').attr('disabled', null);

        /**
         * The current value
         * @type {String}
         */
        this.value = source in this.values ? this.values[source] : null;

        return this;
    }

    /**
     * Disable the input
     *
     * @return {this}
     */
    disable() {
        super.disable();

        this.inputs.children('input').attr('disabled', 'true');

        return this;
    }

    /**
     * Enable the input
     *
     * @return {this}
     */
    enable() {
        super.enable();

        this.inputs.children('input').attr('disabled', null);

        return this;
    }

    /**
     * Toggle the input's readonly state
     *
     * @param {Boolean} [readonly] Whether the input should be readonly, the current state is toggled if not provided
     * @return {this}
     */
    readonly(readonly){
        super.readonly(readonly);

        this.inputs.children('input').attr('readonly', this.is_readonly ? "readonly" : null);

        return this;
    }

}
