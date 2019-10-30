import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Icon from '../../core/ui/Icon';
import * as icons from '../ComponentIcons';

import {className} from '../../../css/editor/assetbrowser/ComponentLinks.scss';

/**
 * A guide assets browser class
 */
export default class ComponentLinks extends Dom {

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
        super('<div/>', {'class': `component-links ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        const media_link = new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-media.text', 'Create a video renderer'))
            .attr('draggable', 'true')
            .data('type', 'block')
            .data('configs', JSON.stringify({'type': 'Media'}))
            .appendTo(this);

        new Icon({'symbol': icons.media})
            .appendTo(media_link);

        const controller_link = new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-controller.text', 'Create a controller'))
            .attr('draggable', 'true')
            .data('type', 'block')
            .data('configs', JSON.stringify({'type': 'Controller'}))
            .appendTo(this);

        new Icon({'symbol': icons.controller})
            .appendTo(controller_link);

        const synched_block_link = new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-synced-block.text', 'Create a synched block'))
            .attr('draggable', 'true')
            .data('type', 'block')
            .data('configs', JSON.stringify({'type': 'Block', 'synched': true}))
            .appendTo(this);

        new Icon({'symbol': icons.block.synched})
            .appendTo(synched_block_link);

        const non_synched_block_link = new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-non-synced-block.text', 'Create a non-synched block'))
            .attr('draggable', 'true')
            .data('type', 'block')
            .data('configs', JSON.stringify({'type': 'Block', 'synched': false}))
            .appendTo(this);

        new Icon({'symbol': icons.block.non_synched})
            .appendTo(non_synched_block_link);

        const page_link = new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-page.text', 'Create a page'))
            .attr('draggable', 'true')
            .data('type', 'page')
            .data('configs', JSON.stringify({'position': 'before'}))
            .appendTo(this);

        new Icon({'symbol': icons.page})
            .appendTo(page_link);

        const cursor_element_link = new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-cursor-element.text', 'Create a cursor element'))
            .attr('draggable', 'true')
            .data('type', 'element')
            .data('configs', JSON.stringify({'type': 'Cursor'}))
            .appendTo(this);

        new Icon({'symbol': icons.cursor})
            .appendTo(cursor_element_link);

        const content_element_link = new Dom('<a/>')
            .text(Locale.t('editor.AssetBrowser.create-content-element.text', 'Create a content element'))
            .attr('draggable', 'true')
            .data('type', 'element')
            .data('configs', JSON.stringify({'type': 'Content'}))
            .appendTo(this);

        new Icon({'symbol': icons.content})
            .appendTo(content_element_link);

        this
            .addDelegate('a', 'click', this.onLinkClick.bind(this))
            .addDelegate('a', 'dragstart', this.onLinkDragStart.bind(this))
            .addDelegate('a', 'dragend', this.onLinkDragEnd.bind(this));
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {};
    }

    onLinkClick(evt){
        const link = new Dom(evt.target);
        const type = link.data('type');
        const configs = link.data('configs');

        this.triggerEvent('componentlinkclick', {'type': type, 'configs': JSON.parse(configs)});
    }

    onLinkDragStart(evt){
        const link = new Dom(evt.target);
        const type = link.data('type');
        const configs = link.data('configs');

        link.addClass('dragging');

        evt.dataTransfer.effectAllowed = 'copy';
        evt.dataTransfer.setData(`metascore/${type}`, configs);
    }

    onLinkDragEnd(evt){
        const link = new Dom(evt.target);
        link.removeClass('dragging');
    }

}
