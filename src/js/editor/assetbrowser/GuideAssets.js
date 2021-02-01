import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Ajax from '../../core/Ajax';
import Button from '../../core/ui/Button';
import Icon from '../../core/ui/Icon';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Overlay from '../../core/ui/Overlay';
import Confirm from '../../core/ui/overlay/Confirm';
import FileInput from '../../core/ui/input/FileInput';
import Field from '../Field';
import SpectrogramForm from './guideassets/SpectrogramForm';
import AudioWaveformForm from './guideassets/AudioWaveformForm';
import { isValidMimeType } from '../../core/utils/Media';
import { escapeHTML } from '../../core/utils/String';
import { History } from '../UndoRedo';
import Lottie from 'lottie-web';

import import_icon from '../../../img/editor/assetbrowser/guideassets/import.svg?svg-sprite';
import delete_icon from '../../../img/editor/assetbrowser/guideassets/delete.svg?svg-sprite';
import spectrogram_icon from '../../../img/editor/assetbrowser/guideassets/spectrogram.svg?svg-sprite';
import audiowaveform_icon from '../../../img/editor/assetbrowser/guideassets/audiowaveform.svg?svg-sprite';
import image_icon from '../../../img/editor/assetbrowser/guideassets/image.svg?svg-sprite';
import audio_icon from '../../../img/editor/assetbrowser/guideassets/audio.svg?svg-sprite';
import video_icon from '../../../img/editor/assetbrowser/guideassets/video.svg?svg-sprite';

import { className, assetDragGhostClassName } from '../../../css/editor/assetbrowser/GuideAssets.scss';

/**
 * A guide assets browser class
 */
export default class GuideAssets extends Dom {

    static defaults = {
        'import': {
            'url': null,
            'max_filesize': null,
            'allowed_types': null,
        },
        'spectrogram_form': {
            'url': null,
            'configs': {}
        },
        'audiowaveform_form': {
            'url': null,
            'configs': {}
        },
        'xhr': {}
    };

    /**
     * Instantiate
     *
     * @param {Editor} editor The editor instance
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} list_url The assets list url
     * @property {Object} import_url The asset import url
     * @property {Object} [xhr={}] Options to send with each XHR request. See {@link Ajax.send} for available options
     */
    constructor(editor, configs) {
        // call parent constructor
        super('<div/>', { 'class': `guide-assets ${className}` });

        /**
         * A reference to the Editor instance
         * @type {Editor}
         */
        this.editor = editor;

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        /**
         * The list of loaded assets
         * @type {Object}
         */
        this.asset_items = {};

        // fix event handlers scope
        this.onAssetDragStart = this.onAssetDragStart.bind(this);
        this.onAssetDragEnd = this.onAssetDragEnd.bind(this);
        this.onAssetButtonClick = this.onAssetButtonClick.bind(this);

        this.assets_container = new Dom('<div/>', { 'class': 'assets-container' })
            .appendTo(this);

        const import_field = new Field(
            new FileInput({
                'multiple': true,
                'accept': this.configs.import.allowed_types
            }),
            {
                'label': Locale.t('editor.assetbrowser.GuideAssets.import-assets-field.label', 'Import files'),
            })
            .addClass('import-assets')
            .addListener('valuechange', this.onAssetImportFieldVlueChange.bind(this))
            .appendTo(this);

        new Icon({ 'symbol': import_icon })
            .appendTo(import_field.getLabel());

        new Button({
            'icon': spectrogram_icon,
            'label': Locale.t('editor.assetbrowser.GuideAssets.spectrogram-button.label', 'Create spectrogram image')
        })
            .data('action', 'spectrogram')
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this);

