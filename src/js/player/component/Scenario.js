import Component from '../Component';
import VideoRenderer from './VideoRenderer';
import Controller from './Controller';
import Block from './Block';
import BlockToggler from './BlockToggler';
import {isNumber} from '../../core/utils/Var';

const component_types = {
    'VideoRenderer': VideoRenderer,
    'Controller': Controller,
    'Block': Block,
    'BlockToggler': BlockToggler
};

/**
 * A scenario component
 *
 * @emits {componentadd} Fired when a page is added
 * @param {Component} component The page instance
 * @param {Boolean} new Whether the component was an already existing one, or a newly created one from configs
 */
export default class Scenario extends Component {

    static defaults = Object.assign({}, super.defaults, {
        'draggable': false,
        'resizable': false,
        'properties': Object.assign({}, super.defaults.properties, {
            'name': {
                'type': 'string'
            },
            'components': {
                'type': 'array',
                'getter': function(skipID){
                    const components = [];

                    this.getChildren().forEach((component) => {
                        components.push(component.getPropertyValues(skipID));
                    });

                    return components;
                }
            }
        })
    });

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Scenario';
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('scenario');
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(property, value){
        switch(property){
            case 'components':
                this.removeAllChildren();
                value.forEach((configs) => {
                    this.addComponent(configs);
                });
                break;

            default:
                super.updatePropertyValue(property, value);
        }
    }

    /**
     * Add a page
     *
     * @param {Object|Page} configs Component configs or an existing Component instance
     * @param {Integer} [index] The new component's index, component is appended if not given
     * @param {Boolean} [supressEvent=false] Whether to supress the componentadd event
     * @return {Page} The added component
     */
    addComponent(configs, index, supressEvent){
        let component = configs;
        const existing = component instanceof Component;

        if(!existing){
            component = new component_types[configs.type](configs);
        }

        if(isNumber(index)){
            component.insertAt(this, index);
        }
        else{
            component.appendTo(this);
        }

        if(!existing){
            component.init();
        }

        if(this.isActive()){
            component.activate();
        }

        if(supressEvent !== true){
            this.triggerEvent('componentadd', {'component': component, 'new': !existing});
        }

        return component;
    }
}
