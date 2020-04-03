import Element from '../Element';

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
    static getType(){
        return 'Content';
    }

    /**
     * @inheritdoc
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'text': {
                    'type': 'string',
                    'getter': function(){
                        return this.contents.text();
                    }
                }
            })
        });
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(property, value){
        switch(property){
            case 'text':
                this.contents.text(value);
                break;

            default:
                super.updatePropertyValue(property, value);
        }
    }

}
