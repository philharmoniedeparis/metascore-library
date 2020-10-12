import Overlay from '../../../core/ui/Overlay';
import Dom from '../../../core/Dom';
import Locale from '../../../core/Locale';
import Field from '../../Field';
import NumberInput from '../../../core/ui/input/NumberInput';
import TimeInput from '../../../core/ui/input/TimeInput';
import ColorInput from '../../../core/ui/input/ColorInput';
import CheckboxInput from '../../../core/ui/input/CheckboxInput';
import LoadMask from '../../../core/ui/overlay/LoadMask';
import Ajax from '../../../core/Ajax';
import { isEmpty } from '../../../core/utils/Var';

import { className } from '../../../../css/editor/assetbrowser/guideassets/AudioWaveformForm.scss';

/**
 * An overlay displaying a form to generate a spectrogram image
 */
export default class AudioWaveformForm extends Overlay {

    /**
     * Instantiate
     *
     * @param {String} url The url of the rest endpoint
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [toolbar=true] Whether to show a toolbar with a title and close button
     * @property {String} [title='Generate an audio waveform image'] The overlay's title
     */
    constructor(url, configs) {
        // call parent constructor
        super(configs);

        this.url = url;

        this.addClass(`audiowaveform-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return Object.assign({}, super.getDefaults(), {
            'toolbar': true,
            'title': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.title', 'Generate an audio waveform image'),
            'url': null,
            'xhr': {}
        });
    }

    /**
     * Setup the overlay's UI
     *
     * @private
     */
    setupUI() {
        // call parent method
        super.setupUI();

        const contents = this.getContents();

        this.form = new Dom('<form/>')
            .appendTo(contents);

        /**
         * The list of fields
         * @type {Object}
         */
        this.fields = {};

        const image_fieldset = new Dom('<fieldset/>')
            .appendTo(this.form);

        new Dom('<legend/>', { 'text': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fieldsets.image.legend', 'Image') })
            .appendTo(image_fieldset);

        const image_fields_wrapper = new Dom('<div/>', { 'class': 'fields-wrapper' })
            .appendTo(image_fieldset);

        this.fields.width = new Field(
            new NumberInput({
                'name': 'width',
                'value': 400,
                'min': 0,
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.width.label', 'Width')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.width.title', 'The width of the output image'))
            .data('opt', 'width')
            .appendTo(image_fields_wrapper);

        this.fields.height = new Field(
            new NumberInput({
                'name': 'height',
                'value': 200,
                'min': 0,
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.height.label', 'Height')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.height.title', 'The height of the output image'))
            .data('opt', 'height')
            .appendTo(image_fields_wrapper);

        this.fields['split-channels'] = new Field(
            new CheckboxInput({
                'name': 'split-channels'
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.split-channels.label', 'Split channels')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.split-channels.title', 'Whether to display as multi-channel, not combined into a single waveform'))
            .data('opt', 'split-channels')
            .appendTo(image_fields_wrapper);

        this.fields['no-axis-labels'] = new Field(
            new CheckboxInput({
                'name': 'no-axis-labels'
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.no-axis-labels.label', 'No axis labels')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.no-axis-labels.title', 'Whether to skip rendering axis labels and image border'))
            .data('opt', 'no-axis-labels')
            .addListener('valuechange', this.onNoAxisLabelsValueChange.bind(this))
            .appendTo(image_fields_wrapper);

        const time_fieldset = new Dom('<fieldset/>')
            .appendTo(this.form);

        new Dom('<legend/>', { 'text': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fieldsets.time.legend', 'Time') })
            .appendTo(time_fieldset);

        const time_fields_wrapper = new Dom('<div/>', { 'class': 'fields-wrapper' })
            .appendTo(time_fieldset);

        this.fields.start = new Field(
            new TimeInput({
                'name': 'start',
                'inButton': true,
                'clearButton': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.start.label', 'Start time')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.start.title', 'The media time to start at'))
            .data('opt', 'start')
            .appendTo(time_fields_wrapper);

        this.fields.end = new Field(
            new TimeInput({
                'name': 'end',
                'inButton': true,
                'clearButton': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.end.label', 'End time')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.end.title', 'The media time to end at'))
            .data('opt', 'end')
            .appendTo(time_fields_wrapper);

        const colors_fieldset = new Dom('<fieldset/>')
            .appendTo(this.form);

        new Dom('<legend/>', { 'text': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fieldsets.colors.legend', 'Colors') })
            .appendTo(colors_fieldset);

        const colors_fields_wrapper = new Dom('<div/>', { 'class': 'fields-wrapper' })
            .appendTo(colors_fieldset);

        this.fields['background-color'] = new Field(
            new ColorInput({
                'name': 'background-color',
                'format': 'hex',
                'value': '#00000000',
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.background-color.label', 'Background color')
            })
            .data('opt', 'background-color')
            .appendTo(colors_fields_wrapper);

        this.fields['waveform-color'] = new Field(
            new ColorInput({
                'name': 'waveform-color',
                'format': 'hex',
                'value': '#0000fe',
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.waveform-color.label', 'Waveform color')
            })
            .data('opt', 'waveform-color')
            .appendTo(colors_fields_wrapper);

        this.fields['axis-label-color'] = new Field(
            new ColorInput({
                'name': 'axis-label-color',
                'format': 'hex',
                'value': '#0000fe',
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.axis-label-color.label', 'Axis label color')
            })
            .data('opt', 'axis-label-color')
            .appendTo(colors_fields_wrapper);

        this.fields['border-color'] = new Field(
            new ColorInput({
                'name': 'border-color',
                'value': '#0000fe',
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.fields.border-color.label', 'Border color')
            })
            .data('opt', 'border-color')
            .appendTo(colors_fields_wrapper);

        this.addButton('apply', Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.buttons.apply.label', 'Generate'));
        this.addButton('cancel', Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.buttons.cancel.label', 'Cancel'));

        // Set the value to trigger the valuechange event.
        this.getField('no-axis-labels').getInput().setValue(true);
    }

    /**
     * @inheritdoc
     */
    onButtonClick(evt) {
        const action = new Dom(evt.target).data('action');

        switch (action) {
            case 'apply':
                this.sendData();
                break;

            default:
                super.onButtonClick(evt);
        }
    }

    /**
     * no-axis-labels field valuechange event handler
     *
     * @param {Event} evt The event object
     */
    onNoAxisLabelsValueChange(evt) {
        const value = evt.detail.value;

        this.getField('axis-label-color').getInput()[value ? 'disable' : 'enable']();
        this.getField('border-color').getInput()[value ? 'disable' : 'enable']();
    }

    /**
     * Get a field by name
     *
     * @param {String} name The field's name
     * @returns {Field|undefined} The corresponding field or undefined
     */
    getField(name) {
        return this.fields[name];
    }

    /**
     * Send the data via Ajax.
     *
     * @private
     */
    sendData() {
        const data = new FormData(this.form.get(0));

        // Format values.
        Object.values(this.fields).forEach((field) => {
            const input = field.getInput();
            const name = input.getName();

            if (input instanceof ColorInput && data.has(name)) {
                data.set(name, data.get(name).replace('#', ''));
            }
            else if (input instanceof CheckboxInput && data.has(name)) {
                data.set(name, data.get(name) ? 1 : 0);
            }
        });
        // Set zoom to 'auto' if no ebd time is specified.
        if (!data.has('end') || isEmpty(data.get('end'))) {
            data.set('zoom', 'auto');
        }

        const loadmask = new LoadMask({
            'parent': this,
            'text': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.sendData.LoadMask.text', 'Saving...')
        });

        const options = Object.assign({}, this.configs.xhr, {
            'data': data,
            'responseType': 'json',
            'onSuccess': this.onGenerateSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask)
        });

        Ajax.POST(this.url, options);
    }

    /**
     * Save success callback
     *
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     * @param {Event} evt The AJAX success event object
     */
    onGenerateSuccess(loadmask, evt) {
        loadmask.hide();
        this.triggerEvent('generate', { 'form': this, 'asset': evt.target.getResponse() });
    }

    /**
     * XHR error callback
     *
     * @private
     * @param {LoadMask} loadmask the loadmask to hide
     * @param {Event} evt The AJAX error event object
     */
    onXHRError(loadmask, evt) {
        loadmask.hide();

        const response = evt.target.getResponse();
        const error = response && 'message' in response ? response.message : evt.target.getStatusText();
        const code = evt.target.getStatus();

        new Overlay({
            'text': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.onXHRError.msg', 'The following error occured:<br/><strong><em>@error</em></strong><br/>Please try again.', { '@error': error, '@code': code }),
            'buttons': {
                'ok': Locale.t('editor.assetbrowser.guideassets.AudioWaveformForm.onXHRError.ok', 'OK'),
            },
            'parent': this
        });
    }
}
