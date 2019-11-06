import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Button from '../../core/ui/Button';
import Overlay from '../../core/ui/Overlay';
import Prompt from '../../core/ui/overlay/Prompt';
import Confirm from '../../core/ui/overlay/Confirm';
import ContextMenu from '../../core/ui/ContextMenu';
import ResizeObserver from 'resize-observer-polyfill';

import arrow_icon from '../../../img/editor/controller/scenarioselector/arrow.svg?svg-sprite';
import add_icon from '../../../img/editor/controller/scenarioselector/add.svg?svg-sprite';
import clone_icon from '../../../img/editor/controller/scenarioselector/clone.svg?svg-sprite';

import {className} from '../../../css/editor/controller/ScenarioSelector.scss';

/**
 * A scenario selector
 */
export default class ScenarioSelector extends Dom {

    /**
     * Get the default config values
     *
     * @return {Object} The default values
     */
    static getDefaults(){
        return {
            'contextmenuContainer': '.metaScore-editor'
        };
    }

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

        this.add_btn = new Button({'icon': add_icon})
            .attr('title', Locale.t('editor.controller.ScenarioSelector.add.title', 'Add a new scenario'))
            .data('action', 'add')
            .appendTo(this);

        this.clone_btn = new Button({'icon': clone_icon})
            .attr('title', Locale.t('editor.controller.ScenarioSelector.clone.title', 'Clone active scenario'))
            .data('action', 'clone')
            .appendTo(this);

        this
            .addDelegate('button', 'click', this.onButtonClick.bind(this))
            .addDelegate('.list .item', 'click', this.onScenarioClick.bind(this));

        /**
         * The context menu
         * @type {ContextMenu}
         */
        this.contextmenu = new ContextMenu({'target': this, 'items': {
                'rename': {
                    'text': Locale.t('editor.controller.ScenarioSelector.contextmenu.rename', 'Rename scenario'),
                    'callback': (context) => {
                        const scenario = context.el.data('scenario');
                        this.showRenamePrompt(scenario);
                    },
                    'toggler': (context) => {
                        return context.el.is('.item');
                    }
                },
                'clone': {
                    'text': Locale.t('editor.controller.ScenarioSelector.contextmenu.clone', 'Clone scenario'),
                    'callback': (context) => {
                        const scenario = context.el.data('scenario');
                        this.showClonePrompt(scenario);
                    },
                    'toggler': (context) => {
                        return context.el.is('.item');
                    }
                },
                'delete': {
                    'text': Locale.t('editor.controller.ScenarioSelector.contextmenu.delete', 'Delete scenario'),
                    'callback': (context) => {
                        const scenario = context.el.data('scenario');
                        this.showDeleteConfirm(scenario);
                    },
                    'toggler': (context) => {
                        return context.el.is('.item') && this.list.children('.item').count() > 1;
                    }
                }
            }})
            .appendTo(this.configs.contextmenuContainer);

        const resize_observer = new ResizeObserver(this.onListResize.bind(this));
        resize_observer.observe(this.list.get(0));
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
                this.showAddPrompt();
                break;

