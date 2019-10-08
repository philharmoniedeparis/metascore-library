import Component from '../Component';
import Dom from '../../core/Dom';
import {isString} from '../../core/utils/Var';

/**
 * An element component
 *
 * @emits {cuepointstart} Fired when a cuepoint started
 * @emits {cuepointstop} Fired when a cuepoint stops
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
                    'getter': function(){
                        return this.constructor.getType();
                    }
                },
                'name': {
                    'getter': function(){
                        return this.data('name');
                    },
                    'setter': function(value){
                        this.data('name', value);
                    }
                },
                'x': {
                    'getter': function(){
                        return parseInt(this.css('left'), 10);
                    },
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'getter': function(){
                        return parseInt(this.css('top'), 10);
                    },
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    }
                },
                'width': {
                    'getter': function(){
                        return parseInt(this.css('width'), 10);
                    },
                    'setter': function(value){
                        this.css('width', `${value}px`);
                    }
                },
                'height': {
                    'getter': function(){
                        return parseInt(this.css('height'), 10);
                    },
                    'setter': function(value){
                        this.css('height', `${value}px`);
                    }
                },
                'background-color': {
                    'getter': function(skipDefault){
                        return this.contents.css('background-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('background-color', value);
                    }
                },
                'background-image': {
                    'getter': function(skipDefault){
                        let value = this.contents.css('background-image', void 0, skipDefault);

                        if(value === 'none' || !isString(value)){
                            return null;
                        }

                        value = value.replace(/^url\(["']?/, '');
                        value = value.replace(/["']?\)$/, '');
                        value = value.replace(document.baseURI, '');

                        return value;
                    },
                    'setter': function(value){
                        const css_value = (value !== 'none' && isString(value) && (value.length > 0)) ? `url(${value})` : null;
                        this.contents.css('background-image', css_value);
                    }
                },
                'border-width': {
                    'getter': function(skipDefault){
                        const value = parseInt(this.contents.css('border-width', void 0, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.contents.css('border-width', `${value}px`);
                    }
                },
                'border-color': {
                    'getter': function(skipDefault){
                        return this.contents.css('border-color', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('border-color', value);
                    }
                },
                'border-radius': {
                    'getter': function(skipDefault){
                        return this.contents.css('border-radius', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('border-radius', value);
                    }
                },
                'opacity': {
                    'getter': function(skipDefault){
                        return this.contents.css('opacity', void 0, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('opacity', value);
                    }
                },
                'start-time': {
                    'getter': function(){
                        const value = parseFloat(this.data('start-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('start-time', isNaN(value) ? null : value);
                    }
                },
                'end-time': {
                    'getter': function(){
                        const value = parseFloat(this.data('end-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('end-time', isNaN(value) ? null : value);
                    }
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
