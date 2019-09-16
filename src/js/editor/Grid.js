import Dom from '../core/Dom';
import ResizeObserver from 'resize-observer-polyfill';

import {className} from '../../css/editor/Grid.scss';

/**
 * A dynamic visual grid
 */
export default class Grid extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `grid ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The buffered <canvas> element
         * @type {Dom}
         */
        this.canvas = new Dom('<canvas/>')
            .appendTo(this);
    }

    /**
     * Get the default config values
     *
     * @return {Object} The default values
     */
    static getDefaults(){
        return {
            'verticalStep': 10,
            'verticalColor': 'rgba(0, 0, 0, 0.1)',
            'verticalWidth': 1,
            'horizontalStep': 10,
            'horizontalColor': 'rgba(0, 0, 0, 0.1)',
            'horizontalWidth': 1
        };
    }

    onResize(){
        this.updateSize().draw();
    }

    init(){
        const resize_observer = new ResizeObserver(this.onResize.bind(this));
        resize_observer.observe(this.get(0));

        this.updateSize().draw();
    }

    /**
     * Update the <canvas> sizes
     *
     * @return {this}
     */
    updateSize(){
        const canvas = this.canvas.get(0);

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        return this;
    }

    draw(){
        const canvas = this.canvas.get(0);
        const context = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(0.5, 0.5);

        // Draw vertical lines
        context.strokeStyle = this.configs.verticalColor;
        context.lineWidth = this.configs.verticalWidth;
        context.beginPath();
        for(let i = 0; i < width; i+=this.configs.verticalStep){
            context.moveTo(i, 0);
            context.lineTo(i, height);
        }
        context.stroke();

        // Draw horizontal lines
        context.strokeStyle = this.configs.horizontalColor;
        context.lineWidth = this.configs.horizontalWidth;
        context.beginPath();
        for(let i = 0; i < height; i+=this.configs.horizontalStep){
            context.moveTo(0, i);
            context.lineTo(width, i);
        }
        context.stroke();

        return this;
    }

}
