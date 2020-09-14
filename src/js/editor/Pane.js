import Dom from '../core/Dom';
import Resizable from '../core/ui/Resizable';

import {className} from '../../css/editor/Pane.scss';

/**
 * A resizable pane
 */
export default class Pane extends Dom {

    static defaults = {
        'axis': 'horizontal',
        'resizable': false
    };

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `pane ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        this.addClass(this.configs.axis);

        if(this.configs.resizable){
            this.resizable = new Resizable(Object.assign({'target': this}, this.configs.resizable));

            Object.entries(this.resizable.getHandles()).forEach(([direction, handle]) => {
                handle.addListener('dblclick', this.onResizeHandleDblclick.bind(this));

                this.addClass(`resize-${direction}`);
            });
        }

        this.contents = new Dom('<div/>', {'class': 'contents'})
            .appendTo(this);
    }

    onResizeHandleDblclick(){
        this.toggleClass('collapsed');
    }

    getContents(){
        return this.contents;
    }

    getResizable(){
        return this.resizable;
    }

    remove(){
        this.resizable.destroy();
        super.remove();
    }

}
