import Component from '../Component';
import Dom from '../../core/Dom';
import {isString} from '../../core/utils/Var';

/**
 * An element component
 */
export default class Element extends Component{

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
                    'type': 'string',
                    'setter': function(value){
                        this.data('name', value);
                    }
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
                        this.contents.css('background-color', value);
                    }
                },
                'background-image': {
                    'type': 'image',
                    'setter': function(value){
                        const css_value = (value !== 'none' && isString(value) && (value.length > 0)) ? `url(${value})` : null;
                        this.contents.css('background-image', css_value);
                    }
                },
                'border-width': {
                    'type': 'number',
                    'setter': function(value){
                        this.contents.css('border-width', `${value}px`);
                    }
                },
                'border-color': {
                    'type': 'color',
                    'setter': function(value){
                        this.contents.css('border-color', value);
                    }
                },
                'border-radius': {
                    'type': 'string',
                    'setter': function(value){
                        this.contents.css('border-radius', value);
                    }
                },
                'opacity': {
                    'type': 'number',
                    'setter': function(value){
                        this.contents.css('opacity', value);
                    }
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
     * Setup the element's UI
     *
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        const type = this.constructor.getType();
        this.addClass(`element ${type}`);

        /**
         * The contents container
         * @type {Dom}
         */
        this.contents = new Dom('<div/>', {'class': 'contents'})
            .appendTo(this);

        return this;
    }

}
