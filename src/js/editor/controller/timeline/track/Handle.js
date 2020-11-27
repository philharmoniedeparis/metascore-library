import Dom from '../../../../core/Dom';
import Icon from '../../../../core/ui/Icon';
import Button from '../../../../core/ui/Button';
import CheckboxInput from '../../../../core/ui/input/CheckboxInput';
import {escapeHTML} from '../../../../core/utils/String';

import expander_icon from '../../../../../img/editor/controller/timeline/handle/expander.svg?svg-sprite';

import {className} from '../../../../../css/editor/controller/timeline/track/Handle.scss';

/**
 * A timeline track handle
 */
export default class Handle extends Dom {

    static defaults = {
        'icon': null,
        'expander': false,
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

        if(this.configs.expander) {
            new Button({'icon': expander_icon})
                .data('action', 'expander')
                .appendTo(this);
        }

        this.label = new Dom('<div/>', {'class': 'label'})
            .appendTo(this);
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
     * Add a toggler.
     *
     * @param {String} action The assocaited action
     * @param {Icon} icon The assocaited icon
     * @param {String} title The assocaited title
     * @return {this}
     */
    addToggler(action, icon, title){
        let togglers_dom = this.child('.togglers');

        if (togglers_dom.count() < 1) {
            togglers_dom = new Dom('<div/>', {'class': 'togglers'})
                .appendTo(this);
        }

        this.togglers = this.togglers ?? {};

        this.togglers[action] = new CheckboxInput({
                'icon': icon
            })
            .data('action', action)
            .attr('title', title)
            .appendTo(togglers_dom);

        return this;
    }

    /**
     * Get a toggler by action.
     *
     * @param {String} action The assocaited action
     * @return {this}
     */
    getToggler(action){
        return this.togglers ? this.togglers[action] : null;
    }

}
