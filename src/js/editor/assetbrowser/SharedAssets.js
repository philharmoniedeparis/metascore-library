import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Ajax from '../../core/Ajax';
import Button from '../../core/ui/Button';
import Icon from '../../core/ui/Icon';
import LoadMask from '../../core/ui/overlay/LoadMask';
import Overlay from '../../core/ui/Overlay';
import TextInput from '../../core/ui/input/TextInput';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import AssetFigure from './AssetFigure';
import Fuse from 'fuse.js';

import search_icon from '../../../img/editor/assetbrowser/sharedassets/search.svg?svg-sprite';
import close_icon from '../../../img/editor/assetbrowser/sharedassets/close.svg?svg-sprite';

import {className, toolbarClassName} from '../../../css/editor/assetbrowser/SharedAssets.scss';

/**
 * A shared assets browser class
 */
export default class SharedAssets extends Dom {

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
                'icon': close_icon,
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
        if(!this.asset_items){
            // add a loading mask
            const loadmask = new LoadMask({
                'parent': this.assets_container,
                'text': Locale.t('editor.assetbrowser.SharedAssets.loadAssets.loadmask.text', 'Loading...')
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
        this.asset_items = {};

        response.assets.forEach((asset) => {
            this.createAssetItem(asset);
        });

        this.fuzzy_search = new Fuse(response.assets, {
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
        const el = new Dom('<div/>', {'class': `asset ${asset.type}`})
            .data('id', asset.id)
            .data('type', asset.type)
            .addDelegate('button', 'click', this.onAssetButtonClick)
            .appendTo(this.assets_container);

        const figure = new AssetFigure(asset)
            .appendTo(el);

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(figure);

        new Button({'label': Locale.t('editor.assetbrowser.SharedAssets.AssetImportButton.label', 'Import')})
            .data('action', 'import')
            .appendTo(buttons);

        new Dom('<div/>', {'class': 'label'})
            .text(asset.name)
            .appendTo(el);

        this.asset_items[asset.id] = {
            'asset': asset,
            'el': el,
            'figure': figure
        };

        return this;
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

        Object.values(this.asset_items).forEach((item) => {
            const asset = item.asset;
            const el = item.el;

            el.css('order', null);

            if(!animated_toggle && asset.type === 'lottie_animation'){
                el.hide();
                return;
            }

            if(!static_toggle && asset.type !== 'lottie_animation'){
                el.hide();
                return;
            }

            if(search_result){
                const search_index = search_result.indexOf(asset);

                if(search_index < 0){
                    el.hide();
                    return;
                }

                el.css('order', search_index);
            }

            el.show();
        });
    }

    onAssetButtonClick(evt){
        const button = new Dom(evt.target);
        const action = button.data('action');

        const el = new Dom(evt.currentTarget);
        const asset_id = el.data('id');
        const item = this.asset_items[asset_id];
        const asset = item.asset;

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
        const error = response && 'message' in response ? response.message : evt.target.getStatusText();
        const code = evt.target.getStatus();

        new Overlay({
            'text': Locale.t('editor.assetbrowser.SharedAssets.onXHRError.msg', 'The following error occured:<br/><strong><em>@code @error</em></strong><br/>Please try again.', {'@error': error, '@code': code}),
            'buttons': {
                'ok': Locale.t('editor.assetbrowser.SharedAssets.onXHRError.ok', 'OK'),
            },
            'parent': this
        });
    }

    getToolbar(){
        return this.toolbar;
    }

    show(){
        super.show();

        if(!this.asset_items){
            this.loadAssets();
        }
        else{
            // Play all animations
            Object.values(this.asset_items).forEach((item) => {
                item.figure.play();
            });
        }
    }

    hide(){
        if(this.load_xhr){
            this.load_xhr.abort();
            delete this.load_xhr;
        }

        // Stop all animations
        if(this.asset_items){
            Object.values(this.asset_items).forEach((item) => {
                item.figure.stop();
            });
        }

        super.hide();
    }

}
