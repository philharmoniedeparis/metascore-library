import Dom from '../../core/Dom';


export default class View extends Dom {

    constructor() {
        // call parent constructor
        super('<div/>', {'class': 'view zoom'});
    }

}
