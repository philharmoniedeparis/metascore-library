import Element from '../Element';
import Dom from '../../../core/Dom';

/**
 * A Media element
 */
export default class Media extends Element{

    /**
    * Get the component's type
    *
    * @return {String} The component's type
    */
    static getType(){
        return 'Media';
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
                'tag': {
                    'type': 'string',
                    'default': 'audio'
                },
                'src': {
                    'type': 'string'
                }
            })
        });
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(property, value){
        switch(property){
            case 'tag':
                if(this.media){
                    this.media.remove();
                }

                this.media = new Dom(`<${value}/>`)
                    .attr('controls', '')
                    .attr('src', this.getPropertyValue('src'))
                    .appendTo(this.contents);
                break;

            case 'src':
                if(this.media){
                    this.media.attr('src', value);
                }
                break;

            default:
                super.updatePropertyValue(property, value);
        }
    }

}
