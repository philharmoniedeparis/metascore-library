import ElementForm from './ElementForm';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import CheckboxInput from '../../core/ui/input/CheckboxInput';

import {className} from '../../../css/editor/configseditor/ContentForm.scss';

/**
 * A content component form class
 */
export default class ContentForm extends ElementForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.ContentForm.title.single', 'Attributes of content'),
        'title_plural': Locale.t('editor.configseditor.ContentForm.title.plural', 'Attributes of @count contents'),
        'fields': Object.assign({}, super.defaults.fields, {
            'contents-toggle': {
                'input': {
                    'type': CheckboxInput,
                    'configs': {
                        'label': Locale.t('editor.configseditor.ContentForm.contents-toggle.label', 'Edit the content')
                    },
                    'attributes': {
                        'class': 'toggle-button',
                    }
                }
            },
        })
    });

    /**
     * @inheritdoc
     */
    constructor(...args) {
        // call parent constructor
        super(...args);

        this.addClass(className);

        // fix event handlers scope
        this.onComponentDblClick = this.onComponentDblClick.bind(this);
        this.onComponentContentsClick = this.onComponentContentsClick.bind(this);
        this.onComponentContentsInput = this.onComponentContentsInput.bind(this);
        this.onComponentDragOver = this.onComponentDragOver.bind(this);
        this.onComponentContentsKey = this.onComponentContentsKey.bind(this);

        this.editor.addListener('previewmode', this.onEditorPreviewMode.bind(this));

        this.wysiwyg_container = new Dom('<div/>', {'class': 'wysiwyg-container'})
            .appendTo(this.fields_wrapper);

        new Dom('<div/>', {'id': 'wysiwyg-top'})
            .appendTo(this.wysiwyg_container);

        new Dom('<div/>', {'id': 'wysiwyg-bottom'})
            .appendTo(this.wysiwyg_container);
    }

    /**
     * @inheritdoc
     */
    setComponents(components){
        super.setComponents(components);

        if(this.components.length === 1){
            this.getField('contents-toggle').show();

            const component = this.getMasterComponent();
            new Dom(component.get(0)).addListener('dblclick', this.onComponentDblClick);
        }
        else{
            this.getField('contents-toggle').hide();
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    unsetComponents(){
        this.getField('contents-toggle').getInput().setValue(false);

        const component = this.getMasterComponent();
        new Dom(component.get(0)).removeListener('dblclick', this.onComponentDblClick);

        super.unsetComponents();

        return this;
    }

    /**
     * The editor previewmode event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onEditorPreviewMode(evt) {
        if(evt.detail.preview){
            this.exitContentsEditMode();
        }
    }

    /**
     * @inheritdoc
     */
    onFieldValueChange(evt) {
        const name = evt.detail.field.data('property');
        const value = evt.detail.value;

        if(name === 'contents-toggle'){
            if(value){
                this.enterContentsEditMode();
            }
            else{
                this.exitContentsEditMode();
            }
            return;
        }

        super.onFieldValueChange(evt);
    }

    /**
     * The component's contents dblclick event handler
     *
     * @private
     */
    onComponentDblClick(){
        if (!this.editor.inPreviewMode()) {
            this.getField('contents-toggle').getInput().setValue(true);
        }
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
     * The component's contents input event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentContentsInput(evt){
        const component = Dom.closest(evt.target, '.metaScore-component.Content')._metaScore;
        this.triggerEvent('contentschange', {'component': component});
    }

    /**
     * The component's dragover event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onComponentDragOver(evt){
        evt.currentTarget.focus();
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

    /**
     * Unlock the component's contents
     *
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    enterContentsEditMode(supressEvent){
        if(!this.hasClass('contents-unlocked')){
            const component = this.getMasterComponent();

            this.getField('contents-toggle').getInput().setValue(true, true);

            const draggable = component.getDraggable();
            if(draggable){
                draggable.disable();
            }

            const resizable = component.getResizable();
            if(resizable){
                resizable.disable();
            }

            // Create a new Dom instance to workaround the different JS contexts of the player and editor.
            new Dom(component.contents.get(0))
                .attr('contenteditable', 'true')
                .addListener('click', this.onComponentContentsClick)
                .addListener('input', this.onComponentContentsInput)
                .addListener('dragover', this.onComponentDragOver)
                .addListener('keydown', this.onComponentContentsKey)
                .addListener('keypress', this.onComponentContentsKey)
                .addListener('keyup', this.onComponentContentsKey);

            // Create a new Dom instance to workaround the different JS contexts of the player and editor.
            new Dom(component.get(0)).addClass('contents-unlocked');

            this.addClass('contents-unlocked');

            if(supressEvent !== true){
                this.triggerEvent('contentsunlock', {'component': component});
            }
        }

        return this;
    }

    /**
     * Lock the component's contents
     *
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    exitContentsEditMode(supressEvent){
        if(this.hasClass('contents-unlocked')){
            const component = this.getMasterComponent();

            this.getField('contents-toggle').getInput().setValue(false, true);

            const draggable = component.getDraggable();
            if(draggable){
                draggable.enable();
            }

            const resizable = component.getResizable();
            if(resizable){
                resizable.enable();
            }

            // Create a new Dom instance to workaround the different JS contexts of the player and editor.
            new Dom(component.contents.get(0))
                .attr('contenteditable', null)
                .removeListener('click', this.onComponentContentsClick)
                .removeListener('input', this.onComponentContentsInput)
                .removeListener('dragover', this.onComponentDragOver)
                .removeListener('keydown', this.onComponentContentsKey)
                .removeListener('keypress', this.onComponentContentsKey)
                .removeListener('keyup', this.onComponentContentsKey);

            // Create a new Dom instance to workaround the different JS contexts of the player and editor.
            new Dom(component.get(0)).removeClass('contents-unlocked');

            this.removeClass('contents-unlocked');

            if(supressEvent !== true){
                this.triggerEvent('contentslock', {'component': component});
            }
        }

        return this;
    }
}
