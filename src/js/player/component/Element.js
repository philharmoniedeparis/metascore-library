import Component from '../Component';
import Dom from '../../core/Dom';
import { isString } from '../../core/utils/Var';

/**
 * An element component
 */
export default class Element extends Component {

    /**
     * @inheritdoc
    */
    static getType() {
        return 'Element';
    }

    /**
     * Instantiate
     *
     * @abstract
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        if (new.target === Element) {
            // This is an abstract class.
            throw new TypeError(`Cannot construct ${new.target.name} instances directly`);
        }

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
        this.contents = new Dom('<div/>', { 'class': 'contents' })
            .appendTo(this);

        return this;
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(name, value) {
        if(this.isPropertyAnimated(name, value)) {
            return this.updateAnimatedPropertyValue(name, value);
        }

        switch (name) {
            case 'background-color':
            case 'border-color':
            case 'border-radius':
            case 'opacity':
                this.contents.css(name, value);
                break;

            case 'border-width':
                this.contents.css(name, `${value}px`);
                break;

            case 'background-image':
                {
                    const css_value = (value !== 'none' && isString(value) && (value.length > 0)) ? `url(${value})` : null;
                    this.contents.css(name, css_value);
                }
                break;


            default:
                super.updatePropertyValue(name, value);
        }

        return this;
    }

}
