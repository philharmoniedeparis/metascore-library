import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Ajax from '../../core/Ajax';
import Button from '../../core/ui/Button';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Alert from '../../core/ui/overlay/Alert';

import {className} from '../../../css/editor/assetbrowser/SharedAssets.scss';

/**
 * An asset browser class
 */
export default class AssetBrowser extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} list_url The shared assets list url
     * @property {Object} [xhr={}] Options to send with each XHR request. See {@link Ajax.send} for available options
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `shared-assets ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        // fix event handlers scope
        this.onAssetButtonClick = this.onAssetButtonClick.bind(this);

        this.assets_container = new Dom('<div/>', {'class': 'assets-container'})
            .appendTo(this);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'list_url': null,
            'xhr': {}
        };
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
            'text': Locale.t('editor.assetbrowser.SharedAssets.loadAssets.loadmask.text', 'Loading...'),
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

        const figure = new Dom('<figure/>', {'class': asset.type})
            .appendTo(item);

        switch(asset.type){
            case 'image':
                new Dom('<img/>', {'src': asset.file.url}).appendTo(figure);
                break;

            case 'lottie_animation':
                break;
        }

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(figure);

        new Button({'label': Locale.t('editor.assetbrowser.SharedAssets.AssetImportButton.label', 'Import')})
            .data('action', 'import')
            .appendTo(buttons);

        new Dom('<div/>', {'class': 'label'})
            .text(asset.name)
            .appendTo(item);
    }

    onAssetButtonClick(evt){
        const button = new Dom(evt.target);
        const action = button.data('action');

        const item = new Dom(evt.currentTarget);
        const asset_id = item.data('id');
        const asset = this.assets[asset_id];

        switch(action){
            case 'import':
                this.importAsset(asset);
                break;
        }
    }

    importAsset(asset){
        // add a loading mask
        const loadmask = new LoadMask({
            'parent': this.assets_container,
            'text': Locale.t('editor.assetbrowser.SharedAssets.importAsset.loadmask.text', 'Importing...'),
            'autoShow': true,
        });

        // prepare the Ajax options object
        const options = Object.assign({}, this.configs.xhr, {
            'responseType': 'json',
            'onSuccess': this.onAssetImportSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask),
            'headers': Object.assign({}, this.configs.xhr.headers, {
                'Content-Type': 'application/json'
            })
        });

        Ajax.POST(asset.links.import, options);
    }

    onAssetImportSuccess(loadmask, evt){
        loadmask.hide();

        const asset = evt.target.getResponse();
        this.triggerEvent('assetimport', {'asset': asset});

    }

    onXHRError(loadmask, evt){
        loadmask.hide();

        const response = evt.target.getResponse();
        const error = 'message' in response ? response.message : evt.target.getStatusText();
        const code = evt.target.getStatus();

        new Alert({
            'parent': this,
            'text': Locale.t('editor.assetbrowser.SharedAssets.onXHRError.msg', 'The following error occured:<br/><strong><em>@code @error</em></strong><br/>Please try again.', {'@error': error, '@code': code}),
            'buttons': {
                'ok': Locale.t('editor.assetbrowser.SharedAssets.onXHRError.ok', 'OK'),
            },
            'autoShow': true
        });
    }

    show(){
        super.show();

        if(!this._assets_loaded){
            this.loadAssets();
        }
    }

}
