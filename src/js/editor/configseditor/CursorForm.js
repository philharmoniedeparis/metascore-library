import ElementForm from './ElementForm';
import Locale from '../../core/Locale';
import Field from '../Field';
import SelectInput from '../../core/ui/input/SelectInput';
import ColorInput from '../../core/ui/input/ColorInput';
import NumberInput from '../../core/ui/input/NumberInput';
import TimeInput from '../../core/ui/input/TimeInput';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import CursorKeyframesEditor from './CursorKeyframesEditor';

import {className} from '../../../css/editor/configseditor/CursorForm.scss';

/**
 * A media component form class
 */
export default class CursorForm extends ElementForm {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`cursor-form ${className}`);
    }

    /**
     * @inheritdoc
     */
    static getDefaults() {
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'title': Locale.t('editor.configseditor.CursorForm.title.single', 'Attributes of cursor'),
            'title_plural': Locale.t('editor.configseditor.CursorForm.title.plural', 'Attributes of @count cursors'),
            'fields': [
                'name',
                'hidden',
                'form',
                'direction',
                'start-angle',
                'acceleration',
                'keyframes',
                'loop-duration',
                'background',
                'border',
                'cursor-width',
                'cursor-color',
                'time',
                'position',
                'dimention'
            ]
        });
    }

    /**
     * @inheritdoc
     */
    setComponents(components){
        super.setComponents(components);

        if(this.components.length === 1){
            this.keyframes_toggle.show();
        }
        else{
            this.keyframes_toggle.hide();
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    unsetComponents(){
        if(this.components.length === 1){
            this.exitKeyframesEditMode();
        }

        super.unsetComponents();

        return this;
    }

    /**
     * @inheritdoc
     */
    onComponentPropChange(evt){
        if(evt.target === evt.currentTarget){
            const component = evt.detail.component;

            const form = component.getPropertyValue('form');
            const advanced = component.getPropertyValue('keyframes') ? true : false;

            if(form === 'linear' && advanced){
                const property = evt.detail.property;
                const direction = component.getPropertyValue('direction');
                const vertical = direction === 'top' || direction === 'bottom';

                if((property === 'width' && !vertical) || (property === 'height' && vertical)){
                    this.repositionCursorKeyframes(component, evt.detail.value / evt.detail.old);
                }
            }
        }

        super.onComponentPropChange(evt);
    }

    /**
     * @inheritdoc
     */
    onComponentResizeEnd(evt){
        const component = evt.target._metaScore;
        const advanced = component.getPropertyValue('keyframes') ? true : false;

        if(advanced){
            const direction = component.getPropertyValue('direction');
            const vertical = direction === 'top' || direction === 'bottom';
            const old_value = vertical ? evt.detail.start_state.h : evt.detail.start_state.w;
            const new_value = vertical ? component.getPropertyValue('height') : component.getPropertyValue('width');

            this.repositionCursorKeyframes(component, new_value / old_value);
        }

        super.onComponentResizeEnd(evt);
    }

    addField(name){
        switch(name){
            case 'form':
                this.fields[name] = new Field(
                    new SelectInput({
                        'options': {
                            'linear': Locale.t('editor.configseditor.CursorForm.fields.form.options.linear', 'Linear'),
                            'circular': Locale.t('editor.configseditor.CursorForm.fields.form.options.circular', 'Circular')
                        }
                    }),
                    {
                        'label': Locale.t('editor.configseditor.CursorForm.fields.form.label', 'Form')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'direction':
                this.fields[name] = new Field(
                    new SelectInput({
                        'options': {
                            'right': Locale.t('editor.configseditor.CursorForm.fields.direction.options.right', 'Left > Right'),
                            'left': Locale.t('editor.configseditor.CursorForm.fields.direction.options.left', 'Right > Left'),
                            'bottom': Locale.t('editor.configseditor.CursorForm.fields.direction.options.bottom', 'Top > Bottom'),
                            'top': Locale.t('editor.configseditor.CursorForm.fields.direction.options.top', 'Bottom > Top'),
                            'cw': Locale.t('editor.configseditor.CursorForm.fields.direction.options.cw', 'Clockwise'),
                            'ccw': Locale.t('editor.configseditor.CursorForm.fields.direction.options.ccw', 'Counterclockwise')
                        }
                    }),
                    {
                        'label': Locale.t('editor.configseditor.CursorForm.fields.direction.label', 'Direction')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'start-angle':
                this.fields[name] = new Field(
                    new NumberInput({
                        'min': 0,
                        'max': 360
                    }),
                    {
                        'label': Locale.t('editor.configseditor.CursorForm.fields.start-angle.label', 'Start angle')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'acceleration':
                break;

            case 'keyframes':
                this.keyframes_toggle = new CheckboxInput({
                        'label': Locale.t('editor.configseditor.CursorForm.keyframes-toggle.label', 'Record cursor positions')
                    })
                    .addClass('toggle-button')
                    .addClass('keyframes-toggle')
                    .addListener('valuechange', this.onKeyframesToggleValueChange.bind(this))
                    .appendTo(this.fields_wrapper);
                break;

            case 'loop-duration':
                this.fields[name] = new Field(
                    new TimeInput({
                        'clearButton': true
                    }),
                    {
                        'label': Locale.t('editor.configseditor.CursorForm.fields.loop-duration.label', 'Loop duration')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'cursor-width':
                this.fields[name] = new Field(
                    new NumberInput({
                        'min': 1
                    }),
                    {
                        'label': Locale.t('editor.configseditor.CursorForm.fields.cursor-width.label', 'Cursor width')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'cursor-color':
                this.fields[name] = new Field(
                    new ColorInput(),
                    {
                        'label': Locale.t('editor.configseditor.CursorForm.fields.cursor-color.label', 'Cursor color')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            default:
                super.addField(name);
        }

        return this;
    }

    onKeyframesToggleValueChange(evt){
        if(evt.detail.value){
            this.enterKeyframesEditMode();
        }
        else{
            this.exitKeyframesEditMode();
        }
    }

    /**
     * Unlock a cursor component's advance edit mode
     *
     * @param {Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    enterKeyframesEditMode(){
        const data = {};

        this.triggerEvent('beforecursoradvancededitmodeunlock', data, false);

        if('media' in data){
            const component = this.getMasterComponent();
            component._keyframes_editor = new CursorKeyframesEditor(component, data.media);
        }

        return this;
    }

    /**
     * Lock a cursor component's advance edit mode
     *
     * @param {Component} component The component
     * @return {this}
     */
    exitKeyframesEditMode(){
        const component = this.getMasterComponent();
        if(component._keyframes_editor){
            component._keyframes_editor.remove();
            delete component._keyframes_editor;
        }

        return this;
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
}
