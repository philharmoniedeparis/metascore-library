/**
 * @module Player
 */

metaScore.namespace('player.component').Controller = (function () {

    /**
     * A controller component
     *
     * @class Controller
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Controller(configs) {
        // call parent constructor
        Controller.parent.call(this, configs);
    }

    metaScore.player.Component.extend(Controller);

    Controller.defaults = {
        'properties': {
            'locked': {
                'type': 'Checkbox',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Controller.locked', 'Locked?')
                },
                'getter': function(skipDefault){
                    return this.data('locked') === "true";
                },
                'setter': function(value){
                    this.data('locked', value ? "true" : null);
                }
            },
            'x': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Controller.x', 'X'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('left'), 10);
                },
                'setter': function(value){
                    this.css('left', value +'px');
                }
            },
            'y': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Controller.y', 'Y'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('top'), 10);
                },
                'setter': function(value){
                    this.css('top', value +'px');
                }
            },
            'width': {
                'editable': false,
                'getter': function(skipDefault){
                    return parseInt(this.css('width'), 10);
                }
            },
            'height': {
                'editable': false,
                'getter': function(skipDefault){
                    return parseInt(this.css('height'), 10);
                }
            },
            'z-index': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Controller.z-index', 'Display index')
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('z-index', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('z-index', value);
                }
            },
            'border-radius': {
                'type': 'BorderRadius',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Controller.border-radius', 'Border radius')
                },
                'getter': function(skipDefault){
                    return this.css('border-radius', undefined, skipDefault);
                },
                'setter': function(value){
                    this.css('border-radius', value);
                }
            }
        }
    };

    /**
     * Setup the controller's UI
     * 
     * @method setupUI
     * @private
     */
    Controller.prototype.setupUI = function(){
        // call parent function
        Controller.parent.prototype.setupUI.call(this);

        this.addClass('controller');

        this.timer = new metaScore.Dom('<div/>', {'class': 'timer', 'text': '00:00.00'})
            .appendTo(this);

        this.rewind_btn = new metaScore.Dom('<button/>')
            .data('action', 'rewind');

        this.play_btn = new metaScore.Dom('<button/>')
            .data('action', 'play');

        new metaScore.Dom('<div/>', {'class': 'buttons'})
            .append(this.rewind_btn)
            .append(this.play_btn)
            .appendTo(this);
    };

    /**
     * Get the value of the controller's name property
     * 
     * @method getName
     * @return {String} The name
     */
    Controller.prototype.getName = function(){
        return '[controller]';
    };

    /**
     * Update the displayed time
     *
     * @method updateTime
     * @param {Integer} time The time value in centiseconds
     * @chainable
     */
    Controller.prototype.updateTime = function(time){
        var centiseconds = metaScore.String.pad(parseInt(time % 100, 10), 2, '0', 'left'),
            seconds = metaScore.String.pad(parseInt((time / 100) % 60, 10), 2, '0', 'left'),
            minutes = metaScore.String.pad(parseInt((time / 6000), 10), 2, '0', 'left');

        this.timer.text(minutes +':'+ seconds +'.'+ centiseconds);
        
        return this;
    };

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    Controller.prototype.setDraggable = function(draggable){

        draggable = draggable !== false;

        if(this.getProperty('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            this._draggable = new metaScore.Draggable({
                'target': this,
                'handle': this.child('.timer'),
                'limits': {
                    'top': 0,
                    'left': 0
                }
            });
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this._draggable;

    };

    return Controller;

})();