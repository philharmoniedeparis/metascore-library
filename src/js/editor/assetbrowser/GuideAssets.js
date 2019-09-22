import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Ajax from '../../core/Ajax';
import Button from '../../core/ui/Button';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Alert from '../../core/ui/overlay/Alert';
import Confirm from '../../core/ui/overlay/Confirm';
import Field from  '../Field';
import {isValidMimeType} from '../../core/utils/Media';

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

        // fix event handlers scope
        this.onAssetDragStart = this.onAssetDragStart.bind(this);
        this.onAssetDragEnd = this.onAssetDragEnd.bind(this);
        this.onAssetButtonClick = this.onAssetButtonClick.bind(this);

        new Field({
                'type': 'file',
                'label': Locale.t('editor.assetbrowser.GuideAssets.import-assets-field.label', 'Import files'),
                'input': {
                    'multiple': true,
                    'accept': this.configs.allowed_import_types
                }
            })
            .addClass('import-assets')
            .addListener('valuechange', this.onAssetImportFieldVlueChange.bind(this))
            .appendTo(this);

        this.assets_container = new Dom('<div/>', {'class': 'assets-container'})
            .appendTo(this);

        new Dom('<a/>', {'class': 'component-link'})
            .text(Locale.t('editor.AssetBrowser.create-sync-block.text', 'Create a synched block'))
            .attr('draggable', 'true')
            .data('action', 'create-sync-block')
            .appendTo(this);

        new Dom('<a/>', {'class': 'component-link'})
            .text(Locale.t('editor.AssetBrowser.create-nonsync-block.text', 'Create a non-synched block'))
            .attr('draggable', 'true')
            .data('action', 'create-nonsync-block')
            .appendTo(this);

        new Dom('<a/>', {'class': 'component-link'})
            .text(Locale.t('editor.AssetBrowser.create-page.text', 'Create a page'))
            .attr('draggable', 'true')
            .data('action', 'create-page')
            .appendTo(this);

        new Dom('<a/>', {'class': 'component-link'})
            .text(Locale.t('editor.AssetBrowser.create-cursor-element.text', 'Create a cursor element'))
            .attr('draggable', 'true')
            .data('action', 'create-cursor-element')
            .appendTo(this);

        new Dom('<a/>', {'class': 'component-link'})
            .text(Locale.t('editor.AssetBrowser.create-text-element.text', 'Create a text element'))
            .attr('draggable', 'true')
            .data('action', 'create-text-element')
            .appendTo(this);

        this
            .addDelegate('a.component-link', 'click', this.onComponentLinkClick.bind(this))
            .addDelegate('a.component-link', 'dragstart', this.onComponentLinkDragStart.bind(this))
            .addDelegate('a.component-link', 'dragend', this.onComponentLinkDragEnd.bind(this))
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
            'max_filesize': null,
            'allowed_import_types': 'image/*,video/*,audio/*',
            'xhr': {}
        };
    }

    onAssetImportFieldVlueChange(evt){
        this.importAssets(evt.detail.files);
    }

    onComponentLinkClick(evt){
        console.log(evt);
    }

    onComponentLinkDragStart(evt){
        const link = new Dom(evt.target);

        const action =  link.data('action');
        let data = null;
        switch(action){
            case 'create-sync-block':
                data = {'type': 'block', 'configs': {'type': 'Block', 'synched': true}};
                break;
            case 'create-nonsync-block':
                data = {'type': 'block', 'configs': {'type': 'Block', 'synched': false}};
                break;
            case 'create-page':
                data = {'type': 'page', 'configs': {'position': 'before'}};
                break;
            case 'create-cursor-element':
                data = {'type': 'element', 'configs': {'type': 'Cursor'}};
                break;
            case 'create-text-element':
                data = {'type': 'element', 'configs': {'type': 'Text'}};
                break;
        }

        if(data){
            link.addClass('dragging');
            evt.dataTransfer.effectAllowed = 'copy';
            evt.dataTransfer.setData('metascore/component', JSON.stringify(data));
        }
    }

    onComponentLinkDragEnd(evt){
        const link = new Dom(evt.target);
        link.removeClass('dragging');
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

    onDragEnter(evt){
        const files = this.getDraggedFiles(evt.dataTransfer);
        if(files.length > 0){
            this.addClass('droppable');
        }
    }

    onDragOver(evt){
        const files = this.getDraggedFiles(evt.dataTransfer);
        if(files.length > 0){
            evt.preventDefault();
        }
    }

    onDragLeave(){
        this.removeClass('droppable');
    }

    onDrop(evt){
        const files = this.getDraggedFiles(evt.dataTransfer);
        this.importAssets(files);

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

            console.log(file);

            if(!isValidMimeType(file.type, this.configs.allowed_import_types)){
                new Alert({
                    'parent': this,
                    'text': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid.msg', '<em>@name</em> is not an accepted file type.', {'@name': file.name}),
                    'buttons': {
                        'ok': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid.ok', 'OK'),
                    },
                    'autoShow': true
                });
                return;
            }

            formdata.append(`files[asset][]`, file);
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
        this.assets_container.empty();
        delete this._assets_loaded;

        /**
         * The list of loaded assets
         * @type {Object}
         */
        this.assets = {};

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

        const info = new Dom('<figure/>', {'class': 'info'})
            .attr('draggable', 'true')
            .addListener('dragstart', this.onAssetDragStart)
            .addListener('dragend', this.onAssetDragEnd)
            .appendTo(item);

        const icon = new Dom('<div/>', {'class': 'icon'})
            .appendTo(info);

        if(/^image\/.*/.test(asset.mimetype)){
            new Dom('<img/>', {'src': asset.url})
                .appendTo(icon);
        }

        new Dom('<div/>', {'class': 'label'})
            .text(asset.name)
            .appendTo(info);

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
                new Confirm({
                    'parent': this,
                    'text': Locale.t('editor.assetbrowser.GuideAssets.onAssetButtonClick.delete.msg', 'Are you sure you want to delete <em>@name</em>?', {'@name': asset.name}),
                    'autoShow': true,
                    'onConfirm': () => {
                        this.deleteAsset(asset);
                    }
                });
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
