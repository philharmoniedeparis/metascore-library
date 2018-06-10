import {isFunction} from '../utils/Var';
import Dom from '../Dom';

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

export default class ContextMenu extends Dom{

    /**
     * A class for creating context menus
     *
     * @class ContextMenu
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.target='body'] The HTMLElement, Dom instance, or CSS selector to which the context menu is attached
     * @param {Mixed} [configs.items={}] The list of items and subitems
     */
    constructor(configs) {
        let list;

        // call parent constructor
        super('<div/>', {'class': 'contextmenu'});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.tasks = {};
        this.context = null;

        // fix event handlers scope
        this.onTargetContextmenu = this.onTargetContextmenu.bind(this);
        this.onTargetMousedown = this.onTargetMousedown.bind(this);
        this.onTaskClick = this.onTaskClick.bind(this);

        list = new Dom('<ul/>')
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
        if(!evt.shiftKey){
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
        let item = new Dom(evt.target),
            container, conteiner_width, conteiner_offset,
            subitems, subitems_width, subitems_offset;

        if(!item.hasClass('has-subitems')){
            return;
        }

        container = this.parents();
        conteiner_width = container.get(0).offsetWidth;
        conteiner_offset = container.offset();
        subitems = item.child('ul').removeClass('left');
        subitems_width = subitems.get(0).offsetWidth;
        subitems_offset = subitems.offset();

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
        let x, y;

        if(this.triggerEvent(EVT_BEFORESHOW, {'original_event': evt}) === false){
            return;
        }

        if(evt.shiftKey){
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
        else{
            x = 0;
            y = 0;
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
     * Task's click event handler
     *
     * @method onTaskClick
     * @private
     * @param {Event} evt The event object
     */
    onTaskClick(evt){
        const action = new Dom(evt.target).data('action');

        if(action in this.tasks){
            if(this.tasks[action].callback){
                this.tasks[action].callback(this.context);
                this.hide();
            }

            this.triggerEvent(EVT_TASKCLICK, {'action': action, 'context': this.context}, true, false);
        }

        evt.stopPropagation();
    }

    /**
     * Sets the target element
     *
     * @method setTarget
     * @param {Mixed} target The HTMLElement, Dom instance, or CSS selector to which the context menu is attached
     * @chainable
     */
    setTarget(target){
        this.disable();

        this.target = target;

        if(!(this.target instanceof Dom)){
            this.target = new Dom(this.target);
        }

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
        let task, subtasks;

        task = new Dom('<li/>', {'data-action': action})
            .addListener('click', this.onTaskClick)
            .appendTo(parent);

        if('text' in configs){
            task.text(configs.text);
        }

        if(!('callback' in configs)){
            task.addClass('no-callback');
        }

        if('class' in configs){
            task.addClass(configs.class);
        }

        if('items' in configs){
            task.addClass('has-subitems');

            subtasks = new Dom('<ul/>')
                .appendTo(task);

			Object.entries(configs.items).forEach(([subkey, subtask]) => {
                this.addTask(subkey, subtask, subtasks);
            });
        }

        this.tasks[action] = {
            'toggler': 'toggler' in configs ? configs.toggler : true,
            'callback': 'callback' in configs ? configs.callback : null,
            'el': task
        };

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
        let window, window_width, window_height,
            menu_el, menu_width, menu_height;

        this.context = el;

        if(this.tasks){
            Object.entries(this.tasks).forEach(([, task]) => {
                const active = isFunction(task.toggler) ? task.toggler(this.context) === true : task.toggler !== false;

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

        menu_el = this.get(0);
        window = Dom.getElementWindow(this.context);
        window_width = window.innerWidth;
        window_height = window.innerHeight;
        menu_width = menu_el.offsetWidth;
        menu_height = menu_el.offsetHeight;

        if((menu_width + x) > window_width){
            x = window_width - menu_width;
        }

        if((menu_height + y) > window_height){
            y = window_height - menu_height;
        }

        this
            .css('left', `${x}px`)
            .css('top', `${y}px`);

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
        }

        this.context = null;

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
