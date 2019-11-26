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
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'links': {
                'video-renderer': {
                    'text': Locale.t('editor.assetbrowser.ComponentLinks.video-renderer.text', 'Video renderer'),
                    'type': 'block',
                    'configs': {
                        'type':
                        'VideoRenderer'
                    },
                    'icon': icons.videorenderer
                },
                'controller': {
                    'text': Locale.t('editor.assetbrowser.ComponentLinks.controller.text', 'Controller'),
                    'type': 'block',
                    'configs': {
                        'type': 'Controller'
                    },
                    'icon': icons.controller
                },
                'blocktoggler': {
                    'text': Locale.t('editor.assetbrowser.ComponentLinks.blocktoggler.text', 'Block Toggler'),
                    'type': 'block',
                    'configs': {
                        'type': 'BlockToggler'
                    },
                    'icon': icons.blocktoggler
                },
                'synced-block': {
                    'text': Locale.t('editor.assetbrowser.ComponentLinks.synced-block.text', 'Synchronized block'),
                    'type': 'block',
                    'configs': {
                        'type': 'Block',
                        'synched': true
                    },
                    'icon': icons.block.synched
                },
                'non-synced-block': {
                    'text': Locale.t('editor.assetbrowser.ComponentLinks.non-synced-block.text', 'Non-synchronized block'),
                    'type': 'block',
                    'configs': {
                        'type': 'Block',
                        'synched': false
                    },
                    'icon': icons.block.non_synched
                },
                'page': {
                    'text': Locale.t('editor.assetbrowser.ComponentLinks.page.text', 'Page'),
                    'type': 'page',
                    'configs': {
                        'position': 'before'
                    },
                    'icon': icons.page
                },
                'cursor': {
                    'text': Locale.t('editor.assetbrowser.ComponentLinks.cursor-element.text', 'Cursor element'),
                    'type': 'element',
                    'configs': {
                        'type': 'Cursor'
                    },
                    'icon': icons.cursor
                },
                'content': {
                    'text': Locale.t('editor.assetbrowser.ComponentLinks.content-element.text', 'Content element'),
                    'type': 'element',
                    'configs': {
                        'type': 'Content'
                    },
                    'icon': icons.content
                }
            }
        };
    }

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

        this.links = {};

        Object.entries(this.configs.links).forEach(([key, value]) => {
            const link = new Dom('<div/>', {'class': `link ${key}`})
                .attr('draggable', 'true')
                .attr('tabindex', '0')
                .data('type', value.type)
                .data('configs', JSON.stringify(value.configs))
                .appendTo(this);

            new Icon({'symbol': value.icon})
                .appendTo(link);

            new Dom('<div/>', {'class': 'label'})
                .text(value.text)
                .appendTo(link);

            this.links[key] = link;
        });

        this
            .addDelegate('.link', 'dragstart', this.onLinkDragStart.bind(this))
            .addDelegate('.link', 'dragend', this.onLinkDragEnd.bind(this));
    }

    /**
     * Get a link by id
     *
     * @param {String} id The link's id
     * @returns {Dom} The corresponding link if found, undefined otherwise
     */
    getLink(id){
        return this.links[id];
    }

    /**
     * Link dragstart event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onLinkDragStart(evt){
        const link = new Dom(evt.target);
        const type = link.data('type');
        const configs = link.data('configs');

        link.addClass('dragging');

        evt.dataTransfer.effectAllowed = 'copy';
        evt.dataTransfer.setData(`metascore/${type}`, configs);
    }

    /**
     * Link dragend event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onLinkDragEnd(evt){
        const link = new Dom(evt.target);
        link.removeClass('dragging');
    }

}
