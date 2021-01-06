import Element from '../Element';
import Locale from '../../../core/Locale';
import Dom from '../../../core/Dom';

/**
 * A Media element
 */
export default class Media extends Element{

    static defaults = Object.assign({}, super.defaults, {
        'tag': 'audio'
    });

    /**
     * @inheritdoc
    */
    static getProperties() {
        if (!this.properties) {
            this.properties = Object.assign({}, super.getProperties(), {
                'tag': {
                    'type': 'string',
                    'label': Locale.t('component.element.Media.properties.tag.label', 'Tag')
                },
                'src': {
                    'type': 'string',
                    'label': Locale.t('component.element.Media.properties.src.label', 'Source')
                }
            });
        }

        return this.properties;
    }

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Media';
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(name, value, skip_animated_check = false){
        super.updatePropertyValue(name, value, skip_animated_check);

        switch(name){
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
        }

        return this;
    }

}
