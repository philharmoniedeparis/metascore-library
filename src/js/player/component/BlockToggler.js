import Component from '../Component';
import Locale from '../../core/Locale';
import Dom from '../../core/Dom';
import {pick} from '../../core/utils/Object';

/**
 * A block toggler component
 */
export default class BlockToggler extends Component{

    static defaults = Object.assign({}, super.defaults, {
        'dimension': [100, 20]
    });

    /**
     * @inheritdoc
    */
    static getProperties() {
        if (!this.properties) {
            this.properties = Object.assign(pick(super.getProperties(), [
                'id',
                'type',
                'name',
                'hidden',
                'position',
                'dimension',
                'background-color',
                'border-width',
                'border-color',
                'border-radius',
                'editor.locked',
            ]), {
                'blocks': {
                    'type': 'array',
                    'label': Locale.t('component.BlockToggler.properties.blocks.label', 'Blocks')
                }
            });
        }

        return this.properties;
    }

    /**
     * @inheritdoc
    */
    static getType(){
        return 'BlockToggler';
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('block-toggler');

        this.setupUI();
    }

    /**
     * Setup the block's UI
     *
     * @private
     */
    setupUI() {
        /**
         * The buttons container
         * @type {Dom}
         */
        this.btn_wrapper = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        return this;
    }

    /**
     * Update the displayed time
     *
     * @param {Dom} components A Dom instance containing the components to control
     * @return {this}
     */
    update(components){
        const boxes = [];
        let components_width = 0;
        let components_height = 0;

        this.btn_wrapper.empty();

        // Iterate through the list of components to retreive bounding box data.
        components.forEach((component) => {
            const position = component.getPropertyValue('position') || [0,0];
            const dimension = component.getPropertyValue('dimension') || [0,0];

            boxes.push({
                'component': component,
                'position': position,
                'dimension': dimension
            });

            components_width = Math.max(position[0] + dimension[0], components_width);
            components_height = Math.max(position[1] + dimension[1], components_height);
        });

        // Sort boxes by position from top-left to bottom-right.
        boxes.sort((a, b) => {
            if(a.position[0] > b.position[0]) {return 1;}
            if(a.position[0] < b.position[0]) {return -1;}
            if(a.position[1] > b.position[1]) {return 1;}
            if(a.position[1] < b.position[1]) {return -1;}
            return 0;
        });

        // Iterate through the boxes to create a corresponding toggle button.
        boxes.forEach((box, index) => {
            const button = new Dom('<div/>', {'class': 'button'})
                .data('component', box.component.getId())
                .addListener('click', this.onTogglerClick.bind(this, box.component))
                .appendTo(this.btn_wrapper);

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttributeNS(null, "preserveAspectRatio", "xMidYMid meet");
            svg.setAttributeNS(null, "viewBox", `0 0 ${components_width} ${components_height}`);
            button.get(0).appendChild(svg);

            boxes.forEach((box2, index2) => {
                const x = box2.position[0];
                const y = box2.position[1];
                const width = box2.dimension[0];
                const height = box2.dimension[1];

                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttributeNS(null, "width", width);
                rect.setAttributeNS(null, "height", height);
                rect.setAttributeNS(null, "x", x);
                rect.setAttributeNS(null, "y", y);

                if(index2 === index){
                    rect.setAttribute('class', "current");
                }

                svg.appendChild(rect);
            });
        });

        return this;
    }

    /**
     * The toggler button click event callback
     *
     * @param {Component} component The associated component
     */
    onTogglerClick(component){
        component.toggleVisibility();
    }

}
