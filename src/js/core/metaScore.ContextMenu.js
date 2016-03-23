/**
 * @module Core
 */

metaScore.ContextMenu = (function(){

    /**
     * Fired when a task is clicked
     *
     * @event taskclick
     * @param {Object} action The task's action
     * @param {Object} context The task's context
     */
    var EVT_TASKCLICK = 'taskclick';

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
    function ContextMenu(configs) {
        var list;
        
        this.configs = this.getConfigs(configs);

        // call parent constructor
        ContextMenu.parent.call(this, '<div/>', {'class': 'contextmenu'});
        
        this.tasks = {};
        this.context = null;

        // fix event handlers scope
        this.onTargetContextmenu = metaScore.Function.proxy(this.onTargetContextmenu, this);
        this.onTargetMousedown = metaScore.Function.proxy(this.onTargetMousedown, this);
        this.onTaskClick = metaScore.Function.proxy(this.onTaskClick, this);
        
        list = new metaScore.Dom('<ul/>')
            .appendTo(this);
        
        metaScore.Object.each(this.configs.items, function(key, task){
            this.addTask(key, task, list);
        }, this);
        
        if(this.configs.target){
            this.setTarget(this.configs.target);
        }
        
        this
            .addListener('contextmenu', metaScore.Function.proxy(this.onContextmenu, this))
            .addListener('mousedown', metaScore.Function.proxy(this.onMousedown, this))
            .addDelegate('li', 'mouseover', metaScore.Function.proxy(this.onItemMouseover, this))
            .hide()
            .enable();
    }

    metaScore.Dom.extend(ContextMenu);

    ContextMenu.defaults = {
        'target': 'body',
        'items': {}
    };

    /**
     * Mousedown event handler
     *
     * @method onMousedown
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onContextmenu = function(evt){        
        if(!evt.shiftKey){
            evt.preventDefault();
        }
        
        evt.stopPropagation();
        
    };

    /**
     * Mousedown event handler
     *
     * @method onMousedown
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onMousedown = function(evt){
        evt.stopPropagation();
    };

    /**
     * Task mouseover event handler
     *
     * @method onItemMouseover
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onItemMouseover = function(evt){
        var item = new metaScore.Dom(evt.target),
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
    };

    /**
     * Target's contextmenu event handler
     *
     * @method onTargetContextmenu
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onTargetContextmenu = function(evt){
        var x, y;
        
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
    };

    /**
     * Target's mousedown event handler
     *
     * @method onTargetMousedown
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onTargetMousedown = function(evt){    
        this.hide();
    };

    /**
     * Task's click event handler
     *
     * @method onTaskClick
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onTaskClick = function(evt){
        var action = new metaScore.Dom(evt.target).data('action');
            
        if(action in this.tasks){
            if(this.tasks[action].callback){
                this.tasks[action].callback(this.context);
            }
            
            this.triggerEvent(EVT_TASKCLICK, {'action': action, 'context': this.context}, true, false);
        }
        
        this.hide();
        
        evt.stopPropagation();
    };

    /**
     * Sets the target element
     *
     * @method setTarget
     * @param {Mixed} target The HTMLElement, Dom instance, or CSS selector to which the context menu is attached
     * @chainable
     */
    ContextMenu.prototype.setTarget = function(target){        
        this.disable();
        
        this.target = target;
        
        if(!(this.target instanceof metaScore.Dom)){
            this.target = new metaScore.Dom(this.target);
        }
        
        return this;
    };

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
    ContextMenu.prototype.addTask = function(action, configs, parent){
        var task, subtasks;
            
        task = new metaScore.Dom('<li/>', {'data-action': action})
            .addListener('click', this.onTaskClick)
            .appendTo(parent);
            
        if('text' in configs){
            task.text(configs.text);
        }
            
        if('class' in configs){
            task.addClass(configs.class);
        }
        
        if('items' in configs){
            task.addClass('has-subitems');
            
            subtasks = new metaScore.Dom('<ul/>')
                .appendTo(task);
            
            metaScore.Object.each(configs.items, function(subkey, subtask){
                this.addTask(subkey, subtask, subtasks);
            }, this);
        }
        
        this.tasks[action] = {
            'toggler': 'toggler' in configs ? configs.toggler : true,
            'callback': 'callback' in configs ? configs.callback : null,
            'el': task
        };
            
        return this;
    };

    /**
     * Add a separator
     *
     * @method addSeparator
     * @chainable
     */
    ContextMenu.prototype.addSeparator = function(){
        new metaScore.Dom('<li/>', {'class': 'separator'})
            .appendTo(this);
            
        return this;
    };

    /**
     * Show the menu
     *
     * @method show
     * @param {HTMLElement} el The element on which the contextmenu event was triggered
     * @param {Number} x The horizontal position at which the menu should be shown
     * @param {Number} y The vertical position at which the menu should be shown
     * @chainable
     */
    ContextMenu.prototype.show = function(el, x, y){
        var window, window_width, window_height,
            menu_el, menu_width, menu_height;
        
        this.context = el;
    
        metaScore.Object.each(this.tasks, function(key, task){
            var active = metaScore.Var.is(task.toggler, 'function') ? task.toggler(this.context) === true : task.toggler !== false;
            
            if(active){
                task.el.removeClass('disabled');
            }
            else{
                task.el.addClass('disabled');
            }
        }, this);
    
        this.target.addListener('mousedown', this.onTargetMousedown);

        // call parent function
        ContextMenu.parent.prototype.show.call(this);
        
        menu_el = this.get(0);
        window = metaScore.Dom.getElementWindow(this.context);
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
            .css('left', x +'px')
            .css('top', y +'px');
        
        return this;
    };

    /**
     * Hide the menu
     *
     * @method hide
     * @chainable
     */
    ContextMenu.prototype.hide = function(){
        if(this.target){
            this.target.removeListener('mousedown', this.onTargetMousedown);
        }
        
        this.context = null;

        // call parent function
        ContextMenu.parent.prototype.hide.call(this);
        
        return this;
    };

    /**
     * Enable the menu
     * 
     * @method enable
     * @chainable
     */
    ContextMenu.prototype.enable = function(){        
        if(this.target){
            this.enabled = true;
            
            this.target.addListener('contextmenu', this.onTargetContextmenu);
        }

        return this;
    };

    /**
     * Disable the menu
     * 
     * @method disable
     * @chainable
     */
    ContextMenu.prototype.disable = function(){
        if(this.target){
            this.target.removeListener('contextmenu', this.onTargetContextmenu);
        }
        
        this.hide();

        this.enabled = false;

        return this;
    };

    return ContextMenu;

})();