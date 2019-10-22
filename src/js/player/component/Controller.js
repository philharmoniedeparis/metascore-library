import Component from '../Component';
import Dom from '../../core/Dom';
import Button from '../../core/ui/Button';
import {formatTime} from '../../core/utils/Media';

/**
 * A controller component
 */
export default class Controller extends Component{

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'resizable': false,
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'type': 'string'
                },
                'hidden': {
                    'type': 'boolean'
                },
                'scenario': {
                    'type': 'string'
                },
                'x': {
                    'type': 'number'
                },
                'y': {
                    'type': 'number'
                },
                'width': {
                    'type': 'number'
                },
                'height': {
                    'type': 'number'
                },
                'border-radius': {
                    'type': 'string'
                }
            })
        });
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('controller');

        this.setupUI();
    }

    /**
     * Setup the controller's UI
     *
     * @private
     */
    setupUI() {

        /**
         * The timer container
         * @type {Dom}
         */
        this.timer = new Dom('<div/>', {'class': 'timer', 'text': '00:00.00'})
            .appendTo(this);

        /**
         * The rewind button
         * @type {Button}
         */
        this.rewind_btn = new Button()
            .data('action', 'rewind');

        /**
         * The play button
         * @type {Button}
         */
        this.play_btn = new Button()
            .addListener('keydown', this.onPlayBtnKeydown.bind(this))
            .data('action', 'play');

        new Dom('<div/>', {'class': 'buttons'})
            .append(this.rewind_btn)
            .append(this.play_btn)
            .appendTo(this);

        return this;
    }

    /**
     * Get the value of the controller's name property
     *
     * @return {String} The name
     */
    getName() {
        return '[controller]';
    }

    /**
     * Update the displayed time
     *
     * @param {Integer} time The time value in centiseconds
     * @return {this}
     */
    updateTime(time){
        this.timer.text(formatTime(time));

        return this;
    }

    /**
     * Get the draggable behaviour's configuration
     *
     * @return {Object} The configuration
     */
    getDraggableConfigs(){
        return Object.assign(super.getDraggableConfigs(), {
            'handle': this.child('.timer')
        });
    }

    /**
     * Play button keydown event callback
     *
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onPlayBtnKeydown(evt){
        if(evt.key === " "){
            evt.stopPropagation();
        }
    }

}
