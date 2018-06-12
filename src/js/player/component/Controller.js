import Component from '../Component';
import Dom from '../../core/Dom';
import Draggable from '../../core/ui/Draggable';
import Locale from '../../core/Locale';
import {pad} from '../../core/utils/String';

/**
 * A controller component
 */
export default class Controller extends Component{

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'properties': {
                'locked': {
                    'type': 'Checkbox',
                    'configs': {
                        'label': Locale.t('player.component.Controller.locked', 'Locked?')
                    },
                    'getter': function(){
                        return this.data('locked') === "true";
                    },
                    'setter': function(value){
                        this.data('locked', value ? "true" : null);
                    }
                },
                'x': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Controller.x', 'X'),
                        'spinDirection': 'vertical'
                    },
                    'getter': function(){
                        return parseInt(this.css('left'), 10);
                    },
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Controller.y', 'Y'),
                        'flipSpinButtons': true
                    },
                    'getter': function(){
                        return parseInt(this.css('top'), 10);
                    },
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    }
                },
                'width': {
                    'editable': false,
                    'getter': function(){
                        return parseInt(this.css('width'), 10);
                    }
                },
                'height': {
                    'editable': false,
                    'getter': function(){
                        return parseInt(this.css('height'), 10);
                    }
                },
                'z-index': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Controller.z-index', 'Display index')
                    },
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('z-index', undefined, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.css('z-index', value);
                    }
                },
                'border-radius': {
                    'type': 'BorderRadius',
                    'configs': {
                        'label': Locale.t('player.component.Controller.border-radius', 'Border radius')
                    },
                    'getter': function(skipDefault){
                        return this.css('border-radius', undefined, skipDefault);
                    },
                    'setter': function(value){
                        this.css('border-radius', value);
                    }
                }
            }
        });
    }

    static getType(){
        return 'Controller';
    }

    /**
     * Setup the controller's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        this.addClass('controller');

        this.timer = new Dom('<div/>', {'class': 'timer', 'text': '00:00.00'})
            .appendTo(this);

        this.rewind_btn = new Dom('<button/>')
            .data('action', 'rewind');

        this.play_btn = new Dom('<button/>')
            .data('action', 'play');

        new Dom('<div/>', {'class': 'buttons'})
            .append(this.rewind_btn)
            .append(this.play_btn)
            .appendTo(this);
    }

    /**
     * Get the value of the controller's name property
     *
     * @method getName
     * @return {String} The name
     */
    getName() {
        return '[controller]';
    }

    /**
     * Update the displayed time
     *
     * @method updateTime
     * @param {Integer} time The time value in centiseconds
     * @chainable
     */
    updateTime(time){
        let centiseconds = pad(parseInt(time % 100, 10), 2, '0', 'left'),
            seconds = pad(parseInt((time / 100) % 60, 10), 2, '0', 'left'),
            minutes = pad(parseInt((time / 6000), 10), 2, '0', 'left');

        this.timer.text(`${minutes}:${seconds}.${centiseconds}`);

        return this;
    }

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    setDraggable(draggable){

        draggable = draggable !== false;

        if(this.getProperty('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            this._draggable = new Draggable({
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

    }

}
