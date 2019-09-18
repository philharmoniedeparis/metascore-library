import Dom from '../core/Dom';
import Locale from '../core/Locale';
import Ajax from '../core/Ajax';
import LoadMask from '../core/ui/overlay/LoadMask';
import Alert from '../core/ui/overlay/Alert';
import Button from '../core/ui/Button';
import DragNDrop from '../core/ui/DragNDrop';
import Field from  './Field';

import {className} from '../../css/editor/AssetBrowser.scss';

/**
 * An asset browser class
 */
export default class AssetBrowser extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} guide_assets Options for the guide assets tab
     * @property {Object} guide_assets.list_url The guide assets list url
     * @property {Object} shared_assets Options for the shared assets tab
     * @property {Object} shared_assets.list_url The shared assets list url
     * @property {Object} [xhr={}] Options to send with each XHR request. See {@link Ajax.send} for available options
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `asset-browser ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.tabs = new Dom('<div/>', {'class': 'tabs'})
            .appendTo(this);

        // Guide assets ////////////////////////
        new Button({'label': Locale.t('editor.AssetBrowser.tabs.guide-assets.title', 'Library')})
            .data('for', 'guide-assets')
            .addListener('click', this.showGuideAssets.bind(this))
            .appendTo(this.tabs);

        this.guide_assets = new Dom('<div/>', {'id': 'guide-assets'})
            .appendTo(this);

        new Field({
                'type': 'file',
                'label': Locale.t('editor.AssetBrowser.import-asset-field.label', 'Import a file'),
                'input': {
                    'accept': null
                }
            })
            .addClass('import-asset')
            .addListener('valuechange', this.onGuideAssetImportFieldVlueChange.bind(this))
            .appendTo(this.guide_assets);

        new Dom('<div/>', {'class': 'assets-container'})
            .appendTo(this.guide_assets);

        new Button({'label': Locale.t('editor.AssetBrowser.create-sync-block.label', 'Create a synched block')})
            .data('action', 'create-sync-block')
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this.guide_assets);

        new Button({'label': Locale.t('editor.AssetBrowser.create-nonsync-block.label', 'Create a non-synched block')})
            .data('action', 'create-nonsync-block')
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this.guide_assets);

        new Button({'label': Locale.t('editor.AssetBrowser.create-nonsync-block.label', 'Create a non-synched block')})
            .data('action', 'create-nonsync-block')
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this.guide_assets);

        new Button({'label': Locale.t('editor.AssetBrowser.create-cursor-element.label', 'Create a cursor element')})
            .data('action', 'create-cursor-element')
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this.guide_assets);

        new Button({'label': Locale.t('editor.AssetBrowser.create-text-element.label', 'Create a text element')})
            .data('action', 'create-text-element')
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this.guide_assets);

        new Button({'label': Locale.t('editor.AssetBrowser.create-animation-element.label', 'Create a animation element')})
            .data('action', 'create-animation-element')
            .addListener('click', this.onButtonClick.bind(this))
            .appendTo(this.guide_assets);

        const create_animation_btn = new Dom('<div/>')
            .text("test drag'n'drop")
            .appendTo(this.guide_assets);

        const dragndrop = new DragNDrop({'target': create_animation_btn});
        dragndrop.addDropTarget(this.tabs);

        // Shared assets ////////////////////////
        new Button({'label': Locale.t('editor.AssetBrowser.tabs.shared-assets.title', 'Shared Library')})
            .data('for', 'shared-assets')
            .addListener('click', this.showSharedAssets.bind(this))
            .appendTo(this.tabs);

        this.shared_assets = new Dom('<div/>', {'id': 'shared-assets'})
            .appendTo(this);

        this.showGuideAssets();
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'guide_assets': {
                'list_url': null,
                'import_url': null,
            },
            'shared_assets': {
                'list_url': null,
            },
            'xhr': {}
        };
    }

    onGuideAssetImportFieldVlueChange(evt){
        const file = evt.detail.files[0];
        if(file){
            this.importGuideAsset(file);
        }
    }

    onButtonClick(evt){
        console.log(evt);
    }

    importGuideAsset(file){
        const formdata = new FormData();
        formdata.append(`files[file]`, file);

        // add a loading mask
        const loadmask = new LoadMask({
            'parent': this,
            'text': Locale.t('editor.AssetBrowser.ImportAssetField.LoadMask.text', 'Uploading...'),
            'bar': true,
            'autoShow': true
        });

        // prepare the Ajax options object
        const options = Object.assign({
            'data': formdata,
            'responseType': 'json',
            'onSuccess': this.onGuideAssetImportSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask),
            'autoSend': false
        }, this.configs.xhr);

        const hundred = 100;
        Ajax.POST(`${this.configs.guide_assets.import_url}`, options)
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

    onGuideAssetImportSuccess(loadmask, evt){
        const asset = evt.target.getResponse();
        this.addGuideAsset(asset);

        loadmask.hide();
    }

    onXHRError(loadmask, evt){
        loadmask.hide();

        const error = evt.target.getStatusText();
        const code = evt.target.getStatus();

        new Alert({
            'parent': this,
            'text': Locale.t('editor.AssetBrowser.onXHRError.msg', 'The following error occured:<br/><strong><em>@code @error</em></strong><br/>Please try again.', {'@error': error, '@code': code}),
            'buttons': {
                'ok': Locale.t('editor.AssetBrowser.onXHRError.ok', 'OK'),
            },
            'autoShow': true
        });
    }

    showGuideAssets(){
        this.tabs.children('button').forEach((el) => {
            const button = new Dom(el);
            button.toggleClass('active', button.data('for') === 'guide-assets');
        });

        this.guide_assets.show();
        this.shared_assets.hide();

        if(!this.guide_assets._loaded){
            this.loadGuideAsset();
        }
    }

    showSharedAssets(){
        this.tabs.children('button').forEach((el) => {
            const button = new Dom(el);
            button.toggleClass('active', button.data('for') === 'shared-assets');
        });

        this.guide_assets.hide();
        this.shared_assets.show();
    }

    loadGuideAsset(){
        // add a loading mask
        const loadmask = new LoadMask({
            'parent': this.guide_assets.child('.assets-container'),
            'text': Locale.t('editor.AssetBrowser.LoadMask.text', 'Loading...'),
            'autoShow': true,
        });

        // prepare the Ajax options object
        const options = Object.assign({
            'responseType': 'json',
            'onSuccess': this.onGuideAssetsLoadSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask)
        }, this.configs.xhr);

        delete this.guide_assets._loaded;

        Ajax.GET(this.configs.guide_assets.list_url, options);
    }

    onGuideAssetsLoadSuccess(loadmask, evt){
        const response = evt.target.getResponse();

        response.assets.forEach((asset) => {
            for(let i=0; i<20; i++){
                this.addGuideAsset(asset);
            }
        });

        this.guide_assets._loaded = true;

        loadmask.hide();
    }

    addGuideAsset(asset){
        const container = this.guide_assets.child('.assets-container');

        const item = new Dom('<div/>', {'class': 'asset'})
            .appendTo(container);

        new Dom('<div/>', {'class': 'label'})
            .text(asset.name)
            .appendTo(item);
    }

}
