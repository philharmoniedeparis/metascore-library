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
     * @param {Object} [configs.toolbarConfigs={'title':'Element', 'menuItems': {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        // fix event handlers scope
        this.onComponentDblClick = this.onComponentDblClick.bind(this);
        this.onComponentContentsClick = this.onComponentContentsClick.bind(this);
        this.onComponentContentsKey = this.onComponentContentsKey.bind(this);

        this.addClass('element');

        this
            .addListener('componentset', this.onComponentSet.bind(this))
            .addListener('componentbeforeunset', this.onComponentBeforeUnset.bind(this));
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

        if(block.getProperty('synched')){
            page_start_time = page.getProperty('start-time');
            page_end_time = page.getProperty('end-time');

            element_start_time = component.getProperty('start-time');
            element_end_time = component.getProperty('end-time');

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
        let component = this.getComponent(),
            name = evt.detail.field.data('name'),
            type;

        if(component){
            type = component.getProperty('type');

            switch(type){
                case 'Image':
                    if(evt.detail.field.data('name') === 'background-image'){
                        this.onBeforeImageSet(name, evt.detail.value);
                    }
                    break;

                case 'Text':
                    if(evt.detail.field.data('name') === 'text-locked'){
                        if(evt.detail.value === true){
                            this.lockText();
                        }
                        else{
                            this.unlockText();
                        }
                    }
                    break;
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
        if(evt.detail.component.getProperty('type') === 'Text'){
            this.updateFieldValue('text-locked', true);
        }
    }

    /**
     * The componentunset event handler
     *
     * @method onComponentUnset
     * @private
     * @param {Event} evt The event object
     */
    onComponentBeforeUnset(evt){
        if(evt.detail.component.getProperty('type') === 'Text'){
            this.updateFieldValue('text-locked', true);
        }
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
        let panel = this,
            component = panel.getComponent(),
            old_src, new_src;

        old_src = component.getProperty(property);
        new_src = url;

        if(old_src){
            panel.getImageMetadata(old_src, (old_metadata) => {
                let name = component.getProperty('name'),
                    width = component.getProperty('width'),
                    height = component.getProperty('height');

                if((old_metadata.name === name) || (old_metadata.width === width && old_metadata.height === height)){
                    panel.getImageMetadata(new_src, (new_metadata) => {
                        if(old_metadata.name === name){
                            panel.updateFieldValue('name', new_metadata.name);
                        }

                        if(old_metadata.width === width && old_metadata.height === height){
                            panel.updateFieldValue('width', new_metadata.width);
                            panel.updateFieldValue('height', new_metadata.height);
                        }
                    });
                }
            });
        }
        else{
            panel.getImageMetadata(new_src, (new_metadata) => {
                panel.updateFieldValue('name', new_metadata.name);
                panel.updateFieldValue('width', new_metadata.width);
                panel.updateFieldValue('height', new_metadata.height);
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
    lockText(supressEvent){
        const component = this.getComponent();

        if(component){
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
    unlockText(supressEvent){
        const component = this.getComponent();

        if(component){
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
        this.updateFieldValue('text-locked', false);
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
