import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Ajax from '../../core/Ajax';
import Button from '../../core/ui/Button';
import Icon from '../../core/ui/Icon';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Overlay from '../../core/ui/Overlay';
import Confirm from '../../core/ui/overlay/Confirm';
import FileInput from '../../core/ui/input/FileInput';
import Field from  '../Field';
import SpectrogramForm from './guideassets/SpectrogramForm';
import {isValidMimeType} from '../../core/utils/Media';

import import_icon from '../../../img/editor/assetbrowser/guideassets/import.svg?svg-sprite';
import delete_icon from '../../../img/editor/assetbrowser/guideassets/delete.svg?svg-sprite';
import spectrogram_icon from '../../../img/editor/assetbrowser/guideassets/spectrogram.svg?svg-sprite';
import image_icon from '../../../img/editor/assetbrowser/guideassets/image.svg?svg-sprite';
import audio_icon from '../../../img/editor/assetbrowser/guideassets/audio.svg?svg-sprite';
import video_icon from '../../../img/editor/assetbrowser/guideassets/video.svg?svg-sprite';

import {className, assetDragGhostClassName} from '../../../css/editor/assetbrowser/GuideAssets.scss';

/**
 * A guide assets browser class
 */
export default class GuideAssets extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} list_url The assets list url
     * @property {Object} import_url The asset import url
     * @property {Object} [xhr={}] Options to send with each XHR request. See {@link Ajax.send} for available options
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `guide-assets ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The list of loaded assets
         * @type {Object}
         */
        this.assets = {};

        // fix event handlers scope
        this.onAssetDragStart = this.onAssetDragStart.bind(this);
        this.onAssetDragEnd = this.onAssetDragEnd.bind(this);
        this.onAssetButtonClick = this.onAssetButtonClick.bind(this);

        this.assets_container = new Dom('<div/>', {'class': 'assets-container'})
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

        new Icon({'symbol': import_icon})
            .appendTo(import_field.getLabel());

        new Button({
                'icon': spectrogram_icon,
                'label': Locale.t('editor.assetbrowser.GuideAssets.spectrogram-button.label', 'Create spectrogram image')
            })
            .data('action', 'spectrogram')
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this);

        this
            .addListener('dragover', this.onDragOver.bind(this))
            .addListener('dragleave', this.onDragLeave.bind(this))
            .addListener('drop', this.onDrop.bind(this));
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'import': {
                'url': null,
                'max_filesize': null,
                'allowed_types': null,
            },
            'spectrogram_form': {
                'url': null,
                'configs': {}
            },
            'xhr': {}
        };
    }

    onAssetImportFieldVlueChange(evt){
        this.importAssets(evt.detail.files);
    }

    getDraggedFiles(dataTransfer){
        let files = [];

        // Use DataTransfer interface to access the file(s)
        if(dataTransfer.files && dataTransfer.files.length > 0){
            files = dataTransfer.files;
        }
        else if(dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < dataTransfer.items.length; i++) {
                if(dataTransfer.items[i].kind === 'file') {
                    files.push(dataTransfer.items[i].getAsFile());
                }
            }
        }

        return files;
    }

    onDragOver(evt){
        const files = this.getDraggedFiles(evt.dataTransfer);
        if(files.length > 0){
            this.addClass('droppable');
            evt.preventDefault();
        }
    }

    onDragLeave(){
        this.removeClass('droppable');
    }

    onDrop(evt){
        const files = this.getDraggedFiles(evt.dataTransfer);
        this.importAssets(files);

        this.removeClass('droppable');

        evt.preventDefault();
        evt.stopPropagation();
    }

    importAssets(files){
        if(files.length === 0){
            return;
        }

        const formdata = new FormData();

        for(let i=0; i<files.length; i++){
            const file = files.item(i);

            if(this.configs.import.allowed_types && !isValidMimeType(file.type, this.configs.import.allowed_types)){
                new Overlay({
                    'parent': this,
                    'text': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid_type.msg', '<em>@name</em> is not an accepted file type.', {'@name': file.name}),
                    'buttons': {
                        'ok': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid.ok', 'OK'),
                    }
                });
                return;
            }

            if(this.configs.import.max_filesize && file.size > this.configs.import.max_filesize){
                new Overlay({
                    'parent': this,
                    'text': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid_size.msg', '<em>@name</em> size (@filesize) exceeds the allowed size (@maxsize).', {'@name': file.name, '@filesize': file.size, '@maxsize': this.configs.import.max_filesize}),
                    'buttons': {
                        'ok': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid.ok', 'OK'),
                    }
                });
                return;
            }

            formdata.append(`files[asset][]`, file);
        }

        // add a loading mask
        const loadmask = new LoadMask({
            'parent': '.metaScore-editor',
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

    onAssetsImportSuccess(loadmask, evt){
        this.addAssets(evt.target.getResponse());

        loadmask.hide();
    }

    /**
     * Add assets
     *
     * @param {Array} assets The assets to add
     * @param {Boolean} supressEvent Whether to prevent the assetadd event from firing
     * @return {this}
     */
    addAssets(assets, supressEvent){
        assets.forEach((asset) => {
            this.addAsset(asset, supressEvent);
        });

        return this;
    }

    /**
     * Add an asset
     *
     * @param {Object} asset The asset to add
     * @param {Boolean} supressEvent Whether to prevent the assetadd event from firing
     * @return {this}
     */
    addAsset(asset, supressEvent){
        const item = new Dom('<div/>', {'class': 'asset'})
            .attr('draggable', 'true')
            .data('id', asset.id)
            .addListener('dragstart', this.onAssetDragStart)
            .addListener('dragend', this.onAssetDragEnd)
            .addDelegate('button', 'click', this.onAssetButtonClick)
            .appendTo(this.assets_container);

        this.assets[asset.id] = asset;

        const figure = new Dom('<figure/>')
            .appendTo(item);

        let file = asset;
        if('shared' in asset && asset.shared){
            file = asset.file;
        }

        const matches = /^(image|audio|video)\/.*/.exec(file.mimetype);
        if(matches){
            const type = matches[1];
            switch(type){
                case 'image':
                    new Dom('<img/>', {'src': file.url}).appendTo(figure);
                    break;

                case 'audio':
                    new Icon({'symbol': audio_icon}).appendTo(figure);
                    break;

                case 'video':
                    new Icon({'symbol': video_icon}).appendTo(figure);
                    break;
            }
        }
        else{
            new Icon({'symbol': image_icon}).appendTo(figure);
        }

        new Dom('<div/>', {'class': 'label', 'text': asset.name, 'title': asset.name})
            .appendTo(item);

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(item);

        new Button({'icon': delete_icon})
            .attr('title', Locale.t('editor.assetbrowser.GuideAssets.AssetDeleteButton.label', 'Delete'))
            .data('action', 'delete')
            .appendTo(buttons);

        if(supressEvent !== true){
            this.triggerEvent('assetadd', {'asset': asset});
        }

        return this;
    }

    /**
     * Remove an asset
     *
     * @param {Object} asset The asset to remove
     * @param {Boolean} supressEvent Whether to prevent the assetremove event from firing
     * @return {this}
     */
    removeAsset(asset, supressEvent){
        const item = this.assets_container.find(`.asset[data-id="${asset.id}"]`);
        item.remove();

        delete this.assets[asset.id];

        if(supressEvent !== true){
            this.triggerEvent('assetremove', {'asset': asset});
        }

        return this;
    }

    clearAssets(){
        this.assets = {};
        this.assets_container.empty();

        return this;
    }

    getAsset(id){
        return this.assets[id];
    }

    getAssets(){
        return this.assets;
    }

    onAssetDragStart(evt){
        const item = new Dom(evt.target);
        const asset_id = item.data('id');
        const asset = this.getAsset(asset_id);

        item.addClass('dragging');

        evt.dataTransfer.effectAllowed = 'copy';

        evt.dataTransfer.setData('metascore/asset', JSON.stringify(asset));
        evt.dataTransfer.setData('text/uri-list', asset.url);
        evt.dataTransfer.setData('text/plain', asset.url);

        let file = asset;
        if('shared' in asset && asset.shared){
            file = asset.file;
        }
        if(/^image\/.*/.test(file.mimetype)){
            evt.dataTransfer.setData('text/html', `<img src="${asset.url}" />`);
        }

        this._asset_drag_ghost = new Dom(item.child('figure').get(0).cloneNode(true))
            .addClass(assetDragGhostClassName)
            .appendTo('body');

        evt.dataTransfer.setDragImage(this._asset_drag_ghost.get(0), 0, 0);
    }

    onAssetDragEnd(evt){
        const item = new Dom(evt.target);
        item.removeClass('dragging');

        this._asset_drag_ghost.remove();
        delete this._asset_drag_ghost;
    }

    onAssetButtonClick(evt){
        const button = new Dom(evt.target);
        const action = button.data('action');

        const item = new Dom(evt.currentTarget);
        const asset_id = item.data('id');
        const asset = this.getAsset(asset_id);

        switch(action){
            case 'delete':
                new Confirm({
                    'parent': this,
                    'text': Locale.t('editor.assetbrowser.GuideAssets.onAssetButtonClick.delete.text', 'Are you sure you want to delete <em>@name</em>?', {'@name': asset.name}),
                    'confirmLabel': Locale.t('editor.assetbrowser.GuideAssets.onAssetButtonClick.delete.confirmLabel', 'Delete'),
                    'onConfirm': () => {
                        this.removeAsset(asset);
                    }
                });
                break;
        }
    }

    onXHRError(loadmask, evt){
        loadmask.hide();

        const response = evt.target.getResponse();
        const error = response && 'message' in response ? response.message : evt.target.getStatusText();
        const code = evt.target.getStatus();

        new Overlay({
            'parent': this,
            'text': Locale.t('editor.assetbrowser.GuideAssets.onXHRError.msg', 'The following error occured:<br/><strong><em>@error</em></strong><br/>Please try again.', {'@error': error, '@code': code}),
            'buttons': {
                'ok': Locale.t('editor.assetbrowser.GuideAssets.onXHRError.ok', 'OK'),
            }
        });
    }

    onButtonClick(evt){
        const action = Dom.data(evt.target, 'action');

        switch(action){
            case 'spectrogram':
                {
                    const form = new SpectrogramForm(this.configs.spectrogram_form.url, Object.assign({
                            'parent': '.metaScore-editor',
                            'xhr': this.configs.xhr
                        }, this.configs.spectrogram_form.configs));

                    form.addListener('generate', this.onSpectrogramFormGenerate.bind(this));

                    this.triggerEvent('spectrogramformopen', {'form': form});
                }
                break;
        }
    }

    onSpectrogramFormGenerate(evt){
        const asset = evt.detail.asset;
        this.addAsset(asset);

        const form = evt.detail.form;
        form.hide();
    }
}
