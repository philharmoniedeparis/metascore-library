/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Text = (function () {

    /**
     * Fired when the component is set
     *
     * @event componentset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTSET = 'componentset';

    /**
     * Fired when the component is unset
     *
     * @event componentunset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTUNSET = 'componentunset';

    /**
     * Fired when the component is locked
     *
     * @event componentlock
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTLOCK = 'componentlock';

    /**
     * Fired when the component is unlocked
     *
     * @event componentunlock
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTUNLOCK = 'componentunlock';

    /**
     * A panel for {{#crossLink "player.component.element.Text"}}{{/crossLink}} components
     * 
     * @class Text
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Text', 'buttons': [], 'selector': false]}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     * @param {Object} [configs.properties={'locked': ...}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function TextPanel(configs) {
        // call parent constructor
        TextPanel.parent.call(this, configs);

        this.addClass('text');

        // fix event handlers scope
        this.onComponentContentsDblClick = metaScore.Function.proxy(this.onComponentContentsDblClick, this);
        this.onComponentContentsClick = metaScore.Function.proxy(this.onComponentContentsClick, this);
        this.onComponentContentsKey = metaScore.Function.proxy(this.onComponentContentsKey, this);
    }

    TextPanel.defaults = {
        'toolbarConfigs': {
            'title': metaScore.Locale.t('editor.panel.Text.title', 'Text'),
            'buttons': [],
            'selector': false
        },
        'properties': {
            'locked': {
                'type': 'Boolean',
                'configs': {
                    'label': metaScore.Locale.t('editor.panel.Text.locked', 'Locked ?')
                },
                'setter': function(value){
                    if(value){
                        this.lock();
                    }
                    else{
                        this.unlock();
                    }
                }
            }
        }
    };

    metaScore.editor.Panel.extend(TextPanel);

    /**
     * The fields' valuechange event handler
     *
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    TextPanel.prototype.onFieldValueChange = function(evt){
        var component = this.getComponent(),
            name, value;

        if(!component){
            return;
        }

        name = evt.detail.field.data('name');
        value = evt.detail.value;

        if(name in this.configs.properties && 'setter' in this.configs.properties[name]){
            this.configs.properties[name].setter.call(this, value);
        }
    };

    /**
     * Set the associated component
     *
     * @method setComponent
     * @param {player.Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TextPanel.prototype.setComponent = function(component, supressEvent){
        if(component !== this.getComponent()){
            if(!component){
                return this.unsetComponent();
            }

            this.unsetComponent(true);

            this.component = component;

            this
                .setupFields(this.configs.properties)
                .updateFieldValue('locked', true)
                .addClass('has-component');

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTSET, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Unset the associated component
     *
     * @method unsetComponent
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TextPanel.prototype.unsetComponent = function(supressEvent){
        var component = this.getComponent();

        this.lock().removeClass('has-component');

        if(component){
            this.component = null;

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTUNSET, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Lock the associated component
     * 
     * @method lock
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TextPanel.prototype.lock = function(supressEvent){
        var component = this.getComponent();

        if(component){
            component.contents
                .attr('contenteditable', null)
                .addListener('dblclick', this.onComponentContentsDblClick)
                .removeListener('click', this.onComponentContentsClick)
                .removeListener('keydown', this.onComponentContentsKey)
                .removeListener('keypress', this.onComponentContentsKey)
                .removeListener('keyup', this.onComponentContentsKey);

            this.toggleFields(metaScore.Array.remove(Object.keys(this.getField()), 'locked'), false);

            if(component._draggable){
                component._draggable.enable();
            }
            if(component._resizable){
                component._resizable.enable();
            }

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTLOCK, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Unlock the associated component
     * 
     * @method unlock
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TextPanel.prototype.unlock = function(supressEvent){
        var component = this.getComponent();

        if(component){
            if(component._draggable){
                component._draggable.disable();
            }
            if(component._resizable){
                component._resizable.disable();
            }

            component.contents
                .attr('contenteditable', 'true')
                .removeListener('dblclick', this.onComponentContentsDblClick)
                .addListener('click', this.onComponentContentsClick)
                .addListener('keydown', this.onComponentContentsKey)
                .addListener('keypress', this.onComponentContentsKey)
                .addListener('keyup', this.onComponentContentsKey);

            this.toggleFields(metaScore.Array.remove(Object.keys(this.getField()), 'locked'), true);

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTUNLOCK, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Disable the panel
     *
     * @method disable
     * @chainable
     */
    TextPanel.prototype.disable = function(){
        this.lock();

        return TextPanel.parent.prototype.disable.call(this);
    };

    /**
     * The component's contents click event handler
     * 
     * @method onComponentContentsClick
     * @private
     * @param {Event} evt The event object
     */
    TextPanel.prototype.onComponentContentsClick = function(evt){
        evt.stopPropagation();
    };

    /**
     * The component's contents dblclick event handler
     * 
     * @method onComponentContentsDblClick
     * @private
     * @param {Event} evt The event object
     */
    TextPanel.prototype.onComponentContentsDblClick = function(evt){
        this.updateFieldValue('locked', false);
    };

    /**
     * The component's contents key event handler
     * 
     * @method onComponentContentsKey
     * @private
     * @param {Event} evt The event object
     */
    TextPanel.prototype.onComponentContentsKey = function(evt){
        evt.stopPropagation();
    };

    return TextPanel;

})();