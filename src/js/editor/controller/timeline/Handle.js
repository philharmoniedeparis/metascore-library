import Dom from '../../../core/Dom';
import Button from '../../../core/ui/Button';
import {isEmpty} from '../../../core/utils/Var';

import {className} from '../../../../css/editor/controller/timeline/Handle.less';

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

        new Dom('<div/>', {'class': 'expander'})
            .appendTo(inner);

        this.label = new Dom('<div/>', {'class': 'label'})
            .appendTo(inner);

        if(!isEmpty(this.configs.buttons)){
            const buttons = new Dom('<div/>', {'class': 'buttons'})
                .appendTo(inner);

			this.configs.buttons.forEach((action) => {
                new Button().data('action', action)
                    .appendTo(buttons);
            });
        }
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'buttons': []
        };
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
