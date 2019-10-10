import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Button from '../../core/ui/Button';
import Overlay from '../../core/ui/Overlay';
import Prompt from '../../core/ui/overlay/Prompt';

import arrow_icon from '../../../img/editor/controller/scenarioselector/arrow.svg?sprite';
import add_icon from '../../../img/editor/controller/scenarioselector/add.svg?sprite';
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

        // fix event handlers scope
        this.onAddConfirm = this.onAddConfirm.bind(this);

        const nav_buttons = new Dom('<div/>', {'class': 'nav-buttons'})
            .appendTo(this);

        new Button({'icon': arrow_icon})
            .data('action', 'previous')
            .appendTo(nav_buttons);

        new Button({'icon': arrow_icon})
            .data('action', 'next')
            .appendTo(nav_buttons);

        this.list = new Dom('<ul/>', {'class': 'list'})
            .appendTo(this);

        new Button({'icon': add_icon})
            .attr('title', Locale.t('editor.controller.ScenarioSelector.add-button.title', 'Add a new scenario'))
            .data('action', 'add')
            .appendTo(this);

        this
            .addDelegate('button', 'click', this.onButtonClick.bind(this))
            .addDelegate('.list li', 'click', this.onScenarioClick.bind(this));
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

    onButtonClick(evt){
        const action = new Dom(evt.target).data('action');

        switch(action){
            case 'previous':
                break;

            case 'next':
                break;

            case 'add':
                new Prompt({
                    'text': Locale.t('editor.controller.ScenarioSelector.add-prompt.text', "Enter the scenario's name"),
                    'onConfirm': this.onAddConfirm,
                    'onCancel': this.onAddCancel,
                    'autoHide': false,
                    'parent': this.closest('.metaScore-editor')
                });
                break;
        }
    }

    onAddConfirm(scenario, overlay){
        if(scenario){
            const item = this.getScenarioItem(scenario);

            if(item){
                new Overlay({
                    'text': Locale.t('editor.controller.ScenarioSelector.exists.msg', 'A scenario with that name already exists.'),
                    'buttons': {
                        'ok': Locale.t('editor.controller.ScenarioSelector.exists.ok', 'OK'),
                    },
                    'parent': this.closest('.metaScore-editor')
                });
            }
            else{
                this.addScenario(scenario);
                overlay.hide();
            }
        }
    }

    onAddCancel(overlay){
        overlay.hide();
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
        const item = this.list.child(`[data-scenario="${scenario}"]`);
        return item.count() > 0 ? item : null;
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
