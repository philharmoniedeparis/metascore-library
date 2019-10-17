import Component from '../Component';
import Dom from '../../core/Dom';
import {MasterClock} from '../../core/media/Clock';

/**
 * A media component
 */
export default class Media extends Component{

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [properties={...}] A list of the component properties as name/descriptor pairs
     */
    constructor(configs){
        // call parent constructor
        super(configs);

        this.addClass('media');
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'tag': 'audio',
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'type': 'string'
                },
                'name': {
                    'type': 'string',
                    'setter': function(value){
                        this.data('name', value);
                    }
                },
                'hidden': {
                    'type': 'boolean',
                    'setter': function(value){
                        this.toggleClass('hidden', value);
                    }
                },
                'scenario': {
                    'type': 'string'
                },
                'x': {
                    'type': 'number',
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'type': 'number',
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    },
                },
                'width': {
                    'type': 'number',
                    'setter': function(value){
                        this.css('width', `${value}px`);
                    }
                },
                'height': {
                    'type': 'number',
                    'setter': function(value){
                        this.css('height', `${value}px`);
                    }
                },
                'background-color': {
                    'type': 'color',
                    'setter': function(value){
                        this.css('background-color', value);
                    }
                },
                'border-width': {
                    'type': 'number',
                    'setter': function(value){
                        this.css('border-width', `${value}px`);
                    }
                },
                'border-color': {
                    'type': 'color',
                    'setter': function(value){
                        this.css('border-color', value);
                    }
                },
                'border-radius': {
                    'type': 'string',
                    'setter': function(value){
                        this.css('border-radius', value);
                    }
                },
            })
        });
    }

    /**
     * @inheritdoc
     */
    setupUI(){
        // call parent function
        super.setupUI();

        /**
         * The cursor's line
         * @type {Dom}
         */
        const canvas = new Dom('<canvas/>')
            .appendTo(this);

        this.canvas = canvas.get(0);
        this.context = this.canvas.getContext('2d');

        this.addListener('activate', this.onActivate.bind(this));

        MasterClock.addListener('timeupdate', this.onMediaClockTimeupdate.bind(this));

        return this;
    }

    /**
     * The activate event handler
     *
     * @private
     */
    onActivate(){
        this.draw();
    }

    /**
     * The media clock timeupdate event handler
     *
     * @private
     */
    onMediaClockTimeupdate(){
        this.draw();
    }

    /**
     * The propchange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onOwnPropChange(evt){
        super.onOwnPropChange(evt);

        this.draw();
    }

    /**
     * Update the <canvas> size
     *
     * @return {this}
     */
    draw(){
        if(this.isActive()){
            const video = MasterClock.getRenderer().getDom();

            this.canvas.width = video.videoWidth;
            this.canvas.height = video.videoHeight;

            this.context.drawImage(MasterClock.getRenderer().getDom(), 0, 0);
        }

        return this;
    }
}
