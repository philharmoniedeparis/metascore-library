import Element from '../Element';
import Locale from '../../../core/Locale';
import Dom from '../../../core/Dom';
import {isFunction, isEmpty} from '../../../core/utils/Var';

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
     * @inheritdoc
    */
    static getProperties() {
        if (!this.properties) {
            this.properties = Object.assign({}, super.getProperties(), {
                'src': {
                    'type': 'string',
                    'label': Locale.t('component.element.SVG.properties.src.label', 'Source')
                },
                'stroke': {
                    'type': 'color',
                    'label': Locale.t('component.element.SVG.properties.stroke.label', 'Stroke'),
                    'applies': function(){
                        return this.isLoaded() && this.svg_dom.find(`[class^='color'], [class*=' color']`).count() === 0;
                    }
                },
                'stroke-width': {
                    'type': 'number',
                    'label': Locale.t('component.element.SVG.properties.stroke-width.label', 'Stroke width'),
                    'applies': function(){
                        return this.isLoaded() && this.svg_dom.find(`[class^='color'], [class*=' color']`).count() === 0;
                    }
                },
                'stroke-dasharray': {
                    'type': 'string',
                    'label': Locale.t('component.element.SVG.properties.stroke-dasharray.label', 'Stroke dasharray'),
                    'applies': function(){
                        return this.isLoaded() && this.svg_dom.find(`[class^='color'], [class*=' color']`).count() === 0;
                    }
                },
                'fill': {
                    'type': 'color',
                    'label': Locale.t('component.element.SVG.properties.fill.label', 'Fill'),
                    'applies': function(){
                        return this.isLoaded() && this.svg_dom.find(`[class^='color'], [class*=' color']`).count() === 0;
                    }
                },
                'marker-start': {
                    'type': 'string',
                    'label': Locale.t('component.element.SVG.properties.marker-start.label', 'Marker start'),
                    'applies': function(){
                        return !isEmpty(this.markers);
                    }
                },
                'marker-mid': {
                    'type': 'string',
                    'label': Locale.t('component.element.SVG.properties.marker-mid.label', 'Marker mid'),
                    'applies': function(){
                        return !isEmpty(this.markers);
                    }
                },
                'marker-end': {
                    'type': 'string',
                    'label': Locale.t('component.element.SVG.properties.marker-end.label', 'Marker end'),
                    'applies': function(){
                        return !isEmpty(this.markers);
                    }
                },
                'colors': {
                    'type': 'array',
                    'label': Locale.t('component.element.SVG.properties.colors.label', 'Colors'),
                    'applies': function(){
                        return this.isLoaded() && this.svg_dom.find(`[class^='color'], [class*=' color']`).count() > 0;
                    }
                }
            });
        }

        return this.properties;
    }

    /**
     * @inheritdoc
    */
    static getType(){
        return 'SVG';
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        /**
         * A list of available markers keyed by id.
         * @type {Object}
         */
        this.markers = {};

        this.addListener('activate', this.onActivate.bind(this));
    }

    /**
     * @inheritdoc
     */
    setupUI(){
        super.setupUI();

        this.svg = new Dom('<object/>')
            .attr('type', 'image/svg+xml')
            .addListener('load', this.onLoad.bind(this))
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
    updatePropertyValue(name, value){
        if(this.isPropertyAnimated(name, value)) {
            return this.updateAnimatedPropertyValue(name, value);
        }

        super.updatePropertyValue(name, value);

        switch(name){
            case 'src':
                this.updateSrc(value);
                break;

            case 'colors':
                this.updateColors(value);
                break;

            default:
                if(svg_properties.includes(name)){
                    this.updateSVGProperty(name, value);
                }
        }

        return this;
    }

    /**
     * SVG load event handler.
     *
     * @private
     * @param {evt} evt The event object
     */
    onLoad(evt){
        this._loaded = true;

        /**
         * The svg element.
         * @type {Dom}
         */
        this.svg_dom = new Dom(evt.target.contentDocument).child('svg');

        this.markers = {};
        const markers = this.svg_dom.find('defs marker');
        markers.forEach((marker) => {
            const id =  Dom.attr(marker, 'id');
            this.markers[id] = marker;
        });

        this.updateSVGProperties();

        this.updateColors(this.getPropertyValue('colors'));

        this.triggerEvent('contentload', {'component': this});
    }

    /**
     * Get the SVG object.
     *
     * @return {DOM} The SVG object.
     */
    getSVG(){
        return this.svg;
    }

    /**
     * Get the list of available markers.
     *
     * @return {Object} The list of markers keyed by id.
     */
    getMarkers(){
        return this.markers;
    }

    /**
     * Check if the animation has loaded.
     *
     * @return {Boolean} Whether the animation has loaded.
     */
    isLoaded(){
        return this._loaded;
    }

    /**
     * Update an SVG property with corresponding component property value.
     *
     * @private
     * @return {this}
     */
    updateSVGProperty(property, value, executeInnerUpdate){
        if(this.isLoaded()){
            this.svg_dom.find(svg_elements.join(',')).forEach((el) => {
                if(property.indexOf('marker-') === 0){
                    Dom.css(el, property, !isEmpty(value) ? `url("#${value}")` : null);
                }
                else{
                    Dom.css(el, property, value);
                }
            });

            if(executeInnerUpdate !== false){
                this.executeInnerUpdate();
            }
        }
    }

    /**
     * Update SVG properties with component property values.
     *
     * @private
     * @return {this}
     */
    updateSVGProperties(){
        if(this.isLoaded()){
            svg_properties.forEach((property) => {
                this.updateSVGProperty(property, this.getPropertyValue(property), false);
            });

            this.executeInnerUpdate();
        }

        return this;
    }

    /**
     * Execute the embedded update function if it exists.
     *
     * @private
     * @return {this}
     */
    executeInnerUpdate(){
        if(this.isLoaded()){
            const svg = this.svg_dom.get(0);

            if(isFunction(svg.update)) {
                svg.update();
            }
        }

        return this;
    }

    /**
     * Update the animation's source URL.
     *
     * @private
     * @param {string} url The new URL.
     * @return {this}
     */
    updateSrc(url){
        delete this._loaded;
        delete this.svg_dom;

        this.svg.attr('data', url);

        return this;
    }

    /**
     * Update the animation's colors.
     *
     * @private
     * @param {string[]} colors An array of color values.
     * @return {this}
     */
    updateColors(colors){
        if(this.svg && this.isLoaded()){
            (colors ?? [null, null]).forEach((val, index) => {
                this.svg_dom.find(`.color${index+1}`).css('fill', val);
            });
        }

        return this;
    }

}
