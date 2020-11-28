import ElementForm from './ElementForm';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
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

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.CursorForm.title.single', 'Attributes of cursor'),
        'title_plural': Locale.t('editor.configseditor.CursorForm.title.plural', 'Attributes of @count cursors'),
        'fields': Object.assign({}, super.defaults.fields, {
            'form': {
                'label': Locale.t('editor.configseditor.CursorForm.fields.form.label', 'Form'),
                'input': {
                    'type': SelectInput,
                    'configs': {
                        'options': {
                            'linear': Locale.t('editor.configseditor.CursorForm.fields.form.options.linear', 'Linear'),
                            'circular': Locale.t('editor.configseditor.CursorForm.fields.form.options.circular', 'Circular')
                        },
                        'required': true
                    }
                }
            },
            'direction': {
                'label': Locale.t('editor.configseditor.CursorForm.fields.direction.label', 'Direction'),
                'input': {
                    'type': SelectInput,
                    'configs': {
                        'options': [],
                        'required': true
                    }
                }
            },
            'start-angle': {
                'label': Locale.t('editor.configseditor.CursorForm.fields.start-angle.label', 'Start angle'),
                'input': {
                    'type': NumberInput,
                    'configs': {
                        'min': 0,
                        'max': 360
                    }
                }
            },
            // TODO: re-add aceleration?
            'keyframes': {
                'input': {
                    'type': CheckboxInput,
                    'configs': {
                        'label': Locale.t('editor.configseditor.CursorForm.keyframes-toggle.label', 'Record positions')
                    },
                    'attributes': {
                        'class': 'toggle-button'
                    }
                }
            },
            'loop-duration': {
                'label': Locale.t('editor.configseditor.CursorForm.fields.loop-duration.label', 'Loop duration'),
                'input': {
                    'type': TimeInput,
                    'configs': {
                        'clearButton': true
                    }
                }
            },
            'cursor-width': {
                'label': Locale.t('editor.configseditor.CursorForm.fields.cursor-width.label', 'Cursor width'),
                'input': {
                    'type': NumberInput,
                    'configs': {
                        'min': 1
                    }
                }
            },
            'cursor-color': {
                'label': Locale.t('editor.configseditor.CursorForm.fields.cursor-color.label', 'Cursor color'),
                'input': {
                    'type': ColorInput,
                    'configs': {
                        'format': 'css'
                    }
                }
            }
        })
    });

    /**
     * @inheritdoc
     */
    constructor(...args) {
        // call parent constructor
        super(...args);

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
    setComponents(components){
        super.setComponents(components);

        if(this.components.length === 1){
            this.fields.keyframes.show();
        }
        else{
            this.fields.keyframes.hide();
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    unsetComponents(){
        this.fields.keyframes.setValue(false);

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

    /**
     * @inheritdoc
     */
    updateFieldValue(name, supressEvent){
        if (name !== 'keyframes') {
            super.updateFieldValue(name, supressEvent);
        }

        if(this.components){
            const master_component = this.getMasterComponent();

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

    /**
     * @inheritdoc
     */
    onFieldValueChange(evt){
        const name = evt.detail.field.data('property');
        const value = evt.detail.value;

        if(name === 'keyframes'){
            if(value){
                this.enterKeyframesEditMode();
            }
            else{
                this.exitKeyframesEditMode();
            }
            return;
        }

        super.onFieldValueChange(evt);
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
            'contextmenuContainer': this.editor
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
