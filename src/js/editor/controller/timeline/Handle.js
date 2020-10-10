import Dom from '../../../core/Dom';
import Icon from '../../../core/ui/Icon';
import Button from '../../../core/ui/Button';
import CheckboxInput from '../../../core/ui/input/CheckboxInput';
import {escapeHTML} from '../../../core/utils/String';

import expander_icon from '../../../../img/editor/controller/timeline/handle/expander.svg?svg-sprite';
import locked_icon from '../../../../img/editor/controller/timeline/handle/locked.svg?svg-sprite';

import {className} from '../../../../css/editor/controller/timeline/Handle.scss';

/**
 * A timeline track handle
 */
export default class Handle extends Dom {

    static defaults = {
        'icon': null
    };

    /**
     * Instantiate
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `handle ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        const inner = new Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        if(this.configs.icon){
            new Icon({'symbol': this.configs.icon})
                .appendTo(inner);
        }

        new Button({'icon': expander_icon})
            .data('action', 'expander')
            .appendTo(inner);

        this.label = new Dom('<div/>', {'class': 'label'})
            .appendTo(inner);

        const togglers = new Dom('<div/>', {'class': 'togglers'})
            .appendTo(inner);

        this.togglers = {};

        this.togglers.lock = new CheckboxInput({
                'icon': locked_icon
            })
            .data('action', 'lock')
            .attr('title', 'Toggle lock')
            .appendTo(togglers);
    }

    /**
     * Descendents childremove event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onDescendentsChildRemove(evt){
        const child = evt.detail.child;
        if(!Dom.is(child, `.${className}`)){
            return;
        }

        this.toggleClass('has-descendents', !this.descendents.is(':empty'));
    }

    /**
     * Set the label's text
     *
     * @param {String} value The text
     * @return {this}
     */
    setLabel(value){
        this.label.text(escapeHTML(value));
        this.attr('title', value);

        return this;
    }

    /**
     * Add a descendent handle
     *
     * @param {Handle} handle The handle to add
     * @param {Integer} index The position at which the handle should be added
     * @return {this}
     */
    addDescendent(handle, index){
        if(!this.descendents){
            this.descendents = new Dom('<div/>', {'class': 'descendents'})
                .addListener('childremove', this.onDescendentsChildRemove.bind(this))
                .appendTo(this)
        }

        handle.insertAt(this.descendents, index);

        this.addClass('has-descendents');

        return this;
    }

    getToggler(key){
        return this.togglers[key];
    }

}
