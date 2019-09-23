import Dom from '../core/Dom';
import Locale from '../core/Locale';
import Button from '../core/ui/Button';
import GuideAssets from './assetbrowser/GuideAssets';
import SharedAssets from './assetbrowser/SharedAssets';

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
     * @property {Object} shared_assets Options for the shared assets tab
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

        new Button({'label': Locale.t('editor.AssetBrowser.tabs.guide-assets.title', 'Library')})
            .data('for', 'guide-assets')
            .addListener('click', this.showGuideAssets.bind(this))
            .appendTo(this.tabs);

        new Button({'label': Locale.t('editor.AssetBrowser.tabs.shared-assets.title', 'Shared Library')})
            .data('for', 'shared-assets')
            .addListener('click', this.showSharedAssets.bind(this))
            .appendTo(this.tabs);

        this.guide_assets = new GuideAssets(Object.assign({'xhr': this.configs.xhr}, this.configs.guide_assets))
            .appendTo(this);

        this.shared_assets = new SharedAssets(Object.assign({'xhr': this.configs.xhr}, this.configs.shared_assets))
            .addListener('assetimport', this.onSharedAssetImport.bind(this))
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
            'guide_assets': {},
            'shared_assets': {}
        };
    }

    showGuideAssets(){
        this.tabs.children('button').forEach((el) => {
            const button = new Dom(el);
            button.toggleClass('active', button.data('for') === 'guide-assets');
        });

        this.guide_assets.show();
        this.shared_assets.hide();

        this.triggerEvent('tabchange', {'tab': 'guide-assets'});
    }

    showSharedAssets(){
        this.tabs.children('button').forEach((el) => {
            const button = new Dom(el);
            button.toggleClass('active', button.data('for') === 'shared-assets');
        });

        this.guide_assets.hide();
        this.shared_assets.show();

        this.triggerEvent('tabchange', {'tab': 'shared-assets'});
    }

    onSharedAssetImport(evt){
        const asset = evt.detail.asset;
        this.guide_assets.addAsset(asset);

        this.showGuideAssets();
    }

}
