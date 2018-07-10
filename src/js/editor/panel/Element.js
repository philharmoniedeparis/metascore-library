import Panel from '../Panel';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';

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

export default class Element extends Panel {

    /**
     * A panel for {{#crossLink "player.component.Element"}}{{/crossLink}} components
     *
     * @class Element
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={title:'Element', multiSelection: true, menuItems: {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
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

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'toolbarConfigs': {
                'title': Locale.t('editor.panel.Element.title', 'Element'),
                'menuItems': {
                    'Cursor': Locale.t('editor.panel.Element.menuItems.Cursor', 'Add a new cursor'),
                    'Image': Locale.t('editor.panel.Element.menuItems.Image', 'Add a new image'),
                    'Text': Locale.t('editor.panel.Element.menuItems.Text', 'Add a new text element'),
                    'delete': Locale.t('editor.panel.Element.menuItems.delete', 'Delete the active element')
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
        let page = component.getPage(),
            block = page.getBlock(),
            page_start_time, page_end_time,
            element_start_time, element_end_time,
            out_of_range = false;

        if(block.getPropertyValue('synched')){
            page_start_time = page.getPropertyValue('start-time');
            page_end_time = page.getPropertyValue('end-time');

            element_start_time = component.getPropertyValue('start-time');
            element_end_time = component.getPropertyValue('end-time');

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
        let component = this.getComponent(),
            base_uri = component.get(0).baseURI,
            old_src, new_src;

        old_src = component.getPropertyValue(property);
        new_src = url;

        if(old_src){
            this.getImageMetadata(base_uri + old_src, (old_metadata) => {
                let name = component.getPropertyValue('name'),
                    width = component.getPropertyValue('width'),
                    height = component.getPropertyValue('height');

                if((old_metadata.name === name) || (old_metadata.width === width && old_metadata.height === height)){
                    this.getImageMetadata(base_uri + new_src, (new_metadata) => {
                        if(old_metadata.name === name){
                            this.refreshFieldValue('name', new_metadata.name);
                        }

                        if(old_metadata.width === width && old_metadata.height === height){
                            this.refreshFieldValue('width', new_metadata.width);
                            this.refreshFieldValue('height', new_metadata.height);
                        }
                    });
                }
            });
        }
        else{
            this.getImageMetadata(base_uri + new_src, (new_metadata) => {
                this.refreshFieldValue('name', new_metadata.name);
                this.refreshFieldValue('width', new_metadata.width);
                this.refreshFieldValue('height', new_metadata.height);
            });
        }

    }

    /**
     * Get an image's metadata (name, width, and height)
     *
     * @method getImageMetadata
     * @private
     * @param {String} url The image's url
     * @param {Function} callback The callback to call with the retreived metadata
     */
    getImageMetadata(url, callback){
        var img = new Dom('<img/>')
            .addListener('load', () => {
                let el = img.get(0),
                    matches, name;

                matches = el.src.match(/([^/]*)\.[^.]*$/)
                if(matches){
                    name = matches[1];
                }

                callback({
                    'name': name,
                    'width': el.naturalWidth,
                    'height': el.naturalHeight
                });
            })
            .attr('src', url);
    }

    /**
     * Lock the component's text
     *
     * @method lockText
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
     * Unlock the component's text
     *
     * @method unlockText
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
