import Dom from '../core/Dom';
import Locale from '../core/Locale';
import Ajax from '../core/Ajax';
import LoadMask from '../core/ui/overlay/LoadMask';

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

        this.tabs = {};

        this.tabs_menu = new Dom('<ul/>', {'class': 'tabs'})
            .addDelegate('li', 'click', this.onTabClick.bind(this))
            .appendTo(this);

        this.addTab('guide_assets', Locale.t('editor.AssetBrowser.guide-assets.tab.title', 'Library'));
        this.addTab('shared_assets', Locale.t('editor.AssetBrowser.shared-assets.tab.title', 'Shared Library'));

        this.setActiveTab('guide_assets');
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
            },
            'shared_assets': {
                'list_url': null,
            },
            'xhr': {}
        };
    }

    onTabClick(evt){
        this.setActiveTab(Dom.data(evt.target, 'for'));
    }

    addTab(id, title){
        const tab = new Dom('<li/>')
            .data('for', id)
            .text(title)
            .appendTo(this.tabs_menu);

        const content = new Dom('<div/>', {'class': 'tabbed-content'})
            .attr('id', id)
            .appendTo(this);

        this.tabs[id] = {
            'tab': tab,
            'content': content
        };

        return this.tabs[id];
    }

    getTab(id){
        if(id in this.tabs){
            return this.tabs[id].tab;
        }

        return null;
    }

    getTabbedContent(id){
        if(id in this.tabs){
            return this.tabs[id].content;
        }

        return null;
    }

    setActiveTab(id){
        Object.entries(this.tabs).forEach(([key, value]) => {
            const toggle = key === id;

            value.tab.toggleClass('active', toggle);
            value.content.toggleClass('active', toggle);

            if(toggle && !value.content.hasClass('loaded')){
                switch(id){
                    case 'guide_assets':
                        this.loadGuideAsset();
                        break;
                    case 'shared_assets':
                        this.loadSharedAsset();
                        break;
                }
            }
        });

        return this;
    }

    loadGuideAsset(){
        // add a loading mask
        const loadmask = new LoadMask({
            'parent': this.getTabbedContent('guide_assets'),
            'text': Locale.t('editor.AssetBrowser.LoadMask.text', 'Loading...'),
            'autoShow': true,
        });

        // prepare the Ajax options object
        const options = Object.assign({
            'responseType': 'json',
            'onSuccess': this.onGuideAssetsLoadSuccess.bind(this, loadmask),
            'onError': this.onXHRError.bind(this, loadmask)
        }, this.configs.xhr);

        Ajax.GET(this.configs.guide_assets.list_url, options);
    }

    onGuideAssetsLoadSuccess(loadmask, evt){
        const response = evt.target.getResponse();
        const content = this.getTabbedContent('guide_assets');

        const assets_container = new Dom('<div/>', {'class': 'assets'})
            .appendTo(content);

        response.assets.forEach((asset) => {
            const item = new Dom('<div/>', {'class': 'asset'})
                .appendTo(assets_container);

            new Dom('<div/>', {'class': 'label'})
                .text(asset.name)
                .appendTo(item);
        });

        content.addClass('loaded');

        loadmask.hide();
    }

    onXHRError(id, loadmask, evt){
        loadmask.hide();

        console.log(id, evt.target.getStatusText());
    }

}
