import Element from '../Element';
import Ajax from '../../../core/Ajax';
import Dom from '../../../core/Dom';

/**
 * An svg element
 */
export default class SVG extends Element {

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
                'marker-end': {
                    'type': 'string'
                }
            })
        });
    }

    /**
     * The propchange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onOwnPropChange(evt){
        const property = evt.detail.property;
        const value = evt.detail.value;

        super.onOwnPropChange(evt);

        switch(property){
            case 'src':
                this.contents.empty();

                Ajax.GET(value, {
                    'responseType': 'image/svg+xml',
                    'onSuccess': this.onLoadSuccess.bind(this),
                    'onError': this.onLoadError.bind(this)
                });
                break;

            case 'stroke':
            case 'stroke-width':
            case 'stroke-dasharray':
            case 'fill':
                this.updateSVGStyles();
                break;
        }
    }

    onLoadSuccess(evt){
        const xml = evt.target.getXMLResponse();
        if(xml){
            this.svg = new Dom(xml.documentElement);
            this.contents.append(this.svg);
            this.updateSVGStyles();
        }
    }

    onLoadError(evt){
        console.error(evt.target.getStatusText());
    }

    updateSVGStyles(){
        if(this.svg){
            const styles = {
                'stroke': this.getPropertyValue('stroke'),
                'stroke-width': this.getPropertyValue('stroke-width'),
                'stroke-dasharray': this.getPropertyValue('stroke-dasharray'),
                'fill': this.getPropertyValue('fill')
            };

            this.svg.children().forEach((el) => {
                Object.entries(styles).forEach(([key, value]) => {
                    Dom.css(el, key, value);
                });
            });
        }
    }

}
