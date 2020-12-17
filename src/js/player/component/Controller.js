import Component from '../Component';
import Dom from '../../core/Dom';
import Button from '../../core/ui/Button';
import {formatTime} from '../../core/utils/Media';
import {MasterClock} from '../../core/media/MediaClock';
import {pick} from '../../core/utils/Object';

/**
 * A controller component
 */
export default class Controller extends Component{

    static defaults = Object.assign({}, super.defaults, {
        'resizable': false,
        'name': 'Controller'
    });

    /**
     * @inheritdoc
    */
    static getProperties() {
        if (!this.properties) {
            this.properties = pick(super.getProperties(), [
                'id',
                'type',
                'name',
                'hidden',
                'position',
                'border-width',
                'border-color',
                'border-radius',
                'editor.locked',
            ]);
        }

        return this.properties;
    }

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Controller';
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

        MasterClock
            .addListener('play', this.onMasterClockPlay.bind(this))
            .addListener('pause', this.onMasterClockPause.bind(this))
            .addListener('stop', this.onMasterClockStop.bind(this))
            .addListener('timeupdate', this.onMasterClockTimeUpdate.bind(this));

        if(MasterClock.isTicking()){
            this.addClass('playing');
        }

        this.updateTime(MasterClock.getTime());
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

    onMasterClockPlay(){
        this.addClass('playing');
    }

    onMasterClockPause(){
        this.removeClass('playing');
    }

    onMasterClockStop(){
        this.removeClass('playing');
    }

    onMasterClockTimeUpdate(){
        this.updateTime(MasterClock.getTime());
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
