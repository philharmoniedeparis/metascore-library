import ElementForm from './ElementForm';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import CheckboxInput from '../../core/ui/input/CheckboxInput';

import {className} from '../../../css/editor/configseditor/ContentForm.scss';

/**
 * A media component form class
 */
export default class ContentForm extends ElementForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        // fix event handlers scope
        this.onComponentDblClick = this.onComponentDblClick.bind(this);
        this.onComponentContentsClick = this.onComponentContentsClick.bind(this);
        this.onComponentContentsKey = this.onComponentContentsKey.bind(this);

        this.addClass(`content-form ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.ContentForm.title.single', 'Attributes of content'),
            'title_plural': Locale.t('editor.configseditor.ContentForm.title.plural', 'Attributes of @count contents'),
            'fields': [
                'name',
                'hidden',
                'scenario',
                'contents',
                'background',
                'border',
                'time',
                'position',
                'dimention'
            ]
        });
    }

    setComponents(components){
        super.setComponents(components);

        if(this.components.length === 1){
            this.contents_toggle.show();
            this.setupContentsEditMode();
        }
        else{
            this.contents_toggle.hide();
        }

        return this;
    }

    unsetComponents(){
        if(this.components.length === 1){
            this.destroyContentsEditMode();
        }

        super.unsetComponents();

        return this;
    }

    addField(name){
        switch(name){
            case 'contents':
                this.contents_toggle = new CheckboxInput({
                        'label': Locale.t('editor.configseditor.ContentForm.contents-toggle.label', 'Edit the content')
                    })
                    .addClass('toggle-button')
                    .addClass('contents-toggle')
                    .addListener('valuechange', this.onContentsToggleValueChange.bind(this))
                    .appendTo(this.fields_wrapper);
                break;

            default:
                super.addField(name);
        }

        return this;
    }

    onContentsToggleValueChange(evt){
        if(evt.detail.value){
            this.enterContentsEditMode();
        }
        else{
            this.exitContentsEditMode();
        }
    }

    /**
     * The text component dblclick event handler
     *
     * @private
     */
    onComponentDblClick(){
        this.contents_toggle.setValue(true);
    }

    /**
     * The component's contents click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentContentsClick(evt){
        evt.stopPropagation();
    }

    /**
     * The component's contents key event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentContentsKey(evt){
        evt.stopPropagation();
    }

    setupContentsEditMode(){
        const component = this.getMasterComponent();
        new Dom(component.get(0)).addListener('dblclick', this.onComponentDblClick);
    }

    destroyContentsEditMode(){
        this.exitContentsEditMode();

        const component = this.getMasterComponent();
        new Dom(component.get(0)).removeListener('dblclick', this.onComponentDblClick);
    }

    /**
     * Unlock the component's contents
     *
     * @param {Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    enterContentsEditMode(supressEvent){
        const component = this.getMasterComponent();

        this.contents_toggle.setValue(true, true);

        if(component._draggable){
            component._draggable.disable();
        }
        if(component._resizable){
            component._resizable.disable();
        }

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.contents.get(0))
            .attr('contenteditable', 'true')
            .addListener('click', this.onComponentContentsClick)
            .addListener('keydown', this.onComponentContentsKey)
            .addListener('keypress', this.onComponentContentsKey)
            .addListener('keyup', this.onComponentContentsKey);

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.get(0)).addClass('contents-unlocked');

        if(supressEvent !== true){
            this.triggerEvent('contentsunlock', {'component': component});
        }

        return this;
    }

    /**
     * Lock the component's contents
     *
     * @param {Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    exitContentsEditMode(supressEvent){
        const component = this.getMasterComponent();

        this.contents_toggle.setValue(false, true);

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.get(0)).removeClass('contents-unlocked');

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.contents.get(0))
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
            this.triggerEvent('contentslock', {'component': component});
        }

        return this;
    }
}