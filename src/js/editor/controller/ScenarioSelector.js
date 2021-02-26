import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Button from '../../core/ui/Button';
import Overlay from '../../core/ui/Overlay';
import Prompt from '../../core/ui/overlay/Prompt';
import Confirm from '../../core/ui/overlay/Confirm';
import ContextMenu from '../../core/ui/ContextMenu';
import ResizeObserver from 'resize-observer-polyfill';
import {escapeHTML} from '../../core/utils/String';
import { History } from '../UndoRedo';

import arrow_icon from '../../../img/editor/controller/scenarioselector/arrow.svg?svg-sprite';
import add_icon from '../../../img/editor/controller/scenarioselector/add.svg?svg-sprite';
import clone_icon from '../../../img/editor/controller/scenarioselector/clone.svg?svg-sprite';

import {className} from '../../../css/editor/controller/ScenarioSelector.scss';

/**
 * A scenario selector
 */
export default class ScenarioSelector extends Dom {

    /**
     * Instantiate
     *
     * @param {Editor} editor The Editor instance
     */
    constructor(editor) {
        // call parent constructor
        super('<div/>', {'class': `scenario-selector ${className}`});

        /**
         * A reference to the Editor instance
         * @type {Editor}
         */
        this.editor = editor
            .addListener('playerload', this.onEditorPlayerLoad.bind(this));

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
                        const id = context.el.data('scenario');
                        const scenario = this.editor.getPlayer().getScenarios().find((s) => s.getId() === id);
                        if(scenario){
                            this.showRenamePrompt(scenario);
                        }
                    },
                    'toggler': (context) => {
                        return context.el.is('.item');
                    }
                },
                'clone': {
                    'text': Locale.t('editor.controller.ScenarioSelector.contextmenu.clone', 'Clone scenario'),
                    'callback': (context) => {
                        const id = context.el.data('scenario');
                        const scenario = this.editor.getPlayer().getScenarios().find((s) => s.getId() === id);
                        if(scenario){
                            this.showClonePrompt(scenario);
                        }
                    },
                    'toggler': (context) => {
                        return context.el.is('.item');
                    }
                },
                'delete': {
                    'text': Locale.t('editor.controller.ScenarioSelector.contextmenu.delete', 'Delete scenario'),
                    'callback': (context) => {
                        const id = context.el.data('scenario');
                        const scenario = this.editor.getPlayer().getScenarios().find((s) => s.getId() === id);
                        if(scenario){
                            this.showDeleteConfirm(scenario);
                        }
                    },
                    'toggler': (context) => {
                        return context.el.is('.item') && this.list.children('.item').count() > 1;
                    }
                }
            }})
            .appendTo(this.editor);

        const resize_observer = new ResizeObserver(this.onListResize.bind(this));
        resize_observer.observe(this.list.get(0));
    }

    /**
     * Editor playerload event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onEditorPlayerLoad(evt){
        const player = evt.detail.player;
        const active_scenario = player.getActiveScenario();

        this.clear();

        player.getScenarios().forEach((scenario) => {
            this.addScenarioItem(scenario, true);
            if(scenario === active_scenario){
                this.setActiveScenarioItem(active_scenario);
            }
        });

        player
            .addListener('componentadd', this.onPlayerComponentAdd.bind(this))
            .addListener('componentremove', this.onPlayerComponentRemove.bind(this))
            .addListener('scenariochange', this.onPlayerScenarioChange.bind(this))
            .addDelegate('.metaScore-component', 'propchange', this.onComponentPropChange.bind(this), true);
    }

    /**
     * Player componentadd event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onPlayerComponentAdd(evt){
        const component = evt.detail.component;

        if(component.instanceOf('Scenario')){
            this.addScenarioItem(component);
        }
    }

    /**
     * Player componentremove event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onPlayerComponentRemove(evt){
        const component = evt.detail.component;

        if(component.instanceOf('Scenario')){
            this.removeScenarioItem(component);
        }
    }

    /**
     * Player scenariochange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onPlayerScenarioChange(evt){
        this.setActiveScenarioItem(evt.detail.scenario);
    }

    /**
     * Component propchange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentPropChange(evt){
        const component = evt.detail.component;
        const property = evt.detail.property;

        if(component.instanceOf('Scenario') && property === 'name'){
            this.updateScenarioItem(component);
        }
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
                    const id = this.list.child('.active').data('scenario');
                    const scenario = this.editor.getPlayer().getScenarios().find((s) => s.getId() === id);
                    if(scenario){
                        this.showClonePrompt(scenario);
                    }
                }
                break;
        }
    }

    /**
     * Rename prompt onConfirm callback
     *
     * @private
     * @param {Scenario} scenario The scenario
     * @param {String} name The scenario's new name
     * @param {Overlay} overlay The overlay
     */
    onRenameConfirm(scenario, name, overlay){
        const previous_name = scenario.getName();

        if(name && name !== previous_name){
            const existant = this.editor.getPlayer().getScenarios().find((s) => s.getName() === name);
            if(existant){
                new Overlay({
                    'text': Locale.t('editor.controller.ScenarioSelector.exists.msg', 'A scenario with that name already exists.'),
                    'buttons': {
                        'ok': Locale.t('editor.controller.ScenarioSelector.exists.ok', 'OK'),
                    },
                    'parent': this.editor
                });
            }
            else{
                scenario.setPropertyValue('name', name);

                History.add({
                    'undo': () => {
                        scenario.setPropertyValue('name', previous_name);
                    },
                    'redo': () => {
                        scenario.setPropertyValue('name', name);
                    }
                });

                overlay.hide();
            }
        }
        else{
            overlay.hide();
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
     * @param {Scenario} scenario The scenario to clone
     * @param {String} name The new scenario's name
     * @param {Overlay} overlay The overlay
     */
    onCloneConfirm(scenario, name, overlay){
        const existant = this.editor.getPlayer().getScenarios().find((s) => s.getName() === name);
        if(existant){
            new Overlay({
                'text': Locale.t('editor.controller.ScenarioSelector.exists.msg', 'A scenario with that name already exists.'),
                'buttons': {
                    'ok': Locale.t('editor.controller.ScenarioSelector.exists.ok', 'OK'),
                },
                'parent': this.editor
            });
        }
        else{
            const player = this.editor.getPlayer();
            const previous_scenario = player.getActiveScenario();

            const clone = player.addScenario(Object.assign(scenario.getPropertyValues(true), {'name': name}));
            player.setActiveScenario(clone);

            History.add({
                'undo': () => {
                    player.setActiveScenario(previous_scenario);
                    clone.remove();
                },
                'redo': () => {
                    player.addScenario(clone);
                    player.setActiveScenario(clone);
                }
            });

            overlay.hide();
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
     * @param {Scenario} scenario The scenario
     */
    onDeleteConfirm(scenario){
        const player = this.editor.getPlayer();
        const active = scenario.isActive();

        scenario.remove();
        if(active){
            player.setActiveScenario(null);
        }

        History.add({
            'undo': () => {
                player.addScenario(scenario);
                if(active){
                    player.setActiveScenario(scenario);
                }
            },
            'redo': () => {
                scenario.remove();
                if(active){
                    player.setActiveScenario(null);
                }
            }
        });
    }

    /**
     * Add prompt onConfirm callback
     *
     * @private
     * @param {String} name The scenario's name
     * @param {Overlay} overlay The overlay
     */
    onAddConfirm(name, overlay){
        if(name){
            const existant = this.editor.getPlayer().getScenarios().find((s) => s.getName() === name);
            if(existant){
                new Overlay({
                    'text': Locale.t('editor.controller.ScenarioSelector.exists.msg', 'A scenario with that name already exists.'),
                    'buttons': {
                        'ok': Locale.t('editor.controller.ScenarioSelector.exists.ok', 'OK'),
                    },
                    'parent': this.editor
                });
            }
            else{
                const player = this.editor.getPlayer();
                const previous_scenario = player.getActiveScenario();

                const scenario = player.addScenario({'name': name});
                player.setActiveScenario(scenario);

                History.add({
                    'undo': () => {
                        scenario.remove();
                        player.setActiveScenario(previous_scenario);
                    },
                    'redo': () => {
                        player.addScenario(scenario);
                        player.setActiveScenario(scenario);
                    }
                });

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
        const id = Dom.data(evt.target, 'scenario');
        const player = this.editor.getPlayer();
        const scenario = player.getScenarios().find((s) => s.getId() === id);
        const previous_scenario = player.getActiveScenario();

        player.setActiveScenario(scenario);

        History.add({
            'undo': () => {
                player.setActiveScenario(previous_scenario);
            },
            'redo': () => {
                player.setActiveScenario(scenario);
            }
        });
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
            'parent': this.editor
        });

        return this;
    }

    /**
     * Prompt user for scenario's new name
     *
     * @param {Scenario} scenario The scenario to rename
     * @return {this}
     */
    showRenamePrompt(scenario){
        new Prompt({
            'text': Locale.t('editor.controller.ScenarioSelector.rename.prompt.text', "Enter the scenario's new name"),
            'default': scenario.getName(),
            'confirmLabel': Locale.t('editor.controller.ScenarioSelector.rename.prompt.confirmLabel', 'Rename'),
            'onConfirm': this.onRenameConfirm.bind(this, scenario),
            'onCancel': this.onRenameCancel.bind(this),
            'autoHide': false,
            'parent': this.editor
        });

        return this;
    }

    /**
     * Prompt user for scenario's clone name
     *
     * @param {Scenario} scenario The scenario to clone
     * @return {this}
     */
    showClonePrompt(scenario){
        new Prompt({
            'text': Locale.t('editor.controller.ScenarioSelector.clone.prompt.text', "Enter the scenario's name"),
            'confirmLabel': Locale.t('editor.controller.ScenarioSelector.clone.prompt.confirmLabel', 'Clone'),
            'onConfirm': this.onCloneConfirm.bind(this, scenario),
            'onCancel': this.onCloneCancel.bind(this),
            'autoHide': false,
            'parent': this.editor
        });

        return this;
    }

    /**
     * Ask user for scenario delete confirmation
     *
     * @param {Scenario} scenario The scenario to delete
     * @return {this}
     */
    showDeleteConfirm(scenario){
        new Confirm({
            'text': Locale.t('editor.controller.ScenarioSelector.delete.confirm.text', 'Are you sure you want to delete the <em>@scenario</em> scenario?', {'@scenario': escapeHTML(scenario.getName())}),
            'confirmLabel': Locale.t('editor.controller.ScenarioSelector.delete.confirm.confirmLabel', 'Delete'),
            'onConfirm': this.onDeleteConfirm.bind(this, scenario),
            'parent': this.editor
        });

        return this;
    }

    /**
     * Set the active scenario item
     *
     * @param {String} scenario The scenario's name
     */
    setActiveScenarioItem(scenario){
        this.list.child('.active').removeClass('active');

        const item = this.getScenarioItem(scenario);
        if(item){
            item.addClass('active');
            this.clone_btn.enable();
        }
        else{
            this.clone_btn.disable();
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
        const item = this.list.child(`[data-scenario="${scenario.getId()}"]`);
        return item.count() > 0 ? item : null;
    }

    /**
     * Add a scenario
     *
     * @param {String} scenario The scenario
     * @return {this}
     */
    addScenarioItem(scenario){
        new Dom('<li/>', {'class': 'item', 'text': escapeHTML(scenario.getName())})
            .data('scenario', scenario.getId())
            .appendTo(this.list);

        this.updateScrollButtons();

        return this;
    }

    /**
     * Update a scenario's item
     *
     * @param {String} scenario The scenario
     * @return {this}
     */
    updateScenarioItem(scenario){
        const item = this.getScenarioItem(scenario);
        if(item){
            item.text(escapeHTML(scenario.getName()));
        }

        return this;
    }

    /**
     * Remoave a scenario
     *
     * @param {Scenario} scenario The scenario
     * @return {this}
     */
    removeScenarioItem(scenario){
        const item = this.getScenarioItem(scenario);
        if(item){
            item.remove();
            this.updateScrollButtons();
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
