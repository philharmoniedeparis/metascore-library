import Dom from '../core/Dom';
import {isArray} from '../core/utils/Var';
import ComponentForm from './configseditor/ComponentForm';
import VideoRendererForm from './configseditor/VideoRendererForm';
import ControllerForm from './configseditor/ControllerForm';
import BlockForm from './configseditor/BlockForm';
import BlockTogglerForm from './configseditor/BlockTogglerForm';
import PageForm from './configseditor/PageForm';
import ElementForm from './configseditor/ElementForm';
import CursorForm from './configseditor/CursorForm';
import ContentForm from './configseditor/ContentForm';
import SVGForm from './configseditor/SVGForm';
import AnimationForm from './configseditor/AnimationForm';

import {className} from '../../css/editor/ConfigsEditor.scss';

/**
 * A component form class
 *
 * @emits {componentset} Fired when a component is set
 * @param {Component} component The component
 *
 * @emits {componentunset} Fired when a component is unset
 * @param {Component} component The component
 *
 * @emits {formset} Fired when the form is set
 * @param {ComponentForm} form The form
 *
 * @emits {formunset} Fired when the form is removed
 * @param {ComponentForm} form The form
 *
 * @todo: implement old editor.panel.Element methods
 */
export default class ConfigsEditor extends Dom {

    /**
     * Instantiate
     *
     * @param {Editor} editor The Editor instance
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [allowMultiSelection=true] Whether multiple selection is allowed
     */
    constructor(editor, configs) {
        // call parent constructor
        super('<div/>', {'class': `configs-editor ${className}`});

        /**
         * A reference to the Editor instance
         * @type {Editor}
         */
        this.editor = editor;

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
            'Component': new ComponentForm(this.editor),
            'VideoRenderer': new VideoRendererForm(this.editor),
            'Controller': new ControllerForm(this.editor),
            'Block': new BlockForm(this.editor),
            'BlockToggler': new BlockTogglerForm(this.editor),
            'Page': new PageForm(this.editor),
            'Element': new ElementForm(this.editor),
            'Cursor': new CursorForm(this.editor),
            'Content': new ContentForm(this.editor),
            'SVG': new SVGForm(this.editor),
            'Animation': new AnimationForm(this.editor)
        };

        /**
         * The list of selected components
         * @type {Array}
         */
        this.components = [];

        this
            .addDelegate('.content-form', 'contentsunlock', this.onContentFormContentsUnlock.bind(this))
            .addDelegate('.content-form', 'contentschange', this.onContentFormContentsChange.bind(this))
            .addDelegate('.content-form', 'contentslock', this.onContentFormContentsLock.bind(this));
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
     * ContentForm contentsunlock event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onContentFormContentsUnlock(evt){
        const component = evt.detail.component;
        component.addClass('isolate');

        this.editor.getPlayer().addClass('isolating');
        this.editor.addClass('contents-unlocked');
    }

    /**
     * ContentForm contentschange event callback
     *
     * @private
     */
    onContentFormContentsChange(){
        this.editor.setDirty('components');
    }

    /**
     * ContentForm contentslock event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onContentFormContentsLock(evt){
        const component = evt.detail.component;
        component.removeClass('isolate');

        this.editor.getPlayer().removeClass('isolating');
        this.editor.removeClass('contents-unlocked');
    }

    /**
     * CursorForm keyframeseditingstart event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onCursorFormKeyframesEditingStart(evt){
        const component = evt.detail.component;
        component.addClass('isolate');

        this.editor.getPlayer().addClass('isolating');
        this.editor.addClass('cursor-keyframes-editing');
    }

    /**
     * CursorForm keyframeseditingstop event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onCursorFormKeyframesEditingStop(evt){
        const component = evt.detail.component;
        component.removeClass('isolate');

        this.editor.getPlayer().removeClass('isolating');
        this.editor.removeClass('cursor-keyframes-editing');
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

    getForms(){
        return this.forms;
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

            this.triggerEvent('formunset', {'form': this.form});

            delete this.form;
        }

        if(form){
            // Add the new form
            this.form = form.appendTo(this);

            this.triggerEvent('formset', {'form': form});

            this.form.setComponents(components);
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
     * @param {Boolean} updateUI Whether to update the UI
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
