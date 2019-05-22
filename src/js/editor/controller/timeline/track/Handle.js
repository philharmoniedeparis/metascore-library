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

        this.info = new Dom('<div/>', {'class': 'info'})
            .appendTo(this);

        this.name = new Dom('<div/>', {'class': 'name'})
            .appendTo(this.info);
    }

    setName(value){
        this.name
            .text(value)
            .attr('title', value);

        return this;
    }

    addSubHandle(handle, index){
        if(!this.subhandles){
            this.subhandles = new Dom('<div/>', {'class': 'sub-handles'})
                .appendTo(this)
        }

        handle.insertAt(this.subhandles, index);
    }

}
