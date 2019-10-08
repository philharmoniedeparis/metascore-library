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
import {isValidMimeType} from '../../core/utils/Media';

import import_icon from '../../../img/editor/assetbrowser/guideassets/import.svg?sprite';
import delete_icon from '../../../img/editor/assetbrowser/guideassets/delete.svg?sprite';
import asset_icon from '../../../img/editor/assetbrowser/guideassets/asset.svg?sprite';
import synched_block_icon from '../../../img/editor/assetbrowser/guideassets/synched-block.svg?sprite';
import non_synched_block_icon from '../../../img/editor/assetbrowser/guideassets/non-synched-block.svg?sprite';
import page_icon from '../../../img/editor/assetbrowser/guideassets/page.svg?sprite';
import content_element_icon from '../../../img/editor/assetbrowser/guideassets/content-element.svg?sprite';
import cursor_element_icon from '../../../img/editor/assetbrowser/guideassets/cursor-element.svg?sprite';
import {className, dragImgClassName} from '../../../css/editor/assetbrowser/GuideAssets.scss';

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

        this.assets_container = new Dom('<div/>', {'class': 'assets-container'})
            .appendTo(this);

        const synched_block_link = new Dom('<a/>', {'class': 'component-link'})
            .text(Locale.t('editor.AssetBrowser.create-synced-block.text', 'Create a synched block'))
            .attr('draggable', 'true')
            .data('action', 'create-synced-block')
            .appendTo(this);

        new Icon({'symbol': synched_block_icon})
            .appendTo(synched_block_link);

        const non_synched_block_link = new Dom('<a/>', {'class': 'component-link'})
            .text(Locale.t('editor.AssetBrowser.create-non-synced-block.text', 'Create a non-synched block'))
            .attr('draggable', 'true')
            .data('action', 'create-non-synced-block')
            .appendTo(this);

        new Icon({'symbol': non_synched_block_icon})
            .appendTo(non_synched_block_link);

        const page_link = new Dom('<a/>', {'class': 'component-link'})
            .text(Locale.t('editor.AssetBrowser.create-page.text', 'Create a page'))
            .attr('draggable', 'true')
            .data('action', 'create-page')
            .appendTo(this);

        new Icon({'symbol': page_icon})
            .appendTo(page_link);

        const cursor_element_link = new Dom('<a/>', {'class': 'component-link'})
            .text(Locale.t('editor.AssetBrowser.create-cursor-element.text', 'Create a cursor element'))
            .attr('draggable', 'true')
            .data('action', 'create-cursor-element')
            .appendTo(this);

        new Icon({'symbol': cursor_element_icon})
            .appendTo(cursor_element_link);

        const content_element_link = new Dom('<a/>', {'class': 'component-link'})
            .text(Locale.t('editor.AssetBrowser.create-content-element.text', 'Create a content element'))
            .attr('draggable', 'true')
            .data('action', 'create-content-element')
            .appendTo(this);

        new Icon({'symbol': content_element_icon})
            .appendTo(content_element_link);

        this
            .addDelegate('a.component-link', 'click', this.onComponentLinkClick.bind(this))
            .addDelegate('a.component-link', 'dragstart', this.onComponentLinkDragStart.bind(this))
            .addDelegate('a.component-link', 'dragend', this.onComponentLinkDragEnd.bind(this))
            .addListener('dragover', this.onDragOver.bind(this))
            .addListener('dragleave', this.onDragLeave.bind(this))
            .addListener('drop', this.onDrop.bind(this));

        this.clearAssets();
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
            'xhr': {}
        };
    }

    onAssetImportFieldVlueChange(evt){
        this.importAssets(evt.detail.files);
    }

    onComponentLinkClick(evt){
        const link = new Dom(evt.target);
        const data = this.getComponentDataForLink(link);

        this.triggerEvent('componentlinkclick', {'component': data});
    }

    onComponentLinkDragStart(evt){
        const link = new Dom(evt.target);
        const data = this.getComponentDataForLink(link);

        if(data){
            link.addClass('dragging');
            evt.dataTransfer.effectAllowed = 'copy';
            evt.dataTransfer.setData('metascore/component', JSON.stringify(data));

            this._drag_img = new Dom(link.child('.icon').get(0).cloneNode(true))
                .addClass(dragImgClassName)
                .appendTo('body');

            evt.dataTransfer.setDragImage(this._drag_img.get(0), 0, 0);
        }
    }

    onComponentLinkDragEnd(evt){
        const link = new Dom(evt.target);
        link.removeClass('dragging');

        this._drag_img.remove();
        delete this._drag_img;
    }

    getComponentDataForLink(link){
        const action =  link.data('action');

        switch(action){
            case 'create-synced-block':
                return {'type': 'block', 'configs': {'type': 'Block', 'synched': true}};
            case 'create-non-synced-block':
                return {'type': 'block', 'configs': {'type': 'Block', 'synched': false}};
            case 'create-page':
                return {'type': 'page', 'configs': {'position': 'before'}};
            case 'create-cursor-element':
                return {'type': 'element', 'configs': {'type': 'Cursor'}};
            case 'create-content-element':
                return {'type': 'element', 'configs': {'type': 'Content'}};
        }
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
                    },
                    'autoShow': true
                });
                return;
            }

            if(this.configs.import.max_filesize && file.size > this.configs.import.max_filesize){
                new Overlay({
                    'parent': this,
                    'text': Locale.t('editor.assetbrowser.GuideAssets.onDrop.invalid_size.msg', '<em>@name</em> size (@filesize) exceeds the allowed size (@maxsize).', {'@name': file.name, '@filesize': file.size, '@maxsize': this.configs.import.max_filesize}),
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

        return this;
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

        if(/^image\/.*/.test(asset.mimetype)){
            new Dom('<img/>', {'src': asset.url})
                .appendTo(figure);
        }
        else{
            new Icon({'symbol': asset_icon})
                .appendTo(figure);
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
        evt.dataTransfer.setData("text/uri-list", asset.url);
        evt.dataTransfer.setData("text/plain", asset.url);

        this._drag_img = new Dom(item.child('figure').get(0).cloneNode(true))
            .addClass(dragImgClassName)
            .appendTo('body');

        evt.dataTransfer.setDragImage(this._drag_img.get(0), 0, 0);
    }

    onAssetDragEnd(evt){
        const item = new Dom(evt.target);
        item.removeClass('dragging');

        this._drag_img.remove();
        delete this._drag_img;
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
                    'text': Locale.t('editor.assetbrowser.GuideAssets.onAssetButtonClick.delete.msg', 'Are you sure you want to delete <em>@name</em>?', {'@name': asset.name}),
                    'autoShow': true,
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
        const error = 'message' in response ? response.message : evt.target.getStatusText();
        const code = evt.target.getStatus();

        new Overlay({
            'parent': this,
            'text': Locale.t('editor.assetbrowser.GuideAssets.onXHRError.msg', 'The following error occured:<br/><strong><em>@error</em></strong><br/>Please try again.', {'@error': error, '@code': code}),
            'buttons': {
                'ok': Locale.t('editor.assetbrowser.GuideAssets.onXHRError.ok', 'OK'),
            },
            'autoShow': true
        });
    }

}
