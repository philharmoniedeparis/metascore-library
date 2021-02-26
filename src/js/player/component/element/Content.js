import Element from '../Element';
import Locale from '../../../core/Locale';

/**
 * A content element
 *
 * @emits {apilinkclick} Fired when an api link is clicked
 * @param {Object} element The element instance
 * @param {String} hash The link's hash
 */
export default class Content extends Element {

    /**
     * @inheritdoc
    */
    static getProperties() {
        if (!this.properties) {
            this.properties = Object.assign({}, super.getProperties(), {
                'text': {
                    'type': 'string',
                    'label': Locale.t('component.element.Content.properties.text.label', 'Text'),
                    'getter': function(){
                        return this.contents.text();
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
        return 'Content';
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(name, value, skipAnimatedCheck = false){
        super.updatePropertyValue(name, value, skipAnimatedCheck);

        switch(name){
            case 'text':
                this.contents.text(value);
                break;
        }

        return this;
    }

}