            case 'clone':
                {
                    const item = this.list.child('.active');
                    const scenario = item.data('scenario');
                    this.showClonePrompt(scenario);
                }
                break;
        }
    }

    /**
     * Rename prompt onConfirm callback
     *
     * @private
     * @param {String} scenario The scenario's name
     * @param {Overlay} overlay The overlay
     */
    onRenameConfirm(old_scenario, new_scenario, overlay){
        if(new_scenario){
            if(new_scenario !== old_scenario){
                const item = this.getScenarioItem(new_scenario);
                if(item){
                    new Overlay({
                        'text': Locale.t('editor.controller.ScenarioSelector.exists.msg', 'A scenario with that name already exists.'),
                        'buttons': {
                            'ok': Locale.t('editor.controller.ScenarioSelector.exists.ok', 'OK'),
                        },
                        'parent': '.metaScore-editor'
                    });
                }
                else{
                    overlay.hide();
                    this.renameScenario(old_scenario, new_scenario);
                }
            }
            else{
                overlay.hide();
            }
        }
    }

    /**
     * Rename prompt onCancel callback
     *
     * @private
     * @param {Overlay} overlay The overlay
     */
    onRenameCancel(overlay){
        overlay.hide();
    }

    /**
     * Clone prompt onConfirm callback
     *
     * @private
     * @param {String} scenario The scenario's name
     * @param {Overlay} overlay The overlay
     */
    onCloneConfirm(scenario, clone, overlay){
        if(scenario){
            const item = this.getScenarioItem(clone);
            if(item){
                new Overlay({
                    'text': Locale.t('editor.controller.ScenarioSelector.exists.msg', 'A scenario with that name already exists.'),
                    'buttons': {
                        'ok': Locale.t('editor.controller.ScenarioSelector.exists.ok', 'OK'),
                    },
                    'parent': '.metaScore-editor'
                });
            }
            else{
                overlay.hide();
                this.cloneScenario(scenario, clone);
            }
        }
    }

    /**
     * Clone prompt onCancel callback
     *
     * @private
     * @param {Overlay} overlay The overlay
     */
    onCloneCancel(overlay){
        overlay.hide();
    }

    /**
     * Delete confirm onConfirm callback
     *
     * @private
     * @param {String} scenario The scenario's name
     */
    onDeleteConfirm(scenario){
        this.removeScenario(scenario);
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
                    'parent': '.metaScore-editor'
                });
            }
            else{
                overlay.hide();
                this.addScenario(scenario);
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
     * ResizeObserver callback
     *
     * @private
     */
    onListResize() {
        this.updateScrollButtons();
    }

    /**
     * Prompt user for new scenario's name
     *
     * @return {this}
     */
    showAddPrompt(){
        new Prompt({
            'text': Locale.t('editor.controller.ScenarioSelector.onButtonClick.add.text', "Enter the scenario's name"),
            'confirmLabel': Locale.t('editor.controller.ScenarioSelector.onButtonClick.add.confirmLabel', "Add"),
            'onConfirm': this.onAddConfirm.bind(this),
            'onCancel': this.onAddCancel.bind(this),
            'autoHide': false,
            'parent': '.metaScore-editor'
        });

        return this;
    }

    /**
     * Prompt user for scenario's new name
     *
     * @param {String} scenario The scenario to rename
     * @return {this}
     */
    showRenamePrompt(scenario){
        if(scenario){
            new Prompt({
                'text': Locale.t('editor.controller.ScenarioSelector.rename.prompt.text', "Enter the scenario's new name"),
                'default': scenario,
                'confirmLabel': Locale.t('editor.controller.ScenarioSelector.rename.prompt.confirmLabel', 'Rename'),
                'onConfirm': this.onRenameConfirm.bind(this, scenario),
                'onCancel': this.onRenameCancel.bind(this),
                'autoHide': false,
                'parent': '.metaScore-editor'
            });
        }

        return this;
    }

    /**
     * Prompt user for scenario's clone name
     *
     * @param {String} scenario The scenario to clone
     * @return {this}
     */
    showClonePrompt(scenario){
        if(scenario){
            new Prompt({
                'text': Locale.t('editor.controller.ScenarioSelector.clone.prompt.text', "Enter the scenario's name"),
                'confirmLabel': Locale.t('editor.controller.ScenarioSelector.clone.prompt.confirmLabel', 'Clone'),
                'onConfirm': this.onCloneConfirm.bind(this, scenario),
                'onCancel': this.onCloneCancel.bind(this),
                'autoHide': false,
                'parent': '.metaScore-editor'
            });
        }

        return this;
    }

    /**
     * Ask user for scenario delete confirmation
     *
     * @param {String} scenario The scenario to delete
     * @return {this}
     */
    showDeleteConfirm(scenario){
        if(scenario){
            new Confirm({
                'text': Locale.t('editor.controller.ScenarioSelector.delete.confirm.text', 'Are you sure you want to delete the <em>@scenario</em> scenario?', {'@scenario': scenario}),
                'confirmLabel': Locale.t('editor.controller.ScenarioSelector.delete.confirm.confirmLabel', 'Delete'),
                'onConfirm': this.onDeleteConfirm.bind(this, scenario),
                'parent': '.metaScore-editor'
            });
        }

        return this;
    }

    /**
     * Set the active scenario item
     *
     * @param {String} scenario The scenario's name
     * @param {Boolean} supressEvent Whether to prevent the custom scenarioactivate event from firing
     */
    setActiveScenario(scenario, supressEvent){
        const previous_active_item = this.list.child('.active');
        const previous_scenario = previous_active_item.count() > 0 ? previous_active_item.data('scenario') : null;

        if(scenario !== previous_scenario){
            if(previous_scenario){
                previous_active_item.removeClass('active');
            }

            const item = this.getScenarioItem(scenario);
            if(item){
                item.addClass('active');
                this.clone_btn.enable();

                if(supressEvent !== true){
                    this.triggerEvent('scenarioactivate', {'scenario': scenario});
                }
            }
            else{
                this.clone_btn.disable();
            }
        }

        return this;
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
     * Rename a scenario
     *
     * @param {String} old_scenario The scenario current name
     * @param {String} new_scenario The scenario new name
     * @param {Boolean} supressEvent Whether to prevent the scenariorename event from firing
     * @return {this}
     */
    renameScenario(old_scenario, new_scenario, supressEvent){
        const item = this.getScenarioItem(old_scenario);
        if(item){
            item.text(new_scenario).data('scenario', new_scenario);

            if(supressEvent !== true){
                this.triggerEvent('scenariorename', {'old': old_scenario, 'new': new_scenario});
            }
        }

        return this;
    }

    /**
     * Clone a scenario
     *
     * @param {String} original The original scenario's name
     * @param {String} clone The new scenario's name
     * @param {Boolean} supressEvent Whether to prevent the scenariorename event from firing
     * @return {this}
     */
    cloneScenario(original, clone, supressEvent){
        this.addScenario(clone, true);

        if(supressEvent !== true){
            this.triggerEvent('scenarioclone', {'original': original, 'clone': clone});
        }

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
            if(supressEvent !== true){
                this.triggerEvent('scenarioremove', {'scenario': scenario});
            }

            item.remove();
        }

        return this;
    }

    /**
     * Clear the list of scenarios
     *
     * @return {this}
     */
    clear(){
        this.list.empty();
        this.updateScrollButtons();

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
