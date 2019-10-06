import Dom from '../core/Dom';
import {isArray} from '../core/utils/Var';
import ComponentForm from './configseditor/ComponentForm';
import MediaForm from './configseditor/MediaForm';
import ControllerForm from './configseditor/ControllerForm';
import BlockForm from './configseditor/BlockForm';
import BlockTogglerForm from './configseditor/BlockTogglerForm';
import PageForm from './configseditor/PageForm';
import ElementForm from './configseditor/ElementForm';
import CursorForm from './configseditor/CursorForm';
import ContentForm from './configseditor/ContentForm';
import AnimationForm from './configseditor/AnimationForm';

import {className} from '../../css/editor/ConfigsEditor.scss';

/**
 * A component form class
 *
 * @emits {componentset} Fired when multuiple components are set
 * @param {Component} component The component instance
 * @emits {componentunset} Fired when a component is unset
 * @param {Component} component The component instance
 *
 * @todo: implement old editor.panel.Element methods
 */
export default class ConfigsEditor extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [allowMultiSelection=true] Whether multiple selection is allowed
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `configs-editor ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The list of already instantiated forms
         * @type {Object}
         */
        this.forms = {
            'Component': new ComponentForm(),
            'Media': new MediaForm(),
            'Controller': new ControllerForm(),
            'Block': new BlockForm(),
            'BlockToggler': new BlockTogglerForm(),
            'Page': new PageForm(),
            'Element': new ElementForm(),
            'Cursor': new CursorForm(),
            'Content': new ContentForm(),
            'Animation': new AnimationForm()
        };

        /**
         * The list of selected components
         * @type {Array}
         */
        this.components = [];
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'allowMultiSelection': true
        };
    }

    /**
    * Get the common types for the set of selected components
    *
    * @return {String} The common type
    */
    getComponentsCommonTypes(){
        const components = this.getComponents();
        const types_array = [];
        const common_types = [];

        components.forEach((component) => {
            types_array.push(component.getTypes());
        });

        types_array[0].forEach((type) => {
            const common = types_array.every((types) => {
                return types.includes(type);
            });

            if(common){
                common_types.push(type);
            }
        });

        return common_types;
    }

    getForm(){
        return this.form;
    }

    /**
     * Update the panel's UI
     *
     * @private
     * @return {this}
     */
    updateUI(){
        let form = null;
        const components = this.getComponents();

        // Find the best matching form
        if(components.length > 0){
            this.getComponentsCommonTypes().some((type) => {
                if(type in this.forms){
                    form = this.forms[type];
                    return true;
                }

                return false;
            });
        }

        // Remove the old form if not the same one
        if(this.form && form !== this.form){
            this.form.remove();
            delete this.form;
        }

        if(form){
            // Add the new form
            this.form = form
                .setComponents(components)
                .appendTo(this);
        }

        this.toggleClass('has-component', components.length > 0);

        return this;
    }

    /**
     * Get all set components
     *
     * @param {Mixed} [type] The type(s) of components to return
     * @return {Component[]} The components
     */
    getComponents(type) {
        if(type){
            const types = isArray(type) ? type : [type];
            return this.components.filter((component) => {
                return types.some((name) => {
                    return component.instanceOf(name);
                });
            });
        }

        return this.components;
    }

    /**
     * Get a set component by index
     *
     * @param {Number} [index=0] The component's index
     * @return {Component} The component at the specified index
     */
    getComponent(index) {
        return this.components[index || 0];
    }

    /**
     * Set a component
     *
     * @param {Component} component The component
     * @param {Boolean} [keepExisting=false] Whether to keep other set components
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setComponent(component, keepExisting, supressEvent){
        if(keepExisting !== true || !this.configs.allowMultiSelection){
            this.components.filter((comp) => comp !== component).forEach((comp) => {
                this.unsetComponent(comp);
            });
        }

        if(this.components.includes(component)){
            return this;
        }

        this.components.push(component);

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.get(0)).addClass('selected');

        if(!component.getPropertyValue('editor.locked')){
            component
                .setDraggable(true)
                .setResizable(true);
        }

        this.updateUI();

        if(supressEvent !== true){
            this.triggerEvent('componentset', {'component': component, 'count': this.components.length}, false);
            component.triggerEvent('selected', {'component': component});
        }

        return this;
    }

    /**
     * Unset an associated component
     *
     * @param {Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    unsetComponent(component, supressEvent, updateUI){
        if(!this.components.includes(component)){
            return this;
        }

        this.components.splice(this.components.indexOf(component), 1);

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.get(0))
            .removeClass('selected');

        component
            .setDraggable(false)
            .setResizable(false);

        if(updateUI !== false){
            this.updateUI();
        }

        if(supressEvent !== true){
            this.triggerEvent('componentunset', {'component': component, 'count': this.components.length}, false);
            component.triggerEvent('deselected', {'component': component});
        }

        return this;
    }

    /**
     * Unset all components
     *
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    unsetComponents(supressEvent){
        for (let i = this.components.length - 1; i >= 0; i -= 1) {
            this.unsetComponent(this.components[i], supressEvent, false);
        }

        this.updateUI();

        return this;
    }

    /**
     * The imagefields' resize event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    /*onImageFieldResize(evt){
        if(!evt.detail.value){
            return;
        }

        getImageMetadata(this.getComponent().get(0).baseURI + evt.detail.value, (error, metadata) => {
            if(error){
                return;
            }

            const values = [];
            this.components.forEach((component) => {
                const old_values = {
                    'width': component.getPropertyValue('width'),
                    'height': component.getPropertyValue('height')
                };

                component.setPropertyValues({'width': metadata.width, 'height': metadata.height});

                const new_values = {
                    'width': component.getPropertyValue('width'),
                    'height': component.getPropertyValue('height')
                };

                values.push({
                    component: component,
                    new_values: new_values,
                    old_values: old_values
                });
            });
        });
    }*/

}