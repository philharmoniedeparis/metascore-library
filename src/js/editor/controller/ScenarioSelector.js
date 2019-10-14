import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Button from '../../core/ui/Button';
import Overlay from '../../core/ui/Overlay';
import Prompt from '../../core/ui/overlay/Prompt';
import ResizeObserver from 'resize-observer-polyfill';

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

        this.scroll_left_btn = new Button({'icon': arrow_icon})
            .data('action', 'scroll-left')
            .appendTo(nav_buttons);

        this.scroll_right_btn = new Button({'icon': arrow_icon})
            .data('action', 'scroll-right')
            .appendTo(nav_buttons);

        this.list = new Dom('<ul/>', {'class': 'list'})
            .appendTo(this);

        new Button({'icon': add_icon})
            .attr('title', Locale.t('editor.controller.ScenarioSelector.add-button.title', 'Add a new scenario'))
            .data('action', 'add')
            .appendTo(this);

        this
            .addDelegate('button', 'click', this.onButtonClick.bind(this))
            .addDelegate('.list .item', 'click', this.onScenarioClick.bind(this));

        const resize_observer = new ResizeObserver(this.onResize.bind(this));
        resize_observer.observe(this.get(0));
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

    /**
     * ResizeObserver callback
     *
     * @private
     */
    onResize() {
        this.updateScrollButtons();
    }

    /**
     * Button click event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onButtonClick(evt){
        const action = new Dom(evt.target).data('action');

        switch(action){
            case 'scroll-left':
            case 'scroll-right':
                {
                    const list_el = this.list.get(0);
                    const visible_item = this.list.children('.item').get().find((item) => {
                        return item.offsetLeft >= list_el.scrollLeft;
                    });
                    if(visible_item){
                        const sibling_item = action === 'scroll-left' ? visible_item.previousSibling : visible_item.nextSibling;
                        if(sibling_item){
                            list_el.scrollLeft = sibling_item.offsetLeft - list_el.offsetLeft;
                            this.updateScrollButtons();
                        }
                    }
                }
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

    /**
     * Add prompt onConfirm callback
     *
     * @private
     * @param {String} scenario The scenario's name
     * @param {Overlay} overlay The overlay
     */
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

    /**
     * Add prompt onCancel callback
     *
     * @private
     * @param {Overlay} overlay The overlay
     */
    onAddCancel(overlay){
        overlay.hide();
    }

    /**
     * List item click event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onScenarioClick(evt){
        const scenario = Dom.data(evt.target, 'scenario');
        this.setActiveScenario(scenario);
    }

    /**
     * Set the active scenario item
     *
     * @param {String} scenario The scenario's name
     * @param {Boolean} supressEvent Whether to prevent the custom scenarioactivate event from firing
     */
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

    /**
     * Get a scenario's corresponding item
     *
     * @private
     * @param {String} scenario The scenario's name
     * @return {Dom} The item or null if not found
     */
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
        new Dom('<li/>', {'class': 'item', 'text': scenario})
            .data('scenario', scenario)
            .appendTo(this.list);

        this.updateScrollButtons();

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

    /**
     * Activate/deactivate the scroll buttons
     *
     * @private
     * @return {this}
     */
    updateScrollButtons(){
        const list_el = this.list.get(0);

        if(list_el.scrollLeft > 0){
            this.scroll_left_btn.enable();
        }
        else{
            this.scroll_left_btn.disable();
        }

        if(list_el.clientWidth + list_el.scrollLeft < list_el.scrollWidth){
            this.scroll_right_btn.enable();
        }
        else{
            this.scroll_right_btn.disable();
        }

        return this;
    }

}
