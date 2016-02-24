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
     */
    function ContextMenu(configs) {
        this.configs = this.getConfigs(configs);
        
        if(!(this.configs.target instanceof metaScore.Dom)){
            this.configs.target = new metaScore.Dom(this.configs.target);
        }

        // call parent constructor
        ContextMenu.parent.call(this, '<ul/>', {'class': 'contextmenu'});
        
        this.tasks = {};
        this.context = null;

        // fix event handlers scope
        this.onTargetContextmenu = metaScore.Function.proxy(this.onTargetContextmenu, this);
        this.onTargetMousedown = metaScore.Function.proxy(this.onTargetMousedown, this);
        this.onTaskClick = metaScore.Function.proxy(this.onTaskClick, this);
        
        this.addListener('mousedown', metaScore.Function.proxy(this.onMousedown, this));
        
        this.hide();
        this.enable();
    }

    metaScore.Dom.extend(ContextMenu);

    ContextMenu.defaults = {
        'target': 'body'
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
     * Target's contextmenu event handler
     *
     * @method onTargetContextmenu
     * @private
     * @param {Event} evt The event object
     */
    ContextMenu.prototype.onTargetContextmenu = function(evt){
        var x, y;
        
        if(evt.ctrlKey){
            return;
        }
        
        if(evt.pageX || evt.pageY){
            x = evt.pageX;
            y = evt.pageY;
        }
        else if(evt.clientX || evt.clientY){
            x = evt.clientX + document.body.scrollLeft;
            y = evt.clientY + document.body.scrollTop;
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
            this.triggerEvent(EVT_TASKCLICK, {'action': action, 'context': this.context}, true, false);
        }
        
        this.hide();
    };

    /**
     * Add a task
     *
     * @method addTask
     * @param {String} action The task's associated action
     * @param {String} text The task's label
     * @param {Mixed} toggler A boolean or a callback function used to determine if the task is active
     * @param {HTMLElement} toggler.context The element on which the contextmenu event was triggered
     * @chainable
     */
    ContextMenu.prototype.addTask = function(action, text, toggler){
        var el = new metaScore.Dom('<li/>', {'data-action': action, 'text': text})
            .addListener('click', this.onTaskClick)
            .appendTo(this);
            
        this.tasks[action] = {
            'toggler': toggler,
            'el': el
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
    
        this.configs.target.addListener('mousedown', this.onTargetMousedown);
        
        this
            .css('left', x +'px')
            .css('top', y +'px');

        // call parent function
        ContextMenu.parent.prototype.show.call(this);
        
        return this;
    };

    /**
     * Hide the menu
     *
     * @method hide
     * @chainable
     */
    ContextMenu.prototype.hide = function(){
        this.configs.target.removeListener('mousedown', this.onTargetMousedown);
        
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
        this.enabled = true;
        
        this.configs.target.addListener('contextmenu', this.onTargetContextmenu);

        return this;
    };

    /**
     * Disable the menu
     * 
     * @method disable
     * @chainable
     */
    ContextMenu.prototype.disable = function(){        
        this.configs.target.removeListener('contextmenu', this.onTargetContextmenu);
        
        this.hide();

        this.enabled = false;

        return this;
    };

    return ContextMenu;

})();