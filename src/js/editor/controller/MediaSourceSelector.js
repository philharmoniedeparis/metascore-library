import Overlay from '../../core/ui/Overlay';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Confirm from '../../core/ui/overlay/Confirm';
import {MasterClock} from '../../core/media/MediaClock';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Field from '../Field';
import FileInput from '../../core/ui/input/FileInput';
import UrlInput from '../../core/ui/input/UrlInput';
import TimeInput from '../../core/ui/input/TimeInput';
import {getFileDuration, getMimeTypeFromURL} from '../../core/utils/Media';
import {formatFileSize} from '../../core/utils/Number';
import { History } from '../UndoRedo';

import {className} from '../../../css/editor/controller/MediaSourceSelector.scss';

/**
 * An overlay displaying a form to select a media file
 *
 * @emits {sourceset} Fired when the player's source is set
 * @param {Object} source The new source
 */
export default class MediaSourceSelector extends Overlay {

    static defaults = Object.assign({}, super.defaults, {
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

    /**
     * Instantiate
     *
     * @param {Editor} editor The Editor instance
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [toolbar=true] Whether to show a toolbar with a title and close button
     * @property {String} [title='Change media file'] The overlay's title
     */
    constructor(editor, configs) {
        // call parent constructor
        super(configs);

        /**
         * A reference to the Editor instance
         * @type {Editor}
         */
        this.editor = editor;

        this.addClass(`media-source-selector ${className}`);
    }

    /**
     * @inheritdoc
     */
    setupUI() {
        // call parent method
        super.setupUI();

        const contents = this.getContents();

        this.form = new Dom('<form/>')
            .addListener('submit', this.onFormSubmit.bind(this))
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
            new UrlInput({
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
     * The form's submit event callback
     *
     * @param {Event} evt The event object
     * @private
     */
    onFormSubmit(evt){
        this.processValues();
        evt.preventDefault();
    }

    /**
     * @inheritdoc
     */
    onButtonClick(evt){
        const action = new Dom(evt.target).data('action');

        switch(action){
            case 'apply':
                this.processValues();
                break;

            default:
                super.onButtonClick(evt);
        }
    }

    /**
     * Process the form values.
     *
     * @private
     */
    processValues(){
        const files = this.fields.file.getInput().getFiles();
        const file = files && files.length > 0 ? files.item(0) : null;
        const url = this.fields.url.getInput().getValue();
        const player = this.editor.getPlayer();
        let source = null;

        if(file){
            source = {
                'name': file.name,
                'size': file.size,
                'url': URL.createObjectURL(file),
                'mime': file.type,
                'source': 'upload',
                'object': file
            };
        }
        else if(url){
            const pathname = new URL(url).pathname;
            source = {
                'name': pathname.split('/').pop(),
                'url': url,
                'mime': getMimeTypeFromURL(url),
                'source': 'url'
            };
        }
        else{
            new Overlay({
                'text': Locale.t('editor.controller.MediaSourceSelector.onApplyClick.empty.msg', 'Please fill in either the file or the URL field.'),
                'buttons': {
                    'ok': Locale.t('editor.controller.MediaSourceSelector.onApplyClick.empty.ok', 'OK'),
                },
                'parent': this
            });
            return;
        }

        const loadmask = new LoadMask({
            'parent': this
        });

        const old_duration = MasterClock.getRenderer().getDuration();
        getFileDuration(source, (error, new_duration) => {
            loadmask.hide();

            if(error){
                new Overlay({
                    'text': error,
                    'buttons': {
                        'ok': Locale.t('editor.controller.MediaSourceSelector.onApplyClick.error.ok', 'OK'),
                    },
                    'parent': this
                });
                return;
            }

            if(new_duration !== old_duration){
                const formatted_old_duration = TimeInput.getTextualValue(old_duration);
                const formatted_new_duration = TimeInput.getTextualValue(new_duration);
                let msg = null;

                if(new_duration < old_duration){
                    const blocks = [];
                    const scenarios = player.getScenarios();

                    scenarios.forEach((scenario) => {
                        scenario.getChildren().forEach((component) => {
                            if(component.instanceOf('Block') && component.getPropertyValue('synched')){
                                component.getChildren().some((page) => {
                                    if(page.getPropertyValue('start-time') > new_duration){
                                        blocks.push(component.getPropertyValue('name'));
                                        return true;
                                    }

                                    return false;
                                });
                            }
                        });
                    });

                    if(blocks.length > 0){
                        new Overlay({
                            'text': Locale.t('editor.controller.MediaSourceSelector.onApplyClick.needs_review.msg', 'The duration of selected media (!new_duration) is less than the current one (!old_duration).<br/><strong>Pages with a start time after !new_duration will therefore be out of reach. This applies to blocks: !blocks</strong><br/>Delete those pages or modify their start time and try again.', {'!new_duration': formatted_new_duration, '!old_duration': formatted_old_duration, '!blocks': blocks.join(', ')}),
                            'buttons': {
                                'ok': Locale.t('editor.controller.MediaSourceSelector.onApplyClick.empty.ok', 'OK'),
                            },
                            'parent': this
                        });
                        return;
                    }

                    msg = Locale.t('editor.controller.MediaSourceSelector.onApplyClick.shorter.msg', 'The duration of selected media (!new_duration) is less than the current one (!old_duration).<br/><strong>It will probably be necessary to resynchronize the pages and elements whose end time is greater than that of the selected media.</strong><br/>Are you sure you want to use the new media file?', {'!new_duration': formatted_new_duration, '!old_duration': formatted_old_duration});
                }
                else{
                    msg = Locale.t('editor.controller.MediaSourceSelector.onApplyClick.longer.msg', 'The duration of selected media (!new_duration) is greater than the current one (!old_duration).<br/><strong>It will probably be necessary to resynchronize the pages and elements whose end time is equal to that of the current media.</strong><br/>Are you sure you want to use the new media file?', {'!new_duration': formatted_new_duration, '!old_duration': formatted_old_duration});
                }

                new Confirm({
                    'text': msg,
                    'onConfirm': () => {
                        this.setSource(source);
                        this.hide();
                    },
                    'parent': this
                });
            }
            else{
                this.setSource(source);
                this.hide();
            }
        });
    }

    /**
     * Update the Player's media source
     *
     * @private
     * @param {Object} source The source
     */
    setSource(source){
        const player = this.editor.getPlayer();
        const previous_source = player.getRenderer().getSource();

        player.setSource(source);

        History.add({
            'undo': () => {
                player.setSource(previous_source);
            },
            'redo': () => {
                player.setSource(source);
            }
        });

        this.triggerEvent('sourceset', {'source': source});
    }
}
