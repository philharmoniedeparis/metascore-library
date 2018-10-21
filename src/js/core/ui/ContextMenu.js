import {isFunction} from '../utils/Var';
import Dom from '../Dom';

import '../../../css/core/ui/ContextMenu.less';

/**
 * Fired before the menu is shows
 *
 * @event beforeshow
 * @param {Object} original_event The original contextmenu event
 */
const EVT_BEFORESHOW = 'beforeshow';

/**
 * Fired when a task is clicked
 *
 * @event taskclick
 * @param {Object} action The task's action
 * @param {Object} context The task's context
 */
const EVT_TASKCLICK = 'taskclick';

/**
 * A class for creating context menus
 */
export default class ContextMenu extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.target='body'] The HTMLElement, Dom instance, or CSS selector to which the context menu is attached
     * @param {Mixed} [configs.items={}] The list of items and subitems
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'contextmenu'});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The list of tasks
         * @type {Object}
         */
        this.tasks = {};

        // fix event handlers scope
        this.onTargetContextmenu = this.onTargetContextmenu.bind(this);
        this.onTargetMousedown = this.onTargetMousedown.bind(this);
        this.onWindowKeyup = this.onWindowKeyup.bind(this);
        this.onTaskClick = this.onTaskClick.bind(this);

        const list = new Dom('<ul/>')
            .appendTo(this);

        if(this.configs.items){
            Object.entries(this.configs.items).forEach(([key, task]) => {
                this.addTask(key, task, list);
            });
        }

        if(this.configs.target){
            this.setTarget(this.configs.target);
        }

        this
            .addListener('contextmenu', this.onContextmenu.bind(this))
            .addListener('mousedown', this.onMousedown.bind(this))
            .addDelegate('li', 'mouseover', this.onItemMouseover.bind(this))
            .hide()
            .enable();
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'target': 'body',
            'items': {}
        };
    }

    /**
     * Mousedown event handler
     *
     * @method onMousedown
     * @private
     * @param {Event} evt The event object
     */
    onContextmenu(evt){
        if(!evt.ctrlKey){
            evt.preventDefault();
        }

        evt.stopPropagation();
    }

    /**
     * Mousedown event handler
     *
     * @method onMousedown
     * @private
     * @param {Event} evt The event object
     */
    onMousedown(evt){
        evt.stopPropagation();
    }

    /**
     * Task mouseover event handler
     *
     * @method onItemMouseover
     * @private
     * @param {Event} evt The event object
     */
    onItemMouseover(evt){
        const item = new Dom(evt.target);

        if(!item.hasClass('has-subitems')){
            return;
        }

        const container = this.parents();
        const conteiner_width = container.get(0).offsetWidth;
        const conteiner_offset = container.offset();
        const subitems = item.child('ul').removeClass('left');
        const subitems_width = subitems.get(0).offsetWidth;
        const subitems_offset = subitems.offset();

        subitems.toggleClass('left', subitems_offset.left - conteiner_offset.left + subitems_width > conteiner_width);
    }

    /**
     * Target's contextmenu event handler
     *
     * @method onTargetContextmenu
     * @private
     * @param {Event} evt The event object
     */
    onTargetContextmenu(evt){
        let x = 0;
        let y = 0;

        if(this.triggerEvent(EVT_BEFORESHOW, {'original_event': evt}) === false){
            return;
        }

        if(evt.ctrlKey){
            return;
        }

        if(evt.pageX || evt.pageY){
            x = evt.pageX;
            y = evt.pageY;
        }
        else if(evt.clientX || evt.clientY){
            x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        this.show(evt.target, x, y);

        evt.preventDefault();
    }

    /**
     * Target's mousedown event handler
     *
     * @method onTargetMousedown
     * @private
     */
    onTargetMousedown(){
        this.hide();
    }

    /**
     * Window's keyup event handler
     *
     * @method onWindowKeyup
     * @private
     */
    onWindowKeyup(evt){
        if(evt.key === "Escape"){
            this.hide();
        }
    }

    /**
     * Task's click event handler
     *
     * @method onTaskClick
     * @private
     * @param {Event} evt The event object
     */
    onTaskClick(evt){
        const action = new Dom(evt.target).data('action');

        if(action in this.tasks){
            if('callback' in this.tasks[action]){
                this.tasks[action].callback(this.context);
                this.hide();
            }

            this.triggerEvent(EVT_TASKCLICK, {'action': action, 'context': this.context}, true, false);
        }

        evt.stopPropagation();
    }

    /**
     * Set the element on which the context menu is attached
     *
     * @method setTarget
     * @param {Mixed} target The HTMLElement, Dom instance, or CSS selector to which the context menu is attached
     * @chainable
     */
    setTarget(target){
        this.disable();

        /**
         * The target element
         * @type {Dom}
         */
        this.target = target instanceof Dom ? target : new Dom(target);

        return this;
    }

    /**
     * Add a task
     *
     * @method addTask
     * @param {String} action The task's associated action
     * @param {Object} configs The task's configs
     * @param {String} [configs.text] The task's text
     * @param {Mixed} [configs.toggler=true] A boolean or a callback function used to determine if the task is active
     * @param {Mixed} [parent] The parent element to append the task to
     * @chainable
     */
    addTask(action, configs, parent){
        const task = new Dom('<li/>', {'data-action': action})
            .appendTo(parent);

        this.tasks[action] = {
            'toggler': 'toggler' in configs ? configs.toggler : true,
            'el': task
        };

        if('text' in configs){
            if(isFunction(configs.text)){
                this.tasks[action].text = configs.text;
            }
            else{
                task.text(configs.text);
            }
        }

        if('callback' in configs && isFunction(configs.callback)){
            this.tasks[action].callback = configs.callback;
            task.addListener('click', this.onTaskClick);
        }
        else{
            task.addClass('no-callback');
        }

        if('class' in configs){
            task.addClass(configs.class);
        }

        if('items' in configs){
            task.addClass('has-subitems');

            const subtasks = new Dom('<ul/>')
                .appendTo(task);

			Object.entries(configs.items).forEach(([subkey, subtask]) => {
                this.addTask(subkey, subtask, subtasks);
            });
        }

        return this;
    }

    /**
     * Add a separator
     *
     * @method addSeparator
     * @chainable
     */
    addSeparator() {
        new Dom('<li/>', {'class': 'separator'})
            .appendTo(this);

        return this;
    }

    /**
     * Show the menu
     *
     * @method show
     * @param {HTMLElement} el The element on which the contextmenu event was triggered
     * @param {Number} x The horizontal position at which the menu should be shown
     * @param {Number} y The vertical position at which the menu should be shown
     * @chainable
     */
    show(el, x, y){
        let _x = x;
        let _y = y;

        /**
         * The element that triggered the context menu
         * @type {Dom}
         */
        this.context = new Dom(el);

        if(this.tasks){
            Object.entries(this.tasks).forEach(([, task]) => {
                const active = isFunction(task.toggler) ? task.toggler(this.context) === true : task.toggler !== false;

                if('text' in task && isFunction(task.text)){
                    task.el.text(task.text(this.context));
                }

                if(active){
                    task.el.removeClass('disabled');
                }
                else{
                    task.el.addClass('disabled');
                }
            });
        }

        this.target.addListener('mousedown', this.onTargetMousedown);

        // call parent function
        super.show();

        Dom.addListener(Dom.getElementWindow(this.target.get(0)), 'keyup', this.onWindowKeyup);

        const menu_el = this.get(0);
        const window = Dom.getElementWindow(el);
        const window_width = window.innerWidth;
        const window_height = window.innerHeight;
        const menu_width = menu_el.offsetWidth;
        const menu_height = menu_el.offsetHeight;

        if((menu_width + _x) > window_width){
            _x = window_width - menu_width;
        }

        if((menu_height + _y) > window_height){
            _y = window_height - menu_height;
        }

        this
            .css('left', `${_x}px`)
            .css('top', `${_y}px`);

        return this;
    }

    /**
     * Hide the menu
     *
     * @method hide
     * @chainable
     */
    hide() {
        if(this.target){
            this.target.removeListener('mousedown', this.onTargetMousedown);

            const window = Dom.getElementWindow(this.target.get(0));
            if(window){
                Dom.removeListener(window, 'keyup', this.onWindowKeyup);
            }
        }

        delete this.context;

        // call parent function
        super.hide();

        return this;
    }

    /**
     * Enable the menu
     *
     * @method enable
     * @chainable
     */
    enable() {
        if(this.target){
            /**
             * Whether the context menu is enabled
             * @type {Boolean}
             */
            this.enabled = true;

            this.target.addListener('contextmenu', this.onTargetContextmenu);
        }

        return this;
    }

    /**
     * Disable the menu
     *
     * @method disable
     * @chainable
     */
    disable() {
        if(this.target){
            this.target.removeListener('contextmenu', this.onTargetContextmenu);
        }

        this.hide();

        this.enabled = false;

        return this;
    }

}
