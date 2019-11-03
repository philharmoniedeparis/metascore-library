import Overlay from '../../core/ui/Overlay';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Field from '../Field';
import FileInput from '../../core/ui/input/FileInput';
import TextInput from '../../core/ui/input/TextInput';
import {formatFileSize} from '../../core/utils/Number';

import {className} from '../../../css/editor/controller/MediaSourceSelector.scss';

/**
 * An overlay displaying a form to select a media file
 */
export default class MediaSourceSelector extends Overlay {

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'toolbar': true,
            'title': Locale.t('editor.controller.MediaSourceSelector.title', 'Change media source'),
            'file': {
                'label': Locale.t('editor.controller.MediaSourceSelector.file.label', 'Select a file'),
                'description': Locale.t('editor.controller.MediaSourceSelector.file.description', 'File must be less than: !maxsize<br/>Supported file types: !types'),
                'accept': '.mp4, .mp3',
                'maxsize': 0
            },
            'url': {
                'label': Locale.t('editor.controller.MediaSourceSelector.url.label', 'Enter a media stream URL'),
                'description': Locale.t('editor.controller.MediaSourceSelector.url.description', 'Supported file types: !types'),
                'accept': '.mp4, .mp3, .m3u8 (HLS), .mpd (MPEG-Dash)'
            }
        });
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [toolbar=true] Whether to show a toolbar with a title and close button
     * @property {String} [title='Change media file'] The overlay's title
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`media-source-selector ${className}`);
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

        this.fields.file = new Field(
            new FileInput({
                'name': 'file',
                'accept': this.configs.file.accept
            }),
            {
                'label': this.configs.file.label,
                'description': Locale.formatString(this.configs.file.description, {'!types': this.configs.file.accept, '!maxsize': formatFileSize(this.configs.file.maxsize)})
            })
            .appendTo(this.form);

        const separator = new Dom('<div/>', {'class': 'separator'})
            .appendTo(this.form);

        new Dom('<span/>')
            .text(Locale.t('editor.controller.MediaSourceSelector.separator.text', 'OR'))
            .appendTo(separator);

        this.fields.url = new Field(
            new TextInput({
                'name': 'url',
            }),
            {
                'label': this.configs.url.label,
                'description': Locale.formatString(this.configs.url.description, {'!types': this.configs.url.accept})
            })
            .appendTo(this.form);

        this.addButton('apply', Locale.t('editor.controller.MediaSourceSelector.buttons.apply.label', 'Apply'));
        this.addButton('cancel', Locale.t('editor.controller.MediaSourceSelector.buttons.cancel.label', 'Cancel'));
    }

    /**
     * @inheritdoc
     */
    onButtonClick(evt){
        const action = new Dom(evt.target).data('action');

        switch(action){
            case 'apply':
                {
                    const files = this.fields.file.getInput().getFiles();
                    const url = this.fields.url.getInput().getValue();
                    this.triggerEvent('apply', {'overlay': this, 'file': files.length > 0 ? files.item(0) : null, 'url': url});
                }
                break;

            default:
                super.onButtonClick(evt);
        }
    }

    getField(name){
        return this.fields[name];
    }
}
