import Element from '../Element';
import Dom from '../../../core/Dom';
import {isFunction} from '../../../core/utils/Var';

import markers_svg from '../../../../img/player/svg-markers.svg?svg-inline';

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

    setupUI(){
        super.setupUI();

        this.svg = new Dom('<object/>')
            .attr('type', 'image/svg+xml')
            .addListener('load', this.onSVGLoad.bind(this))
            .appendTo(this.contents);
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

        this.svg_doc = evt.target.contentDocument;
        this.svg_dom = new Dom(this.svg_doc).child('svg');

        const markers_dom = new DOMParser().parseFromString(markers_svg, 'image/svg+xml');
        new Dom(markers_dom).find('defs')
            .insertAt(this.svg_dom, 0);

        this.updateSVGProperties();

        this.triggerEvent('contentload', {'component': this});
    }

    getSVG(){
        return this.svg;
    }

    getSVGMarkers(){
        const markers = {};

        if(this._loaded){
            const def_markers = this.svg_dom.find('defs marker');
            def_markers.forEach((marker) => {
                const id =  Dom.attr(marker, 'id');
                markers[id] = marker;
            });
        }

        return markers;
    }

    isLoaded(){
        return this._loaded;
    }

    updateSVGProperty(property, value, executeInnerUpdate){
        if(this._loaded){
            this.svg_dom.children(svg_elements.join(',')).forEach((el) => {
                if(value !== null && property.indexOf('marker-') === 0){
                    Dom.css(el, property, `url(#${value}`);
                }
                else{
                    Dom.css(el, property, value);
                }
            });

            if(property === 'stroke'){
                Object.values(this.getSVGMarkers()).forEach((marker) => {
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
            if(isFunction(this.svg_doc.metascore_update)) {
                this.svg_doc.metascore_update();
            }
        }
    }

}
