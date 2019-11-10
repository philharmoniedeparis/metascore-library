import Component from '../Component';
import Dom from '../../core/Dom';
import {MasterClock} from '../../core/media/Clock';

/**
 * A video renderer component
 */
export default class VideoRenderer extends Component{

    /**
     * @inheritdoc
    */
    static getType(){
        return 'VideoRenderer';
    }

    /**
     * @inheritdoc
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'name': {
                    'type': 'string'
                },
                'hidden': {
                    'type': 'boolean'
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

        this.addClass('video-renderer');

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
            const renderer_dom = MasterClock.getRenderer().getDom();

            if(renderer_dom instanceof HTMLVideoElement){
                try{
                    this.canvas.width = renderer_dom.videoWidth;
                    this.canvas.height = renderer_dom.videoHeight;

                    this.context.drawImage(renderer_dom, 0, 0);
                }
                catch(e){
                    console.error(e);
                }
            }
        }

        return this;
    }
}
