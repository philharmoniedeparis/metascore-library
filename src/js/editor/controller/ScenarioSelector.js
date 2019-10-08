import Dom from '../../core/Dom';
import Button from '../../core/ui/Button';

import arrow_icon from '../../../img/editor/controller/scenarioselector/arrow.svg?sprite';
import {className} from '../../../css/editor/controller/ScenarioSelector.scss';

/**
 * A scenario selector
 */
export default class ScenarioSelector extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `scenario-selector ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        new Button({'icon': arrow_icon})
            .data('action', 'previous')
            .appendTo(buttons);

        new Button({'icon': arrow_icon})
            .data('action', 'next')
            .appendTo(buttons);

        this.list = new Dom('<ul/>', {'class': 'list'})
            .appendTo(this);

        this.addScenario("Scénario 1");
        this.addScenario("Scénario 2");
        this.addScenario("Scénario 3");
        this.addScenario("Scénario 4");
        this.addScenario("Scénario 5");
    }

    /**
     * Get the default config values
     *
     * @return {Object} The default values
     */
    static getDefaults(){
        return {
        };
    }

    addScenario(name){
        new Dom('<li/>', {'text': name})
            .data('scenraio', name)
            .appendTo(this.list);

        return this;
    }

    removeScenario(name){
        this.list.child(`[data-scenraio="${name}"]`).remove();

        return this;
    }

}
