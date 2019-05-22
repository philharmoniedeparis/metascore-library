import Dom from '../../core/Dom';
import Panel from '../Panel';
import Locale from '../../core/Locale';
import {getImageMetadata} from '../../core/utils/Media';
import CursorKeyframesEditor from './element/CursorKeyframesEditor';

/**
 * A panel for Element components
 *
 * @emits {textlock} Fired when a component's text is locked
 * @param {Object} component The component instance
 *
 * @emits {textunlock} Fired when a component's text is unlocked
 * @param {Object} component The component instance
 *
 * @emits {beforecursoradvancededitmodeunlock} Fired when a cursor component's advanced edit mode is locked
 */
export default class Element extends Panel {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [toolbarConfigs={title:'Element', multiSelection: true, menuItems: {...}}] Configs to pass to the toolbar (see {@link Toolbar})
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        // fix event handlers scope
        this.onTextDblClick = this.onTextDblClick.bind(this);
        this.onTextContentsClick = this.onTextContentsClick.bind(this);
        this.onTextContentsKey = this.onTextContentsKey.bind(this);
        this.onCursorPropChange = this.onCursorPropChange.bind(this);
        this.onCursorResizeEnd = this.onCursorResizeEnd.bind(this);

        this
            .addClass('element')
            .addListener('componentset', this.onComponentSet.bind(this))
            .addListener('componentunset', this.onComponentUnset.bind(this));
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'toolbarConfigs': {
                'title': Locale.t('editor.panel.Element.title', 'Element'),
                'menuItems': {
                    'Cursor': Locale.t('editor.panel.Element.menuItems.Cursor', 'Add a new cursor'),
                    'Image': Locale.t('editor.panel.Element.menuItems.Image', 'Add a new image'),
                    'Text': Locale.t('editor.panel.Element.menuItems.Text', 'Add a new text element'),
                    'delete': Locale.t('editor.panel.Element.menuItems.delete', 'Delete the selected elements')
                }
            }
        });
    }

    /**
     * Get the currently associated component's label
     *
     * @return {String} The component's label for use in the selector
     */
    getSelectorLabel(component){
        const page = component.getParent();
        const block = page.getParent();
        let out_of_range = false;

        if(block.getPropertyValue('synched')){
            const page_start_time = page.getPropertyValue('start-time');
            const page_end_time = page.getPropertyValue('end-time');

            const element_start_time = component.getPropertyValue('start-time');
            const element_end_time = component.getPropertyValue('end-time');

            out_of_range = ((element_start_time !== null) && (element_start_time < page_start_time)) || ((element_end_time !== null) && (element_end_time > page_end_time));
        }

        return (out_of_range ? '*' : '') + component.getName();
    }

    /**
     * The fields' valuechange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onFieldValueChange(evt){
        const component = this.getComponent();

        if(component){
            const name = evt.detail.field.data('name');
            const value = evt.detail.value;

            if(component.instanceOf('Image')){
                if(name === 'background-image'){
                    this.onBeforeImageSet(name, value);
                    return;
                }
            }
            else if(component.instanceOf('Text')){
                if(name === 'edit-text'){
                    if(value === true){
                        this.unlockText(component);
                    }
                    else{
                        this.lockText(component);
                    }
                }
            }
            else if(component.instanceOf('Cursor')){
                switch(name){
                    case 'keyframes-edit-mode':
                        if(value === true){
                            this.unlockCursorAdvancedEditMode(component);
                        }
                        else{
                            this.lockCursorAdvancedEditMode(component);
                        }
                        break;

                    case 'form':
                    case 'mode':
                        this.lockCursorAdvancedEditMode(component);
                        break;

                }
            }

        }

        super.onFieldValueChange(evt);
    }

    /**
     * The componentset event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentSet(evt){
        const component = evt.detail.component;

        if(component.instanceOf('Text')){
            this.lockText(component);
        }
        else if(component.instanceOf('Cursor')){
            component
                .addListener('propchange', this.onCursorPropChange)
                .addListener('resizeend', this.onCursorResizeEnd);
        }
    }

    /**
     * The componentunset event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentUnset(evt){
        const component = evt.detail.component;

        if(component.instanceOf('Text')){
            this.lockText(component);
        }
        else if(component.instanceOf('Cursor')){
            this.lockCursorAdvancedEditMode(component);

            component
                .removeListener('propchange', this.onCursorPropChange)
                .removeListener('resizeend', this.onCursorResizeEnd);
        }

        return this;
    }

    /**
     * The beforeimageset event handler
     *
     * @private
     * @param {String} property The updated component property's name
     * @param {String} url The new image url
     */
    onBeforeImageSet(property, url){
        const promises = [];

        this.components.forEach((component) => {
            const promise = new Promise((resolve, reject) => {
                const name = component.getPropertyValue('name');
                const width = component.getPropertyValue('width');
                const height = component.getPropertyValue('height');

                const base_uri = component.get(0).baseURI;
                const old_src = component.getPropertyValue(property);
                const new_src = url;

                if(old_src){
                    getImageMetadata(base_uri + old_src, (old_error, old_metadata) => {
                        if(old_error){
                            reject(old_error);
                            return;
                        }

                        const new_values = {
                            [property]: new_src
                        };
                        const old_values = {
                            [property]: old_src
                        };

                        if((old_metadata.name !== name) && (old_metadata.width !== width || old_metadata.height !== height)){
                            resolve({
                                component: component,
                                new_values: new_values,
                                old_values: old_values
                            });
                        }

                        getImageMetadata(base_uri + new_src, (new_error, new_metadata) => {
                            if(new_error){
                                reject(new_error);
                                return;
                            }

                            if(old_metadata.name === name){
                                new_values.name = new_metadata.name;
                                old_values.name = name;
                            }

                            if(old_metadata.width === width && old_metadata.height === height){
                                new_values.width = new_metadata.width;
                                new_values.height = new_metadata.height;
                                old_values.width = width;
                                old_values.height = height;
                            }

                            resolve({
                                component: component,
                                new_values: new_values,
                                old_values: old_values
                            });
                        });
                    });
                }
                else{
                    getImageMetadata(base_uri + new_src, (new_error, new_metadata) => {
                        if(new_error){
                            reject(new_error);
                            return;
                        }

                        resolve({
                            component: component,
                            new_values: {
                                [property]: new_src,
                                name: new_metadata.name,
                                width: new_metadata.width,
                                height: new_metadata.height
                            },
                            old_values: {
                                [property]: old_src,
                                name: name,
                                width: width,
                                height: height
                            }
                        });
                    });
                }
            })
            .catch((err) => {
                console.error(err);
            });

            promises.push(promise);
        });

        Promise.all(promises).then((results) => {
            const _results = results.filter((result) => typeof result !== "undefined");

            _results.forEach((result) => {
                this.setPropertyValues(result.component, result.new_values);
            });

            this.triggerEvent('valueschange', results, false);
        });
    }

    /**
     * The text component dblclick event handler
     *
     * @private
     */
    onTextDblClick(){
        this.getField('edit-text').setValue(true);
    }

    /**
     * The text component's contents click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onTextContentsClick(evt){
        evt.stopPropagation();
    }

    /**
     * The text component's contents key event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onTextContentsKey(evt){
        evt.stopPropagation();
    }

    /**
     * The cursor component's propchange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onCursorPropChange(evt){
        if(evt.target !== evt.currentTarget){
            // Caught a bubbled event, skip
            return;
        }

        const component = evt.detail.component;
        const mode = component.getPropertyValue('mode');

        if(mode !== 'advanced'){
            return;
        }

        const property = evt.detail.property;
        const direction = component.getPropertyValue('direction');
        const vertical = direction === 'top' || direction === 'bottom';

        if((property === 'width' && !vertical) || (property === 'height' && vertical)){
            this.repositionCursorKeyframes(component, evt.detail.value / evt.detail.old);
        }
    }

    /**
     * The cursor component's resizeend event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onCursorResizeEnd(evt){
        const component = evt.target._metaScore;
        const mode = component.getPropertyValue('mode');

        if(mode !== 'advanced'){
            return;
        }

        const direction = component.getPropertyValue('direction');
        const vertical = direction === 'top' || direction === 'bottom';
        const old_value = vertical ? evt.detail.start_state.h : evt.detail.start_state.w;
        const new_value = vertical ? component.getPropertyValue('height') : component.getPropertyValue('width');

        this.repositionCursorKeyframes(component, new_value / old_value);
    }

    /**
     * Helper method to reposition a cursor component's keyframes after a resize
     *
     * @private
     * @param {Component} component The cursor component
     * @param {Number} multiplier A multiplier to multiply the position of each keyframe with
     * @return {this}
     */
    repositionCursorKeyframes(component, multiplier){
        if(component._keyframes_editor){
            component._keyframes_editor.keyframes.forEach((keyframe) => {
                keyframe.position *= multiplier;
            });

            component._keyframes_editor
                .updateComponentKeyframes()
                .draw();
        }
        else{
            const keyframes = CursorKeyframesEditor.parseComponentKeyframes(component);

            keyframes.forEach((keyframe) => {
                keyframe.position *= multiplier;
            });

            CursorKeyframesEditor.updateComponentKeyframes(component, keyframes);
        }

        return this;
    }

    /**
     * Lock a text component's contents
     *
     * @param {Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    lockText(component, supressEvent){
        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.get(0))
            .addListener('dblclick', this.onTextDblClick)
            .removeClass('text-unlocked');

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.contents.get(0))
            .attr('contenteditable', null)
            .removeListener('click', this.onTextContentsClick)
            .removeListener('keydown', this.onTextContentsKey)
            .removeListener('keypress', this.onTextContentsKey)
            .removeListener('keyup', this.onTextContentsKey);

        if(component._draggable){
            component._draggable.enable();
        }
        if(component._resizable){
            component._resizable.enable();
        }

        if(supressEvent !== true){
            this.triggerEvent('textlock', {'component': component}, false);
        }

        return this;
    }

    /**
     * Unlock a text component's contents
     *
     * @param {Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    unlockText(component, supressEvent){
        if(component._draggable){
            component._draggable.disable();
        }
        if(component._resizable){
            component._resizable.disable();
        }

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.contents.get(0))
            .attr('contenteditable', 'true')
            .addListener('click', this.onTextContentsClick)
            .addListener('keydown', this.onTextContentsKey)
            .addListener('keypress', this.onTextContentsKey)
            .addListener('keyup', this.onTextContentsKey);

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.get(0))
            .removeListener('dblclick', this.onTextDblClick)
            .addClass('text-unlocked');

        if(supressEvent !== true){
            this.triggerEvent('textunlock', {'component': component}, false);
        }

        return this;
    }

    /**
     * Lock a cursor component's advance edit mode
     *
     * @param {Component} component The component
     * @return {this}
     */
    lockCursorAdvancedEditMode(component){
        if(component._keyframes_editor){
            component._keyframes_editor.remove();
            delete component._keyframes_editor;
        }

        return this;
    }

    /**
     * Unlock a cursor component's advance edit mode
     *
     * @param {Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    unlockCursorAdvancedEditMode(component){
        const data = {};

        this.triggerEvent('beforecursoradvancededitmodeunlock', data, false);

        if('media' in data){
            component._keyframes_editor = new CursorKeyframesEditor(component, data.media);
        }

        return this;
    }

}
