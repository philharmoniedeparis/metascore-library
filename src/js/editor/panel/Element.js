import Panel from '../Panel';
import Locale from '../../core/Locale';
import {getImageMetadata} from '../../core/utils/Media';

/**
 * Fired when a component's text is locked
 *
 * @event textlock
 * @param {Object} component The component instance
 */
const EVT_TEXTLOCK = 'textlock';

/**
 * Fired when a component's text is unlocked
 *
 * @event textunlock
 * @param {Object} component The component instance
 */
const EVT_TEXTUNLOCK = 'textunlock';

/**
 * A panel for Element components
 */
export default class Element extends Panel {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Object} [toolbarConfigs={title:'Element', multiSelection: true, menuItems: {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        // fix event handlers scope
        this.onComponentDblClick = this.onComponentDblClick.bind(this);
        this.onComponentContentsClick = this.onComponentContentsClick.bind(this);
        this.onComponentContentsKey = this.onComponentContentsKey.bind(this);

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
     * @method getSelectorLabel
     * @return {String} The component's label for use in the selector
     */
    getSelectorLabel(component){
        const page = component.getPage();
        const block = page.getBlock();
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
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    onFieldValueChange(evt){
        const component = this.getComponent();

        if(component){
            const name = evt.detail.field.data('name');
            const value = evt.detail.value;

            if(component.instanceOf('Image') && name === 'background-image'){
                this.onBeforeImageSet(name, value);
                return;
            }

            if(component.instanceOf('Text') && name === 'text-locked'){
                if(value === true){
                    this.lockText(component);
                }
                else{
                    this.unlockText(component);
                }
            }
        }

        super.onFieldValueChange(evt);
    }

    /**
     * The componentset event handler
     *
     * @method onComponentSet
     * @private
     * @param {Event} evt The event object
     */
    onComponentSet(evt){
        const component = evt.detail.component;
        const count = evt.detail.count;

        this.lockText(component);

        const field = this.getField('text-locked');
        if(field){
            field.setValue(true, true);

            if(count > 1){
                field.hide();
            }
        }
    }

    /**
     * The componentunset event handler
     *
     * @method onComponentUnset
     * @private
     * @param {Event} evt The event object
     */
    onComponentUnset(evt){
        const component = evt.detail.component;
        const count = evt.detail.count;

        this.lockText(component);

        const field = this.getField('text-locked');
        if(field){
            field.setValue(true, true);

            if(count === 1){
                field.show();
            }
        }

        return this;
    }

    /**
     * The beforeimageset event handler
     *
     * @method onBeforeImageSet
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
     * Lock a component's text
     *
     * @param {Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    lockText(component, supressEvent){
        if(component.instanceOf('Text')){
            component
                .addListener('dblclick', this.onComponentDblClick)
                .removeClass('text-unlocked');

            component.contents
                .attr('contenteditable', null)
                .removeListener('click', this.onComponentContentsClick)
                .removeListener('keydown', this.onComponentContentsKey)
                .removeListener('keypress', this.onComponentContentsKey)
                .removeListener('keyup', this.onComponentContentsKey);

            if(component._draggable){
                component._draggable.enable();
            }
            if(component._resizable){
                component._resizable.enable();
            }

            if(supressEvent !== true){
                this.triggerEvent(EVT_TEXTLOCK, {'component': component}, false);
            }
        }

        return this;
    }

    /**
     * Unlock a component's text
     *
     * @param {Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    unlockText(component, supressEvent){
        if(component.instanceOf('Text')){
            if(component._draggable){
                component._draggable.disable();
            }
            if(component._resizable){
                component._resizable.disable();
            }

            component.contents
                .attr('contenteditable', 'true')
                .addListener('click', this.onComponentContentsClick)
                .addListener('keydown', this.onComponentContentsKey)
                .addListener('keypress', this.onComponentContentsKey)
                .addListener('keyup', this.onComponentContentsKey);

            component
                .removeListener('dblclick', this.onComponentDblClick)
                .addClass('text-unlocked');

            if(supressEvent !== true){
                this.triggerEvent(EVT_TEXTUNLOCK, {'component': component}, false);
            }
        }

        return this;
    }

    /**
     * The component dblclick event handler
     *
     * @method onComponentDblClick
     * @private
     */
    onComponentDblClick(){
        this.refreshFieldValue('text-locked', false);
    }

    /**
     * The component's contents click event handler
     *
     * @method onComponentContentsClick
     * @private
     * @param {Event} evt The event object
     */
    onComponentContentsClick(evt){
        evt.stopPropagation();
    }

    /**
     * The component's contents key event handler
     *
     * @method onComponentContentsKey
     * @private
     * @param {Event} evt The event object
     */
    onComponentContentsKey(evt){
        evt.stopPropagation();
    }

}
