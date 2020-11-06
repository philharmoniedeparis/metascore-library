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

        if(this.configs.icon){
            new Icon({'symbol': this.configs.icon})
                .appendTo(this);
        }

        new Button({'icon': expander_icon})
            .data('action', 'expander')
            .appendTo(this);

        this.label = new Dom('<div/>', {'class': 'label'})
            .appendTo(this);

        const togglers = new Dom('<div/>', {'class': 'togglers'})
            .appendTo(this);

        this.togglers = {};

        this.togglers.lock = new CheckboxInput({
                'icon': locked_icon
            })
            .data('action', 'lock')
            .attr('title', 'Toggle lock')
            .appendTo(togglers);
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

    getToggler(key){
        return this.togglers[key];
    }

}
