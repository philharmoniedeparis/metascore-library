import Dom from '../core/Dom';
import Locale from '../core/Locale';
import Button from '../core/ui/Button';
import ComponentLinks from './assetbrowser/ComponentLinks';
import GuideAssets from './assetbrowser/GuideAssets';
import SharedAssets from './assetbrowser/SharedAssets';
import { History } from './UndoRedo';

import {className} from '../../css/editor/AssetBrowser.scss';

/**
 * An asset browser class
 */
export default class AssetBrowser extends Dom {

    static defaults = {
        'component_links': {},
        'guide_assets': {},
        'shared_assets': {},
        'xhr': {}
    };

    /**
     * Instantiate
     *
     * @param {Editor} editor The editor instance
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} guide_assets Options for the guide assets tab
     * @property {Object} shared_assets Options for the shared assets tab
     * @property {Object} [xhr={}] Options to send with each XHR request. See {@link Ajax.send} for available options
     */
    constructor(editor, configs) {
        // call parent constructor
        super('<div/>', {'class': `asset-browser ${className}`});

        /**
         * A reference to the Editor instance
         * @type {Editor}
         */
        this.editor = editor;

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        this.top = new Dom('<div/>', {'class': 'top'})
            .appendTo(this);

        this.tabs_wrapper = new Dom('<div/>', {'class': 'tabs'})
            .appendTo(this.top);

        this.tabs = {};
        this.contents = {};

        // Component links
        this.tabs['component-links'] = new Button({'label': Locale.t('editor.AssetBrowser.tabs.component-links.title', 'Components')})
            .data('for', 'component-links')
            .addListener('click', this.onTabClick.bind(this))
            .appendTo(this.tabs_wrapper);

        this.contents['component-links'] = new ComponentLinks(this.configs.component_links)
            .appendTo(this);

        // Guide assets
        this.tabs['guide-assets'] = new Button({'label': Locale.t('editor.AssetBrowser.tabs.guide-assets.title', 'Library')})
            .data('for', 'guide-assets')
            .addListener('click', this.onTabClick.bind(this))
            .appendTo(this.tabs_wrapper);

        this.contents['guide-assets'] = new GuideAssets(this.editor, Object.assign({'xhr': this.configs.xhr}, this.configs.guide_assets))
            .appendTo(this);

        // Shared assets
        this.tabs['shared-assets'] = new Button({'label': Locale.t('editor.AssetBrowser.tabs.shared-assets.title', 'Shared Library')})
            .data('for', 'shared-assets')
            .addListener('click', this.onTabClick.bind(this))
            .appendTo(this.tabs_wrapper);

        this.contents['shared-assets'] = new SharedAssets(Object.assign({'xhr': this.configs.xhr}, this.configs.shared_assets))
            .addListener('assetimport', this.onSharedAssetImport.bind(this))
            .appendTo(this);

        this.contents['shared-assets'].getToolbar()
            .addDelegate('button', 'click', this.onSharedAssetToolbarButtonClick.bind(this))
            .appendTo(this.top);


        this.switchTab('component-links');
    }

    switchTab(id){
        if(id === 'shared-assets'){
            const {width} = this.tabs_wrapper.get(0).getBoundingClientRect();
            this.tabs_wrapper.css('width', `${width}px`);
            this.getTabContent('shared-assets').getToolbar().show();
        }
        else{
            this.tabs_wrapper.css('width', null);
            this.getTabContent('shared-assets').getToolbar().hide();
        }

        Object.keys(this.tabs).forEach((key) => {
            const tab = this.getTab(key);
            const content = this.getTabContent(key);

            if(key === id){
                tab.addClass('active');
                content.show();
            }
            else{
                tab.removeClass('active');
                content.hide();
            }
        });

        this.triggerEvent('tabchange', {'tab': id});
    }

    getTab(id){
        return this.tabs[id];
    }

    getTabContent(id){
        return this.contents[id];
    }

    onTabClick(evt){
        const id = Dom.data(evt.target, 'for');
        this.switchTab(id);
    }

    onSharedAssetImport(evt){
        this.switchTab('guide-assets');

        const asset = Object.assign({}, evt.detail.asset);
        const guide_assets = this.getTabContent('guide-assets');

        guide_assets.addAsset(asset);

        History.add({
            'undo': () => {
                guide_assets.removeAsset(asset.id);
            },
            'redo': () => {
                guide_assets.addAsset(asset);
            }
        });

        this.editor.setDirty('assets');
    }

    onSharedAssetToolbarButtonClick(evt){
        const action = Dom.data(evt.target, 'action');

        switch(action){
            case 'close':
                this.switchTab('guide-assets');
                break;
        }
    }

}
