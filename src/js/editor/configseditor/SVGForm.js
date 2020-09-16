import ElementForm from './ElementForm';
import Locale from '../../core/Locale';
import Dom from '../../core/Dom';
import { isString } from '../../core/utils/Var';
import Field from '../Field';
import SelectInput from '../../core/ui/input/SelectInput';
import NumberInput from '../../core/ui/input/NumberInput';
import ColorInput from '../../core/ui/input/ColorInput';
import HiddenInput from '../../core/ui/input/HiddenInput';

import {className} from '../../../css/editor/configseditor/SVGForm.scss';

/**
 * An svg component form class
 */
export default class SVGForm extends ElementForm {

    static defaults = Object.assign({}, super.defaults, {
        'title': Locale.t('editor.configseditor.SVGForm.title.single', 'Attributes of vector graphic'),
        'title_plural': Locale.t('editor.configseditor.SVGForm.title.plural', 'Attributes of @count vector graphics'),
        'fields': [
            'name',
            'hidden',
            'stroke',
            'stroke-width',
            'stroke-dasharray',
            'fill',
            'marker-start',
            'marker-mid',
            'marker-end',
            'colors',
            'background',
            'border',
            'opacity',
            'time',
            'position',
            'dimension'
        ]
    });

    /**
     * @inheritdoc
     */
    constructor(...args) {
        // call parent constructor
        super(...args);

        // fix event handlers scope
        this.onComponentLoad = this.onComponentLoad.bind(this);

        this.addClass(`svg-form ${className}`);
    }

    addField(name){
        switch(name){
            case 'stroke':
                this.fields[name] = new Field(
                    new ColorInput({'format': 'css'}),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.stroke.label', 'Stroke color')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'stroke-width':
                this.fields[name] = new Field(
                    new NumberInput({
                        'min': 0
                    }),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.stroke-width.label', 'Stroke width')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                break;

            case 'stroke-dasharray':
                this.fields[name] = new Field(
                    new SelectInput({
                        'emptyLabel': '—',
                        'options': {
                            '2,2': '···',
                            '5,5': '- -',
                            '5,2,2,2': '-·-',
                            '5,2,2,2,2,2': '-··-'
                        }
                    }),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.stroke-dasharray.label', 'Stroke style')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                    break;

            case 'fill':
                this.fields[name] = new Field(
                    new ColorInput({'format': 'css'}),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.fill.label', 'Fill color')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                    break;

            case 'marker-start':
                this.fields[name] = new Field(
                    new SelectInput(),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.marker-start.label', 'Marker start')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                    break;

            case 'marker-mid':
                this.fields[name] = new Field(
                    new SelectInput(),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.marker-mid.label', 'Marker mid')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                    break;

            case 'marker-end':
                this.fields[name] = new Field(
                    new SelectInput(),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.marker-end.label', 'Marker end')
                    })
                    .data('property', name)
                    .appendTo(this.fields_wrapper);
                    break;

            case 'colors':
                this.fields.colors = new Field(
                    new HiddenInput(),
                    {
                        'label': Locale.t('editor.configseditor.SVGForm.fields.colors.label', 'Colors')
                    })
                    .data('property', 'colors')
                    .appendTo(this.fields_wrapper);

                this.colors_subinputs = [
                    new ColorInput({'format': 'css', 'picker': false})
                        .addListener('valuechange', this.onColorsInputValueChange.bind(this))
                        .appendTo(this.fields.colors),
                    new ColorInput({'format': 'css', 'picker': false})
                        .addListener('valuechange', this.onColorsInputValueChange.bind(this))
                        .appendTo(this.fields.colors),
                ];
                break;

            default:
                super.addField(name);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    setComponents(components){
        super.setComponents(components);

        this.updateInputs();

        this.getComponents().forEach((component) => {
            if(!component.isLoaded()){
                component.addListener('contentload', this.onComponentLoad);
            }
        });

        return this;
    }

    /**
     * @inheritdoc
     */
    unsetComponents(supressEvent){
        if(this.components){
            this.components.forEach((component) => {
                component.removeListener('contentload', this.onComponentLoad);
            });
        }

        this.updateInputs();

        super.unsetComponents(supressEvent);

        return this;
    }

    /**
     * Component contentload event handler.
     *
     * @private
     */
    onComponentLoad(){
        this.updateInputs();
    }

    /**
     * Colors sub-inputs valuechange event handler
     *
     * @private
     */
    onColorsInputValueChange(){
        const colors = [];
        this.colors_subinputs.forEach((input) => {
            if (!input.disabled) {
                colors.push(input.getValue());
            }
        });
        this.getField('colors').getInput().setValue(colors);
    }

    /**
     * @inheritdoc
     */
    onFieldValueChange(evt) {
        const name = evt.detail.field.data('property');
        const value = evt.detail.value;

        if (name === 'colors' && isString(value)) {
            evt.detail.value = value.split(',');
        }

        super.onFieldValueChange(evt);
    }

    /**
     * @inheritdoc
     */
    updateFieldValue(name, supressEvent){
        super.updateFieldValue(name, supressEvent);

        // Update colors sub-inputs values.
        if(name === 'colors' && this.components){
            const master_component = this.getMasterComponent();
            const value = master_component.getPropertyValue(name);

            this.colors_subinputs.forEach((input, index) => {
                input.setValue(value ? value[index] : null, true);
            });
        }
    }

    /**
     * Update inputs.
     *
     * @private
     */
    updateInputs(){
        const marker_start_input = this.getField('marker-start').getInput().clear().disable();
        const marker_mid_input = this.getField('marker-mid').getInput().clear().disable();
        const marker_end_input = this.getField('marker-end').getInput().clear().disable();

        const components = this.getComponents();
        if(components){
            const master_component = this.getMasterComponent();
            let same_src = true;

            if(components.length > 1){
                const src = master_component.getPropertyValue('src');
                same_src = components.every((component) => {
                    return component.getPropertyValue('src') === src;
                });
            }

            if(same_src){
                const markers = Object.entries(master_component.getMarkers());
                if(markers.length > 0){
                    markers.forEach(([id, marker]) => {
                        const name = Dom.data(marker, 'name');

                        marker_start_input.addOption(id, name ? name : id);
                        marker_mid_input.addOption(id, name ? name : id);
                        marker_end_input.addOption(id, name ? name : id);
                    });

                    marker_start_input.enable();
                    marker_mid_input.enable();
                    marker_end_input.enable();
                }
            }

        }
    }
}
