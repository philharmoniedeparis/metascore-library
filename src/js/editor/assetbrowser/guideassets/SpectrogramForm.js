import Overlay from '../../../core/ui/Overlay';
import Dom from '../../../core/Dom';
import Locale from '../../../core/Locale';
import Field from '../../Field';
import NumberInput from '../../../core/ui/input/NumberInput';
import TimeInput from '../../../core/ui/input/TimeInput';
import SelectInput from '../../../core/ui/input/SelectInput';
import CheckboxInput from '../../../core/ui/input/CheckboxInput';
import LoadMask from '../../../core/ui/overlay/LoadMask';
import Ajax from '../../../core/Ajax';

import {className} from '../../../../css/editor/assetbrowser/guideassets/SpectrogramForm.scss';

/**
 * An overlay displaying a form to generate a spectrogram image
 */
export default class SpectrogramForm extends Overlay {

    /**
     * Instantiate
     *
     * @param {String} url The url of the rest endpoint
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [toolbar=true] Whether to show a toolbar with a title and close button
     * @property {String} [title='Generate a spectrogram image'] The overlay's title
     */
    constructor(url, configs) {
        // call parent constructor
        super(configs);

        this.url = url;

        this.addClass(`spectrogram-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'toolbar': true,
            'title': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.title', 'Generate an audio spectrogram image'),
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

        new Dom('<legend/>', {'text': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fieldsets.image.legend', 'Image')})
            .appendTo(image_fieldset);

        const image_fields_wrapper = new Dom('<div/>', {'class': 'fields-wrapper'})
            .appendTo(image_fieldset);

        this.fields.width = new Field(
            new NumberInput({
                'name': 'width',
                'value': 400,
                'min': 0,
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.width.label', 'Width')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.width.title', 'The width of the output image'))
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
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.height.label', 'Height')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.height.title', 'The height of the output image'))
            .data('opt', 'height')
            .appendTo(image_fields_wrapper);

        this.fields.mode = new Field(
            new SelectInput({
                'name': 'mode',
                'value': 'combined',
                'options': {
                    'combined': 'Combined',
                    'separate': 'Separate'
                },
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.mode.label', 'Channels')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.mode.title', 'The channels display mode'))
            .data('opt', 'mode')
            .appendTo(image_fields_wrapper);

        this.fields.legend = new Field(
            new CheckboxInput({
                'name': 'legend',
                'value': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.legend.label', 'Draw legend')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.legend.title', 'Whether to draw time and frequency axes and legends.'))
            .data('opt', 'legend')
            .appendTo(image_fields_wrapper);

        const time_fieldset = new Dom('<fieldset/>')
            .appendTo(this.form);

        new Dom('<legend/>', {'text': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fieldsets.time.legend', 'Time')})
            .appendTo(time_fieldset);

        const time_fields_wrapper = new Dom('<div/>', {'class': 'fields-wrapper'})
            .appendTo(time_fieldset);

        this.fields.start_time = new Field(
            new TimeInput({
                'name': 'start_time',
                'inButton': true,
                'clearButton': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.start-time.label', 'Start time')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.start-time.title', 'The media time to start at'))
            .data('opt', 'start_time')
            .appendTo(time_fields_wrapper);

        this.fields.end_time = new Field(
            new TimeInput({
                'name': 'end_time',
                'inButton': true,
                'clearButton': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.end-time.label', 'End time')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.end-time.title', 'The media time to end at'))
            .data('opt', 'end_time')
            .appendTo(time_fields_wrapper);

        const scale_fieldset = new Dom('<fieldset/>')
            .appendTo(this.form);

        new Dom('<legend/>', {'text': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fieldsets.scale.legend', 'Scale')})
            .appendTo(scale_fieldset);

        const scale_fields_wrapper = new Dom('<div/>', {'class': 'fields-wrapper'})
            .appendTo(scale_fieldset);

        this.fields.scale = new Field(
            new SelectInput({
                'name': 'scale',
                'value': 'log',
                'options': {
                    'lin': 'linear',
                    'sqrt': 'square root',
                    'cbrt': 'cubic root',
                    'log': 'logarithmic',
                    '4thrt': '4th root',
                    '5thrt': '5th root'
                },
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.scale.label', 'Scale')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.scale.title', 'The scale used for calculating intensity color values'))
            .data('opt', 'scale')
            .appendTo(scale_fields_wrapper);

        this.fields.start = new Field(
            new NumberInput({
                'name': 'start',
                'value': 0,
                'min': 0,
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.start.label', 'Min frequency (Hz)')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.start.title', 'The min frequency from which to display spectrogram'))
            .data('opt', 'start')
            .appendTo(scale_fields_wrapper);

        this.fields.stop = new Field(
            new NumberInput({
                'name': 'stop',
                'value': 0,
                'min': 0,
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.stop.label', 'Max frequency (Hz)')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.stop.title', 'The max frequency to which to display spectrogram'))
            .data('opt', 'stop')
            .appendTo(scale_fields_wrapper);

        const color_fieldset = new Dom('<fieldset/>')
            .appendTo(this.form);

        new Dom('<legend/>', {'text': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fieldsets.color.legend', 'Color')})
            .appendTo(color_fieldset);

        const color_fields_wrapper = new Dom('<div/>', {'class': 'fields-wrapper'})
            .appendTo(color_fieldset);

        this.fields.color = new Field(
            new SelectInput({
                'name': 'color',
                'value': 'intensity',
                'options': {
                    'channel': 'Channel',
                    'intensity': 'Intensity',
                    'rainbow': 'Rainbow',
                    'moreland': 'Moreland',
                    'nebulae': 'Nebulae',
                    'fire': 'Fire',
                    'fiery': 'Fiery',
                    'fruit': 'Fruit',
                    'cool': 'Cool',
                    'magma': 'Magma',
                    'green': 'Green',
                    'viridis': 'Viridis',
                    'plasma': 'Plasma',
                    'cividis': 'Cividis',
                    'terrain': 'Terrain'
                },
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.color.label', 'Mode')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.color.title', 'The display color mode'))
            .data('opt', 'color')
            .appendTo(color_fields_wrapper);

        this.fields.gain = new Field(
            new NumberInput({
                'name': 'gain',
                'value': 1,
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.gain.label', 'Gain')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.gain.title', 'The scale gain for calculating intensity color values. Allows increasing/decreasing the brightness of the display.'))
            .data('opt', 'gain')
            .appendTo(color_fields_wrapper);

        this.fields.saturation = new Field(
            new NumberInput({
                'name': 'saturation',
                'value': 1.0,
                'min': -10.0,
                'max': 10.0,
                'step': 0.1,
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.saturation.label', 'Saturation')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.saturation.title', 'The saturation modifier for displayed colors'))
            .data('opt', 'saturation')
            .appendTo(color_fields_wrapper);

        this.fields.rotation = new Field(
            new NumberInput({
                'name': 'rotation',
                'value': 0,
                'min': -1.0,
                'max': 1.0,
                'step': 0.1,
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.rotation.label', 'Rotation')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.rotation.title', 'The color rotation'))
            .data('opt', 'rotation')
            .appendTo(color_fields_wrapper);

        const algorithm_fieldset = new Dom('<fieldset/>')
            .appendTo(this.form);

        new Dom('<legend/>', {'text': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fieldsets.algorithm.legend', 'Algorithm')})
            .appendTo(algorithm_fieldset);

        const algorithm_fields_wrapper = new Dom('<div/>', {'class': 'fields-wrapper'})
            .appendTo(algorithm_fieldset);

        this.fields.win_func = new Field(
            new SelectInput({
                'name': 'win_func',
                'value': 'hann',
                'options': {
                    'rect': 'rect',
                    'bartlett': 'bartlett',
                    'hann': 'hann',
                    'hanning': 'hanning',
                    'hamming': 'hamming',
                    'blackman': 'blackman',
                    'welch': 'welch',
                    'flattop': 'flattop',
                    'bharris': 'bharris',
                    'bnuttall': 'bnuttall',
                    'bhann': 'bhann',
                    'sine': 'sine',
                    'nuttall': 'nuttall',
                    'lanczos': 'lanczos',
                    'gauss': 'gauss',
                    'tukey': 'tukey',
                    'dolph': 'dolph',
                    'cauchy': 'cauchy',
                    'parzen': 'parzen',
                    'poisson': 'poisson',
                    'bohman': 'bohman'
                },
                'required': true
            }),
            {
                'label': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.win_func.label', 'Window function')
            })
            .attr('title', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.fields.win_func.title', 'The window function'))
            .data('opt', 'win_func')
            .appendTo(algorithm_fields_wrapper);

        this.addButton('apply', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.buttons.apply.label', 'Generate'));
        this.addButton('cancel', Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.buttons.cancel.label', 'Cancel'));
    }

    /**
     * @inheritdoc
     */
    onButtonClick(evt){
        const action = new Dom(evt.target).data('action');

        switch(action){
            case 'apply':
                this.sendData();
                break;

            default:
                super.onButtonClick(evt);
        }
    }

    getField(name){
        return this.fields[name];
    }

    sendData(){
        const data = new FormData(this.form.get(0));

        // Get "size" from "width" and "height"
        const width = data.get('width');
        const height = data.get('height');
        data.set('size', `${width}x${height}`);
        data.delete('width');
        data.delete('height');

        const legend = data.get('legend');
        data.set('legend', legend ? 1 : 0);

        const loadmask = new LoadMask({
            'parent': this,
            'text': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.sendData.LoadMask.text', 'Saving...')
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
     */
    onGenerateSuccess(loadmask, evt){
        loadmask.hide();
        this.triggerEvent('generate', {'form': this, 'asset': evt.target.getResponse()});
    }

    onXHRError(loadmask, evt){
        loadmask.hide();

        const response = evt.target.getResponse();
        const error = response && 'message' in response ? response.message : evt.target.getStatusText();
        const code = evt.target.getStatus();

        new Overlay({
            'text': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.onXHRError.msg', 'The following error occured:<br/><strong><em>@error</em></strong><br/>Please try again.', {'@error': error, '@code': code}),
            'buttons': {
                'ok': Locale.t('editor.assetbrowser.guideassets.SpectrogramForm.onXHRError.ok', 'OK'),
            },
            'parent': this
        });
    }
}
