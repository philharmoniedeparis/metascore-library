import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Ajax from '../../core/Ajax';
import Button from '../../core/ui/Button';
import Icon from '../../core/ui/Icon';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Alert from '../../core/ui/overlay/Alert';
import TextInput from '../../core/ui/input/TextInput';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import Lottie from 'lottie-web';
import Fuse from 'fuse.js';

import search_icon from '../../../img/editor/assetbrowser/sharedassets/search.svg?sprite';
import {className, toolbarClassName} from '../../../css/editor/assetbrowser/SharedAssets.scss';

/**
 * An asset browser class
 */
export default class AssetBrowser extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} url The shared assets list url
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

        this.toolbar = new Dom('<div/>', {'class': `${toolbarClassName} toolbar`})
            .appendTo(this);

        this.filters = {};
        this.filters.search = new TextInput({
                'name': 'search',
                'placeholder': Locale.t('editor.assetbrowser.SharedAssets.filters.search.placeholder', 'Filter'),
            })
            .addListener('input', this.onFilterSearchInput.bind(this))
            .appendTo(this.toolbar);

        new Icon({'symbol': search_icon})
            .appendTo(this.filters.search);

        this.filters.animated = new CheckboxInput({
                'name': 'animated',
                'label': Locale.t('editor.assetbrowser.SharedAssets.filters.animated.label', 'Animated'),
                'checked': true
            })
            .addClass('toggle-button')
            .addListener('valuechange', this.onFilterToggleValueChange.bind(this))
            .appendTo(this.toolbar);

        this.filters.static = new CheckboxInput({
                'name': 'static',
                'label': Locale.t('editor.assetbrowser.SharedAssets.filters.static.label', 'Static'),
                'checked': true
            })
            .addClass('toggle-button')
            .addListener('valuechange', this.onFilterToggleValueChange.bind(this))
            .appendTo(this.toolbar);

        new Button({
                'icon': 'close',
                'label': Locale.t('editor.assetbrowser.SharedAssets.toolbar.close.label', 'Close')
            })
            .data('action', 'close')
            .appendTo(this.toolbar);

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
            'url': null,
            'xhr': {}
        };
    }

    loadAssets(){
        if(!this.assets){
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

            this.load_xhr = Ajax.GET(this.configs.url, options);
        }

        return this;
    }

    onAssetsLoadSuccess(loadmask, evt){
        delete this.load_xhr;

        const response = evt.target.getResponse();

        /**
         * The list of assets
         * @type {Array}
         */
        this.assets = response.assets;

        this.assets.forEach((asset) => {
            this.createAssetItem(asset).appendTo(this.assets_container);
        });

        this.fuzzy_search = new Fuse(this.assets, {
            'shouldSort': true,
            'tokenize': true,
            'matchAllTokens': true,
            'findAllMatches': true,
            'threshold': 0.5,
            'location': 0,
            'distance': 100,
            'maxPatternLength': 32,
            'minMatchCharLength': 1,
            'keys': ['name']
        });

        this._assets_loaded = true;

        loadmask.hide();
    }

    createAssetItem(asset){
        const item = new Dom('<div/>', {'class': `asset ${asset.type}`})
            .data('id', asset.id)
            .addDelegate('button', 'click', this.onAssetButtonClick);

        const figure = new Dom('<figure/>')
            .appendTo(item);

        switch(asset.type){
            case 'image':
                new Dom('<img/>', {'src': asset.file.url}).appendTo(figure);
                break;

            case 'lottie_animation':
                asset._animation = Lottie.loadAnimation({
                    container: figure.get(0),
                    path: asset.file.url,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                });
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

        return item;
    }

    onFilterSearchInput(){
        this.filterAssets();
    }

    onFilterToggleValueChange(){
        this.filterAssets();
    }

    filterAssets(){
        const search = this.filters.search.getValue();
        const animated_toggle = this.filters.animated.getValue();
        const static_toggle = this.filters.static.getValue();

        const search_result = search ? this.fuzzy_search.search(search) : null;

        this.assets.forEach((asset) => {
            const item = this.getAssetItem(asset);

            item.css('order', null);

            if(!animated_toggle && asset.type === 'lottie_animation'){
                item.hide();
                return;
            }

            if(!static_toggle && asset.type !== 'lottie_animation'){
                item.hide();
                return;
            }

            if(search_result){
                const search_index = search_result.indexOf(asset);

                if(search_index < 0){
                    item.hide();
                    return;
                }

                item.css('order', search_index);
            }

            item.show();
        });
    }

    onAssetButtonClick(evt){
        const button = new Dom(evt.target);
        const action = button.data('action');

        const item = new Dom(evt.currentTarget);
        const asset_id = item.data('id');
        const asset = this.getAssetById(asset_id);

        switch(action){
            case 'import':
                this.triggerEvent('assetimport', {'asset': asset});
                break;
        }
    }

    onXHRError(loadmask, evt){
        delete this.load_xhr;

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

    getAssetById(id){
        return this.assets.find((asset) => {
            return asset.id === id;
        });
    }

    getAssetItem(asset){
        return this.assets_container.child(`.asset[data-id="${asset.id}"]`);
    }

    getToolbar(){
        return this.toolbar;
    }

    show(){
        super.show();

        if(!this.assets){
            this.loadAssets();
        }
        else{
            // Play all animations
            this.assets.forEach((asset) => {
                if(asset.type === 'lottie_animation'){
                    asset._animation.play();
                }
            });
        }
    }

    hide(){
        if(this.load_xhr){
            this.load_xhr.abort();
            delete this.load_xhr;
        }

        // Stop all animations
        if(this.assets){
            this.assets.forEach((asset) => {
                if(asset.type === 'lottie_animation'){
                    asset._animation.stop();
                }
            });
        }

        super.hide();
    }

}
