import Dom from '../../../core/Dom';
import CheckboxInput from '../../../core/ui/input/CheckboxInput';
import Button from '../../../core/ui/Button';

import expander_icon from '../../../../img/editor/controller/timeline/handle/expander.svg?svg-sprite';
import locked_icon from '../../../../img/editor/controller/timeline/handle/locked.svg?svg-sprite';
import {className} from '../../../../css/editor/controller/timeline/Handle.scss';

/**
 * A timeline track handle
 */
export default class Handle extends Dom {

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
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        const inner = new Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        new Button({'icon': expander_icon})
            .data('action', 'expander')
            .appendTo(inner);

        this.label = new Dom('<div/>', {'class': 'label'})
            .appendTo(inner);

        const togglers = new Dom('<div/>', {'class': 'togglers'})
            .appendTo(inner);

        new CheckboxInput({
                'icon': locked_icon
            })
            .data('action', 'lock')
            .attr('title', 'Toggle lock')
            .appendTo(togglers);

        this.attr('draggable', 'true');
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {};
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

        this.toggleClass('has-descendents', this.descendents.is(':empty'));
    }

    /**
     * Set the label's text
     *
     * @param {String} value The text
     * @return {this}
     */
    setLabel(value){
        this.label
            .text(value)
            .attr('title', value);

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

}
