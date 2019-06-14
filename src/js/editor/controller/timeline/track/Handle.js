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

        const inner = new Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        new Dom('<div/>', {'class': 'expander'})
            .addListener('click', this.onExpanderClick.bind(this))
            .appendTo(inner);

        this.name = new Dom('<div/>', {'class': 'name'})
            .appendTo(inner);
    }

    onExpanderClick(){
        this.toggleClass('expanded');

        this.triggerEvent(this.hasClass('expanded') ? 'expand' : 'shrink');
    }

    onDescendentsChildRemove(evt){
        const child = evt.detail.child;
        if(!Dom.is(child, `.${className}`)){
            return;
        }

        this.toggleClass('has-descendents', this.descendents.is(':empty'));
    }

    setName(value){
        this.name
            .text(value)
            .attr('title', value);

        return this;
    }

    addDescendent(handle, index){
        if(!this.descendents){
            this.descendents = new Dom('<div/>', {'class': 'descendents'})
                .addListener('childremove', this.onDescendentsChildRemove.bind(this))
                .appendTo(this)
        }

        handle.insertAt(this.descendents, index);

        this.addClass('has-descendents');
    }

}
