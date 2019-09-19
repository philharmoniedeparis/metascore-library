import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Ajax from '../../core/Ajax';
import Button from '../../core/ui/Button';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Alert from '../../core/ui/overlay/Alert';
import Field from  '../Field';

import {className} from '../../../css/editor/assetbrowser/GuideAssets.scss';

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

        this.assets = {};

        // fix event handlers scope
        this.onAssetDragStart = this.onAssetDragStart.bind(this);
        this.onAssetDragEnd = this.onAssetDragEnd.bind(this);
        this.onAssetButtonClick = this.onAssetButtonClick.bind(this);

        new Field({
                'type': 'file',
                'label': Locale.t('editor.assetbrowser.GuideAssets.import-assets-field.label', 'Import files'),
                'input': {
                    'multiple': true,
                    'accept': null
                }
            })
            .addClass('import-assets')
            .addListener('valuechange', this.onAssetImportFieldVlueChange.bind(this))
            .appendTo(this);

        this.assets_container = new Dom('<div/>', {'class': 'assets-container'})
            .appendTo(this);

        this
            .addListener('dragenter', this.onDragEnter.bind(this))
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
            'list_url': null,
            'import_url': null,
            'allowed_types': null,
            'xhr': {}
        };
    }

    getDropFiles(dataTransfer){
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

    onDragEnter(evt){
        const files = this.getDropFiles(evt.dataTransfer);
        if(files.length > 0){
            this.addClass('droppable');
        }
    }

    onDragOver(evt){
        const files = this.getDropFiles(evt.dataTransfer);
        if(files.length > 0){
            evt.preventDefault();
        }
    }

    onDragLeave(){
        this.removeClass('droppable');
    }

    onDrop(evt){
        const files = this.getDropFiles(evt.dataTransfer);
        this.importAssets(files);

        evt.preventDefault();
        evt.stopPropagation();
    }

    onAssetImportFieldVlueChange(evt){
        this.importAssets(evt.detail.files);
    }

    importAssets(files){
        if(files.length === 0){
            return;
        }

        const formdata = new FormData();
        for(let i=0; i<files.length; i++){
            formdata.append(`files[asset][]`, files.item(i));
        }

        // add a loading mask
        const loadmask = new LoadMask({
            'parent': this,
            'text': Locale.t('editor.assetbrowser.GuideAssets.importAssets.loadmask.text', 'Uploading...'),
            'bar': true,
            'autoShow': true
        });

        // prepare the Ajax options object
        const options = Object.assign({
            'data': formdata,
            'responseType': 'json',
            'onSuccess': this.onAssetsImportSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask),
            'autoSend': false
        }, this.configs.xhr);

        const hundred = 100;
        Ajax.POST(this.configs.import_url, options)
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

        return this;
    }

    onAssetsImportSuccess(loadmask, evt){
        const assets = evt.target.getResponse();

        assets.forEach((asset) => {
            this.addAsset(asset);
        });

        loadmask.hide();
    }

    deleteAsset(asset){
        // add a loading mask
        const loadmask = new LoadMask({
            'parent': this.assets_container,
            'text': Locale.t('editor.assetbrowser.GuideAssets.deleteAsset.loadmask.text', 'Deleting...'),
            'autoShow': true,
        });

        // prepare the Ajax options object
        const options = Object.assign({
            'responseType': 'json',
            'onSuccess': this.onAssetDeleteSuccess.bind(this, asset, loadmask),
            'onError': this.onXHRError.bind(this, loadmask)
        }, this.configs.xhr);

        Ajax.DELETE(asset.links.delete, options);
    }

    onAssetDeleteSuccess(asset, loadmask){
        const item = this.assets_container.find(`.asset[data-id="${asset.id}"]`);
        item.remove();

        delete this.assets[asset.id];

        loadmask.hide();
    }

    onXHRError(loadmask, evt){
        loadmask.hide();

        const error = evt.target.getStatusText();
        const code = evt.target.getStatus();

        new Alert({
            'parent': this,
            'text': Locale.t('editor.assetbrowser.GuideAssets.onXHRError.msg', 'The following error occured:<br/><strong><em>@code @error</em></strong><br/>Please try again.', {'@error': error, '@code': code}),
            'buttons': {
                'ok': Locale.t('editor.assetbrowser.GuideAssets.onXHRError.ok', 'OK'),
            },
            'autoShow': true
        });
    }

    loadAssets(){
        delete this._assets_loaded;

        // add a loading mask
        const loadmask = new LoadMask({
            'parent': this.assets_container,
            'text': Locale.t('editor.assetbrowser.GuideAssets.loadAssets.loadmask.text', 'Loading...'),
            'autoShow': true,
        });

        // prepare the Ajax options object
        const options = Object.assign({
            'responseType': 'json',
            'onSuccess': this.onAssetsLoadSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask)
        }, this.configs.xhr);

        Ajax.GET(this.configs.list_url, options);
    }

    onAssetsLoadSuccess(loadmask, evt){
        const response = evt.target.getResponse();

        response.assets.forEach((asset) => {
            this.addAsset(asset);
        });

        this._assets_loaded = true;

        loadmask.hide();
    }

    addAsset(asset){
        const item = new Dom('<div/>', {'class': 'asset'})
            .data('id', asset.id)
            .addDelegate('button', 'click', this.onAssetButtonClick)
            .appendTo(this.assets_container);

        this.assets[asset.id] = asset;

        new Dom('<div/>', {'class': 'label'})
            .text(asset.name)
            .attr('draggable', 'true')
            .addListener('dragstart', this.onAssetDragStart)
            .addListener('dragend', this.onAssetDragEnd)
            .appendTo(item);

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(item);

        new Button({'icon': 'delete', 'label': Locale.t('editor.assetbrowser.GuideAssets.AssetDeleteButton.label', 'Delete')})
            .data('action', 'delete')
            .appendTo(buttons);
    }

    onAssetDragStart(evt){
        const item = new Dom(evt.target).parents('.asset');
        const asset_id = item.data('id');
        const asset = this.assets[asset_id];

        item.addClass('dragging');

        evt.dataTransfer.effectAllowed = 'copy';

        evt.dataTransfer.setData('metascore/asset', JSON.stringify(asset));
        evt.dataTransfer.setData("text/uri-list", asset.url);
        evt.dataTransfer.setData("text/plain", asset.url);

        if(/^image\/.*/.test(asset.mimetype)){
            const img = new Dom('<img/>', {'src': asset.url});
            console.log(img.get(0).outerHTML);
            evt.dataTransfer.setData('text/html', img.get(0).outerHTML);
        }
    }

    onAssetDragEnd(evt){
        const item = new Dom(evt.target).parents('.asset');
        item.removeClass('dragging');
    }

    onAssetButtonClick(evt){
        const button = new Dom(evt.target);
        const action = button.data('action');

        const item = new Dom(evt.currentTarget);
        const asset_id = item.data('id');
        const asset = this.assets[asset_id];

        switch(action){
            case 'delete':
                this.deleteAsset(asset);
                break;
        }
    }

    show(){
        super.show();

        if(!this._assets_loaded){
            this.loadAssets();
        }
    }

}
