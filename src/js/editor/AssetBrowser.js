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
            .appendTo(this);

        this.draggable_links = new Dom('<div/>', {'class': 'draggable-links'})
            .addDelegate('a', 'click', this.onDraggableLinkClick.bind(this))
            .addDelegate('a', 'dragstart', this.onDraggableLinkDragStart.bind(this))
            .addDelegate('a', 'dragend', this.onDraggableLinkDragEnd.bind(this))
            .appendTo(this);

        new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-sync-block.text', 'Create a synched block'))
            .attr('draggable', 'true')
            .data('action', 'create-sync-block')
            .appendTo(this.draggable_links);

        new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-nonsync-block.text', 'Create a non-synched block'))
            .attr('draggable', 'true')
            .data('action', 'create-nonsync-block')
            .appendTo(this.draggable_links);

        new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-page.text', 'Create a page'))
            .attr('draggable', 'true')
            .data('action', 'create-page')
            .appendTo(this.draggable_links);

        new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-cursor-element.text', 'Create a cursor element'))
            .attr('draggable', 'true')
            .data('action', 'create-cursor-element')
            .appendTo(this.draggable_links);

        new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-text-element.text', 'Create a text element'))
            .attr('draggable', 'true')
            .data('action', 'create-text-element')
            .appendTo(this.draggable_links);

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

    onDraggableLinkClick(evt){
        console.log(evt);
    }

    onDraggableLinkDragStart(evt){
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

    onDraggableLinkDragEnd(evt){
        const link = new Dom(evt.target);
        link.removeClass('dragging');
    }

    showGuideAssets(){
        this.tabs.children('button').forEach((el) => {
            const button = new Dom(el);
            button.toggleClass('active', button.data('for') === 'guide-assets');
        });

        this.guide_assets.show();
        this.shared_assets.hide();
    }

    showSharedAssets(){
        this.tabs.children('button').forEach((el) => {
            const button = new Dom(el);
            button.toggleClass('active', button.data('for') === 'shared-assets');
        });

        this.guide_assets.hide();
        this.shared_assets.show();
    }

}
