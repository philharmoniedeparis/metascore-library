import Element from '../Element';
import Dom from '../../../core/Dom';
import {isFunction} from '../../../core/utils/Var';

const svg_properties = [
    'stroke',
    'stroke-width',
    'stroke-dasharray',
    'fill',
    'marker-start',
    'marker-mid',
    'marker-end'
];

const svg_elements = [
    'circle',
    'ellipse',
    'line',
    'path',
    'polygon',
    'polyline',
    'rect'
];

/**
 * An svg element
 */
export default class SVG extends Element {

    /**
    * Get the component's type
    *
    * @return {String} The component's type
    */
    static getType(){
        return 'SVG';
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'src': {
                    'type': 'string'
                },
                'stroke': {
                    'type': 'color'
                },
                'stroke-width': {
                    'type': 'number'
                },
                'stroke-dasharray': {
                    'type': 'string'
                },
                'fill': {
                    'type': 'color'
                },
                'marker-start': {
                    'type': 'string'
                },
                'marker-mid': {
                    'type': 'string'
                },
                'marker-end': {
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

        this.markers = {};

        this.addListener('activate', this.onActivate.bind(this));
    }

    setupUI(){
        super.setupUI();

        this.svg = new Dom('<object/>')
            .attr('type', 'image/svg+xml')
            .addListener('load', this.onSVGLoad.bind(this))
            .appendTo(this.contents);
    }

    /**
     * The activate event handler
     *
     * @private
     */
    onActivate(){
        this.executeInnerUpdate();
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(property, value){
        switch(property){
            case 'src':
                delete this._loaded;
                delete this.svg_dom;

                this.svg.attr('data', value);
                break;

            default:
                if(svg_properties.includes(property)){
                    this.updateSVGProperty(property, value);
                }
                else{
                    super.updatePropertyValue(property, value);
                }
        }
    }

    onSVGLoad(evt){
        this._loaded = true;

        this.svg_dom = new Dom(evt.target.contentDocument).child('svg');

        const markers = this.svg_dom.find('defs marker');
        markers.forEach((marker) => {
            const id =  Dom.attr(marker, 'id');
            this.markers[id] = marker;
        });

        this.updateSVGProperties();

        this.triggerEvent('contentload', {'component': this});
    }

    getSVG(){
        return this.svg;
    }

    getMarkers(){
        return this.markers;
    }

    isLoaded(){
        return this._loaded;
    }

    updateSVGProperty(property, value, executeInnerUpdate){
        if(this._loaded){
            this.svg_dom.children(svg_elements.join(',')).forEach((el) => {
                Dom.css(el, property, value);
            });

            if(property === 'stroke'){
                Object.values(this.markers).forEach((marker) => {
                    Dom.css(marker, 'stroke', value);
                    Dom.css(marker, 'fill', value);
                });
            }

            if(executeInnerUpdate !== false){
                this.executeInnerUpdate();
            }
        }
    }

    updateSVGProperties(){
        if(this._loaded){
            svg_properties.forEach((property) => {
                this.updateSVGProperty(property, this.getPropertyValue(property), false);
            });

            this.executeInnerUpdate();
        }
    }

    executeInnerUpdate(){
        if(this._loaded){
            if(isFunction(this.svg_dom.update)) {
                this.svg_dom.update();
            }
        }
    }

}
