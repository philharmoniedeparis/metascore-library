import ElementForm from './ElementForm';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {isFunction} from '../../core/utils/Var';
import Field from '../Field';
import SelectInput from '../../core/ui/input/SelectInput';
import ColorInput from '../../core/ui/input/ColorInput';
import NumberInput from '../../core/ui/input/NumberInput';
import TimeInput from '../../core/ui/input/TimeInput';
import CheckboxInput from '../../core/ui/input/CheckboxInput';
import CursorKeyframesEditor from './CursorKeyframesEditor';

import {className} from '../../../css/editor/configseditor/CursorForm.scss';

/**
 * A cursor component form class
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

        this.direction_options = {
            'linear': {
                'right': Locale.t('editor.configseditor.CursorForm.fields.direction.options.right', 'Left > Right'),
                'left': Locale.t('editor.configseditor.CursorForm.fields.direction.options.left', 'Right > Left'),
                'bottom': Locale.t('editor.configseditor.CursorForm.fields.direction.options.bottom', 'Top > Bottom'),
                'top': Locale.t('editor.configseditor.CursorForm.fields.direction.options.top', 'Bottom > Top'),
            },
            'circular': {
                'cw': Locale.t('editor.configseditor.CursorForm.fields.direction.options.cw', 'Clockwise'),
                'ccw': Locale.t('editor.configseditor.CursorForm.fields.direction.options.ccw', 'Counterclockwise')
            }
        };
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
                'cursor-width',
                'cursor-color',
                'background',
                'border',
                'opacity',
                'time',
                'position',
                'dimension'
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
        this.keyframes_toggle.setValue(false);

        super.unsetComponents();

        return this;
    }

    /**
     * @inheritdoc
     */
    onComponentOwnPropChange(evt){
        const component = evt.detail.component;

        const form = component.getPropertyValue('form');
        const advanced = component.getPropertyValue('keyframes') ? true : false;

        if(form === 'linear' && advanced){
            const property = evt.detail.property;
            const direction = component.getPropertyValue('direction');
            const vertical = direction === 'top' || direction === 'bottom';

            if((property === 'width' && !vertical) || (property === 'height' && vertical)){
                this.repositionCursorKeyframes(component, evt.detail.value / evt.detail.previous);
            }
        }

        super.onComponentOwnPropChange(evt);
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
                        },
                        'required': true
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
                        'options': [],
                        'required': true
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
                        'label': Locale.t('editor.configseditor.CursorForm.keyframes-toggle.label', 'Record positions')
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

            case 'time': {
                    const wrapper = new Dom('<div/>', {'class': 'field-group time'})
                    .appendTo(this.fields_wrapper);

                    this.fields['start-time'] = new Field(
                        new TimeInput({
                            'inButton': true,
                            'outButton': true
                        }),
                        {
                            'label': Locale.t('editor.configseditor.CursorForm.fields.start-time.label', 'Start')
                        })
                        .data('property', 'start-time')
                        .appendTo(wrapper);

                    this.fields['end-time'] = new Field(
                        new TimeInput({
                            'inButton': true,
                            'outButton': true
                        }),
                        {
                            'label': Locale.t('editor.configseditor.CursorForm.fields.end-time.label', 'End')
                        })
                        .data('property', 'end-time')
                        .appendTo(wrapper);
                }
                break;

            default:
                super.addField(name);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    updateFieldValue(name, supressEvent){
        super.updateFieldValue(name, supressEvent);

        if(this.components){
            const master_component = this.getMasterComponent();

            // Toggle the keyframes toggle visibility.
            const prop = master_component.getProperty('keyframes');
            const toggle = !('applies' in prop) || !isFunction(prop.applies) || prop.applies.call(master_component);
            this.keyframes_toggle[toggle ? 'show' : 'hide']();

            if(name === 'form'){
                // Update the direction field options.
                const direction_input = this.getField('direction').getInput();
                const form = master_component.getPropertyValue(name);
                direction_input.clear();

                if(form in this.direction_options){
                    Object.entries(this.direction_options[form]).forEach(([key, value]) => {
                        direction_input.addOption(key, value);
                    });
                }
            }
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
     * @param {Boolean} supressEvent Whether to prevent the keyframeseditingstart event from firing
     * @return {this}
     */
    enterKeyframesEditMode(supressEvent){
        const component = this.getMasterComponent();
        this.keyframes_editor = new CursorKeyframesEditor(component, {
            'contextmenuContainer': this.editor.find('.workspace')
        });

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.get(0)).addClass('keyframes-editing');

        if(supressEvent !== true){
            this.triggerEvent('keyframeseditingstart', {'component': component, 'editor': this.keyframes_editor});
        }

        return this;
    }

    /**
     * Lock a cursor component's advance edit mode
     *
     * @param {Boolean} supressEvent Whether to prevent the keyframeseditingstop event from firing
     * @return {this}
     */
    exitKeyframesEditMode(supressEvent){
        const component = this.getMasterComponent();

        // Create a new Dom instance to workaround the different JS contexts of the player and editor.
        new Dom(component.get(0)).removeClass('keyframes-editing');

        if(this.keyframes_editor){
            this.keyframes_editor.remove();
            delete this.keyframes_editor;

            if(supressEvent !== true){
                this.triggerEvent('keyframeseditingstop', {'component': component, 'editor': this.keyframes_editor});
            }
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
        const keyframes = component.getPropertyValue('keyframes');

        if(keyframes){
            keyframes.forEach((keyframe) => {
                keyframe.position *= multiplier;
            });

            component.setPropertyValue('keyframes', keyframes);
        }

        return this;
    }
}
