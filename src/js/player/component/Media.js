import Component from '../Component';
import Dom from '../../core/Dom';
import {MasterClock} from '../../core/media/Clock';

/**
 * A media component
 */
export default class Media extends Component{

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'type': 'string'
                },
                'name': {
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
                'background-color': {
                    'type': 'color'
                },
                'border-width': {
                    'type': 'number'
                },
                'border-color': {
                    'type': 'color'
                },
                'border-radius': {
                    'type': 'string'
                },
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

        this.addClass('media');

        this.setupUI();
    }

    /**
     * @inheritdoc
     */
    setupUI(){
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
     * @inheritdoc
     */
    updatePropertyValue(property, value){
        super.updatePropertyValue(property, value);

        this.draw();
    }

    /**
     * Update the <canvas>
     *
     * @return {this}
     */
    draw(){
        if(this.isActive()){
            const video = MasterClock.getRenderer().getDom();

            if(video instanceof HTMLVideoElement){
                try{
                    this.canvas.width = video.videoWidth;
                    this.canvas.height = video.videoHeight;

                    this.context.drawImage(MasterClock.getRenderer().getDom(), 0, 0);
                }
                catch(e){
                    console.error(e);
                }
            }
        }

        return this;
    }
}
