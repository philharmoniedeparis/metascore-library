import Element from '../Element';

/**
 * A content element
 *
 * @emits {apilinkclick} Fired when an api link is clicked
 * @param {Object} element The element instance
 * @param {String} hash The link's hash
 */
export default class Content extends Element {

    static defaults = Object.assign({}, super.defaults, {
        'properties': Object.assign({}, super.defaults.properties, {
            'text': {
                'type': 'string',
                'getter': function(){
                    return this.contents.text();
                }
            }
        })
    });

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Content';
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(name, value){
        switch(name){
            case 'text':
                this.contents.text(value);
                break;

            default:
                super.updatePropertyValue(name, value);
        }

        return this;
    }

}
