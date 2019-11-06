import Component from '../Component';
import Dom from '../../core/Dom';
import {isString} from '../../core/utils/Var';

/**
 * An element component
 */
export default class Element extends Component{

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Element';
    }

    /**
     * @inheritdoc
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
                'background-image': {
                    'type': 'image'
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
                'opacity': {
                    'type': 'number'
                },
                'start-time': {
                    'type': 'time'
                },
                'end-time': {
                    'type': 'time'
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

        const type = this.constructor.getType();
        this.addClass(`element ${type}`);

        this.setupUI();
    }

    /**
     * Setup the element's UI
     *
     * @private
     */
    setupUI() {
        /**
         * The contents container
         * @type {Dom}
         */
        this.contents = new Dom('<div/>', {'class': 'contents'})
            .appendTo(this);

        return this;
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(property, value){
        switch(property){
            case 'background-color':
            case 'border-color':
            case 'border-radius':
            case 'opacity':
                this.contents.css(property, value);
                break;

            case 'border-width':
                this.contents.css(property, `${value}px`);
                break;

            case 'background-image':
                {
                    const css_value = (value !== 'none' && isString(value) && (value.length > 0)) ? `url(${value})` : null;
                    this.contents.css(property, css_value);
                }
                break;


            default:
                super.updatePropertyValue(property, value);
        }
    }

}
