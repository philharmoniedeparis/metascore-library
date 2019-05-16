import Dom from '../../../../core/Dom';

import {className} from '../../../../../css/editor/controller/timeline/track/Handle.less';

/**
 * A timeline track handle
 */
export default class Handle extends Dom {

    /**
     * Instantiate
     */
    constructor() {
        // call parent constructor
        super('<div/>', {'class': `track-handle ${className}`});

        this.name = new Dom('<div/>', {'class': 'name'})
            .appendTo(this);
    }

    setName(value){
        this.name.text(value);

        return this;
    }

}
