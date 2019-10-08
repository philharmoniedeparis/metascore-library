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
            .addDelegate('li', 'click', this.onScenarioClick.bind(this))
            .appendTo(this);
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

    onScenarioClick(evt){
        const scenario = Dom.data(evt.target, 'scenario');
        this.setActiveScenario(scenario);
    }

    setActiveScenario(scenario, supressEvent){
        const item = this.getScenarioItem(scenario);

        if(item){
            const previous_active_item = this.list.child('.active');
            if(previous_active_item){
                previous_active_item.removeClass('active');
            }

            item.addClass('active');

            if(supressEvent !== true){
                this.triggerEvent('scenarioactivate', {'scenario': scenario});
            }
        }
    }

    getScenarioItem(scenario){
        return this.list.child(`[data-scenario="${scenario}"]`);
    }

    /**
     * Add a scenario
     *
     * @param {String} scenario The scenario
     * @param {Boolean} supressEvent Whether to prevent the scenarioadd event from firing
     * @return {this}
     */
    addScenario(scenario, supressEvent){
        new Dom('<li/>', {'text': scenario})
            .data('scenario', scenario)
            .appendTo(this.list);

        if(supressEvent !== true){
            this.triggerEvent('scenarioadd', {'scenario': scenario});
        }

        return this;
    }

    /**
     * Add multiple scenarios
     *
     * @param {Array} scenarios A list of scenarios
     * @param {Boolean} supressEvent Whether to prevent the scenarioadd event from firing
     * @return {this}
     */
    addScenarios(scenarios, supressEvent){
        scenarios.forEach((scenario) => {
            this.addScenario(scenario, supressEvent);
        });

        return this;
    }

    /**
     * Remoave a scenario
     *
     * @param {String} scenario The scenario
     * @param {Boolean} supressEvent Whether to prevent the scenarioremove event from firing
     * @return {this}
     */
    removeScenario(scenario, supressEvent){
        const item = this.getScenarioItem(scenario);

        if(item){
            item.remove();

            if(supressEvent !== true){
                this.triggerEvent('scenarioremove', {'scenario': scenario});
            }
        }

        return this;
    }

    /**
     * Remove multiple scenarios
     *
     * @param {Array} scenarios A list of scenarios
     * @param {Boolean} supressEvent Whether to prevent the scenarioremove event from firing
     * @return {this}
     */
    removeScenarios(scenarios, supressEvent){
        scenarios.forEach((scenario) => {
            this.removeScenario(scenario, supressEvent);
        });

        return this;
    }

}