        new Button({
            'icon': audiowaveform_icon,
            'label': Locale.t('editor.assetbrowser.GuideAssets.audiowaveform-button.label', 'Create audio waveform image')
        })
            .data('action', 'audiowaveform')
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this);

        this
            .addListener('dragover', this.onDragOver.bind(this))
            .addListener('dragleave', this.onDragLeave.bind(this))
            .addListener('drop', this.onDrop.bind(this));
    }

    /**
     * Asset import field valuechange callback.
     *
     * @private
     * @param {Event} evt The event object.
     */
    onAssetImportFieldVlueChange(evt){
        this.importAssets(evt.detail.files);
    }

    /**
     * Get the list of files being dragged.
     *
     * @private
     * @param {DataTransfer} dataTransfer The DataTransfer object.
     */
    getDraggedFiles(dataTransfer) {
        let files = [];

        // Use DataTransfer interface to access the file(s)
        if (dataTransfer.files && dataTransfer.files.length > 0) {
            files = dataTransfer.files;
        }
        else if (dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < dataTransfer.items.length; i++) {
                if (dataTransfer.items[i].kind === 'file') {
                    files.push(dataTransfer.items[i].getAsFile());
                }
            }
        }

        return files;
    }

    /**
     * Dragover event callback.
     *
     * @private
     * @param {Event} evt The event object.
     */
    onDragOver(evt) {
        const files = this.getDraggedFiles(evt.dataTransfer);
        if (files.length > 0) {
            this.addClass('droppable');
            evt.preventDefault();
        }
    }

    /**
     * Dragrelease event callback.
     *
     * @private
     */
    onDragLeave() {
        this.removeClass('droppable');
    }

    /**
     * Drop event callback.
     *
     * @private
     * @param {Event} evt The event object.
     */
    onDrop(evt) {
        const files = this.getDraggedFiles(evt.dataTransfer);
        this.importAssets(files);

        this.removeClass('droppable');

        evt.preventDefault();
        evt.stopPropagation();
    }

    /**
     * Import a list of files.
     *
     * @private
     * @param {FileList} files The list of files.
     */
    importAssets(files) {
        if (files.length === 0) {
            return;
        }

        const formdata = new FormData();

        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);

            if (this.configs.import.allowed_types && !isValidMimeType(file.type, this.configs.import.allowed_types)) {
                new Overlay({
                    'text': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid_type.msg', '<em>@name</em> is not an accepted file type.', { '@name': file.name }),
                    'buttons': {
                        'ok': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid.ok', 'OK'),
                    },
                    'parent': this
                });
                return;
            }

            if (this.configs.import.max_filesize && file.size > this.configs.import.max_filesize) {
                new Overlay({
                    'text': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid_size.msg', '<em>@name</em> size (@filesize) exceeds the allowed size (@maxsize).', { '@name': file.name, '@filesize': file.size, '@maxsize': this.configs.import.max_filesize }),
                    'buttons': {
                        'ok': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid.ok', 'OK'),
                    },
                    'parent': this
                });
                return;
            }

            formdata.append(`files[asset][]`, file);
        }

        // add a loading mask
        const loadmask = new LoadMask({
            'parent': this.editor,
            'text': Locale.t('editor.assetbrowser.GuideAssets.importAssets.loadmask.text', 'Uploading...'),
            'bar': true
        });

        // prepare the Ajax options object
        const options = Object.assign({}, this.configs.xhr, {
            'data': formdata,
            'responseType': 'json',
            'onSuccess': this.onAssetsImportSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask),
            'autoSend': false
        });

        const hundred = 100;
        Ajax.POST(this.configs.import.url, options)
            .addUploadListener('loadstart', () => {
                loadmask.setProgress(0);
            })
            .addUploadListener('progress', (evt) => {
                if (evt.lengthComputable) {
                    const percent = Math.floor((evt.loaded / evt.total) * hundred);
                    loadmask.setProgress(percent);
                }
            })
            .addUploadListener('loadend', () => {
                loadmask.setProgress(hundred);
            })
            .send();
    }

    /**
     * Asset import XHR success event callback.
     *
     * @private
     * @param {LoadMask} loadmask The load mask.
     * @param {Event} evt The event object.
     */
    onAssetsImportSuccess(loadmask, evt) {
        const assets = evt.target.getResponse();

        this.addAssets(assets);

        History.add({
            'undo': () => {
                assets.forEach((asset) => {
                    this.removeAsset(asset.id);
                });
            },
            'redo': () => {
                this.addAssets(assets);
            }
        });

        this.editor.setDirty('assets');

        loadmask.hide();
    }

    /**
     * Add an asset.
     *
     * @param {Object} asset The asset to add
     * @param {Boolean} supressEvent Whether to prevent the assetadd event from firing
     * @return {this}
     */
    addAsset(asset, supressEvent) {
        this.createAssetItem(asset);

        if (supressEvent !== true) {
            this.triggerEvent('assetadd', { 'asset': asset });
        }

        return this;
    }

    /**
     * Add assets.
     *
     * @param {Array} assets The assets to add
     * @param {Boolean} supressEvent Whether to prevent the assetadd event from firing
     * @return {this}
     */
    addAssets(assets, supressEvent) {
        assets.forEach((asset) => {
            this.addAsset(asset, supressEvent);
        });

        return this;
    }

    /**
     * Remove an asset item.
     *
     * @private
     * @param {Number} id The asset id to remove
     * @param {Boolean} supressEvent Whether to prevent the assetremove event from firing
     * @return {this}
     */
    removeAsset(id, supressEvent) {
        const item = this.asset_items[id];
        const asset = item.asset;
        const el = item.el;

        el.remove();

        delete this.asset_items[asset.id];

        if (supressEvent !== true) {
            this.triggerEvent('assetremove', { 'asset': asset });
        }

        return this;
    }

    /**
     * Create an item corresponding to an asset.
     *
     * @private
     * @param {Object} asset The asset.
     * @return {this}
     */
    createAssetItem(asset) {
        const name = escapeHTML(asset.name);

        const el = new Dom('<div/>', { 'class': 'asset' })
            .attr('draggable', 'true')
            .attr('tabindex', '0')
            .data('id', asset.id)
            .addListener('dragstart', this.onAssetDragStart)
            .addListener('dragend', this.onAssetDragEnd)
            .addDelegate('button', 'click', this.onAssetButtonClick)
            .appendTo(this.assets_container);

        const figure = new Dom('<figure/>')
            .appendTo(el);

        let file = asset;
        if ('shared' in asset && asset.shared) {
            file = asset.file;
        }

        if (asset.type === 'lottie_animation') {
            const animation = Lottie.loadAnimation({
                container: figure.get(0),
                path: file.url,
                renderer: 'svg',
                loop: true,
                autoplay: false,
            });

            el.addListener('mouseover', () => {
                animation.play();
            }).addListener('mouseout', () => {
                animation.stop();
            }).addListener('drag', () => {
                animation.stop();
            });
        }
        else {
            const matches = /^(image|audio|video)\/.*/.exec(file.mimetype);
            if (matches) {
                const type = matches[1];
                switch (type) {
                    case 'image':
                        new Dom('<img/>', { 'src': file.url }).appendTo(figure);
                        break;

                    case 'audio':
                        new Icon({ 'symbol': audio_icon }).appendTo(figure);
                        break;

                    case 'video':
                        new Icon({ 'symbol': video_icon }).appendTo(figure);
                        break;
                }
            }
            else {
                new Icon({ 'symbol': image_icon }).appendTo(figure);
            }
        }

        new Dom('<div/>', { 'class': 'label', 'text': name, 'title': name })
            .appendTo(el);

        const buttons = new Dom('<div/>', { 'class': 'buttons' })
            .appendTo(el);

        new Button({ 'icon': delete_icon })
            .attr('title', Locale.t('editor.assetbrowser.GuideAssets.AssetDeleteButton.label', 'Delete'))
            .data('action', 'delete')
            .appendTo(buttons);

        el.focus();
        el.get(0).scrollIntoView();

        this.asset_items[asset.id] = {
            'asset': asset,
            'el': el,
            'figure': figure
        };

        return this;
    }

    /**
     * Remove all assets.
     */
    clearAssets() {
        this.asset_items = {};
        this.assets_container.empty();

        return this;
    }

    /**
     * Get an asset by id.
     *
     * @param {string} id The asset's identifier.
     * @return {Object|undefined} The asset.
     */
    getAsset(id) {
        return this.asset_items[id].asset;
    }

    /**
     * Get the lists of available assets.
     *
     * @return {Array} The assets.
     */
    getAssets() {
        return Object.values(this.asset_items).map((item) => {
            return item.asset;
        });
    }

    /**
     * Asset dragstart event callback.
     *
     * @private
     * @param {Event} evt The event object.
     */
    onAssetDragStart(evt) {
        const el = new Dom(evt.target);
        const asset_id = el.data('id');
        const item = this.asset_items[asset_id];
        const asset = item.asset;
        const figure = item.figure;

        el.addClass('dragging');

        evt.dataTransfer.effectAllowed = 'copy';

        evt.dataTransfer.setData('metascore/asset', JSON.stringify(asset));
        evt.dataTransfer.setData('text/uri-list', asset.url);
        evt.dataTransfer.setData('text/plain', asset.url);

        let file = asset;
        if ('shared' in asset && asset.shared) {
            file = asset.file;
        }
        if (/^image\/.*/.test(file.mimetype)) {
            evt.dataTransfer.setData('text/html', `<img src="${file.url}" />`);
            if ('width' in file && 'height' in file) {
                evt.dataTransfer.setData('text/html', `<img src="${file.url}" width="${file.width}" height="${file.height}" />`);
            }
            else {
                evt.dataTransfer.setData('text/html', `<img src="${file.url}" />`);
            }
        }

        this._asset_drag_ghost = new Dom(figure.get(0).cloneNode(true))
            .addClass(assetDragGhostClassName)
            .appendTo('body');

        evt.dataTransfer.setDragImage(this._asset_drag_ghost.get(0), 0, 0);
    }

    /**
     * Asset dragend event callback.
     *
     * @private
     * @param {Event} evt The event object.
     */
    onAssetDragEnd(evt) {
        const el = new Dom(evt.target);
        el.removeClass('dragging');

        this._asset_drag_ghost.remove();
        delete this._asset_drag_ghost;
    }

    /**
     * Asset button click event callback.
     *
     * @private
     * @param {Event} evt The event object.
     */
    onAssetButtonClick(evt) {
        const button = new Dom(evt.target);
        const action = button.data('action');

        const el = new Dom(evt.currentTarget);
        const asset_id = el.data('id');
        const item = this.asset_items[asset_id];
        const asset = item.asset;

        switch (action) {
            case 'delete':
                if (this.triggerEvent('beforeassetremove', { 'asset': asset })) {
                    new Confirm({
                        'parent': this,
                        'text': Locale.t('editor.assetbrowser.GuideAssets.onAssetButtonClick.delete.text', 'Are you sure you want to delete <em>@name</em>?', { '@name': escapeHTML(asset.name) }),
                        'confirmLabel': Locale.t('editor.assetbrowser.GuideAssets.onAssetButtonClick.delete.confirmLabel', 'Delete'),
                        'onConfirm': () => {
                            this.removeAsset(asset_id);
                        }
                    });
                }
                break;
        }
    }

    /**
     * XHR error event callback.
     *
     * @private
     * @param {LoadMask} loadmask The loadmask.
     * @param {Event} evt The event object.
     */
    onXHRError(loadmask, evt) {
        loadmask.hide();

        const response = evt.target.getResponse();
        const error = response && 'message' in response ? response.message : evt.target.getStatusText();
        const code = evt.target.getStatus();

        new Overlay({
            'text': Locale.t('editor.assetbrowser.GuideAssets.onXHRError.msg', 'The following error occured:<br/><strong><em>@error</em></strong><br/>Please try again.', { '@error': error, '@code': code }),
            'buttons': {
                'ok': Locale.t('editor.assetbrowser.GuideAssets.onXHRError.ok', 'OK'),
            },
            'parent': this
        });
    }

    /**
     * Button click event callback.
     *
     * @private
     * @param {Event} evt The event object.
     */
    onButtonClick(evt) {
        const action = Dom.data(evt.target, 'action');

        switch(action){
            case 'spectrogram':
                if (!this.spectrogram_form) {
                    /**
                     * The spectrogram form overlay
                     * @type {SpectrogramForm}
                     */
                    this.spectrogram_form = new SpectrogramForm(this.configs.spectrogram_form.url, Object.assign({
                        'autoShow': false,
                        'parent': this.editor,
                        'xhr': this.configs.xhr
                    }, this.configs.spectrogram_form.configs))
                        .addListener('generate', this.onSpectrogramFormGenerate.bind(this));
                }

                this.spectrogram_form.show();
                this.triggerEvent('spectrogramformopen', { 'form': this.spectrogram_form });
                break;

            case 'audiowaveform':
                if (!this.audiowaveform_form) {
                    /**
                     * The audiowaveform form overlay
                     * @type {AudioWaveformForm}
                     */
                    this.audiowaveform_form = new AudioWaveformForm(this.configs.audiowaveform_form.url, Object.assign({
                        'autoShow': false,
                        'parent': this.editor,
                        'xhr': this.configs.xhr
                    }, this.configs.audiowaveform_form.configs))
                        .addListener('generate', this.onAudioWaveformFormGenerate.bind(this));
                }

                this.audiowaveform_form.show();
                this.triggerEvent('audiowaveformformopen', { 'form': this.audiowaveform_form });
                break;
        }
    }

    /**
     * SpectrogramForm generate event callback.
     *
     * @private
     * @param {Event} evt The event object.
     */
    onSpectrogramFormGenerate(evt) {
        const form = evt.detail.form;
        const asset = evt.detail.asset;

        this.addAsset(asset);

        History.add({
            'undo': () => {
                this.removeAsset(asset.id);
            },
            'redo': () => {
                this.addAsset(asset);
            }
        });

        this.editor.setDirty('assets');

        form.hide();
    }

    /**
     * AudioWaveformForm generate event callback.
     *
     * @private
     * @param {Event} evt The event object.
     */
    onAudioWaveformFormGenerate(evt) {
        const form = evt.detail.form;
        const asset = evt.detail.asset;

        this.addAsset(asset);

        History.add({
            'undo': () => {
                this.removeAsset(asset.id);
            },
            'redo': () => {
                this.addAsset(asset);
            }
        });

        this.editor.setDirty('assets');

        form.hide();
    }
}
