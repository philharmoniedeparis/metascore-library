import Component from '../Component';
import Dom from '../../core/Dom';

/**
 * A block toggler component
 */
export default class BlockToggler extends Component{

    /**
     * @inheritdoc
    */
    static getType(){
        return 'BlockToggler';
    }

    /**
     * @inheritdoc
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
                'type': {
                    'type': 'string'
                },
                'name': {
                    'type': 'string'
                },
                'hidden': {
                    'type': 'boolean'
                },
                'blocks': {
                    'type': 'array'
                },
                'x': {
                    'type': 'number'
                },
                'y': {
                    'type': 'number'
                },
                'width': {
                    'type': 'number'
                },
                'height': {
                    'type': 'number'
                },
                'background-color': {
                    'type': 'color'
                },
                'border-width': {
                    'type': 'number'
                },
                'border-color': {
                    'type': 'color'
                },
                'border-radius': {
                    'type': 'string'
                }
            })
        });
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
            const x = component.getPropertyValue('x') || 0;
            const y = component.getPropertyValue('y') || 0;
            const width = component.getPropertyValue('width') || 0;
            const height = component.getPropertyValue('height') || 0;

            boxes.push({
                'component': component,
                'x': x,
                'y': y,
                'width': width,
                'height': height
            });

            components_width = Math.max(x + width, components_width);
            components_height = Math.max(y + height, components_height);
        });

        // Sort boxes by position from top-left to bottom-right.
        boxes.sort((a, b) => {
            if(a.x > b.x) {return 1;}
            if(a.x < b.x) {return -1;}
            if(a.y > b.y) {return 1;}
            if(a.y < b.y) {return -1;}
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
                const x = box2.x;
                const y = box2.y;
                const width = box2.width;
                const height = box2.height;

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
