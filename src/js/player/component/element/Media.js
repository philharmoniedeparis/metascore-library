import Element from '../Element';
import Dom from '../../../core/Dom';

/**
 * A Media element
 */
export default class Media extends Element{

    static defaults = Object.assign({}, super.defaults, {
        'properties': Object.assign({}, super.defaults.properties, {
            'tag': {
                'type': 'string',
                'default': 'audio'
            },
            'src': {
                'type': 'string'
            }
        })
    });

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Media';
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

                this.data('type', value);

                this.media = new Dom(`<${value}/>`)
                    .attr('controls', '')
                    .attr('playsinline', '')
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
