import {Field} from '../Field';
import {Dom} from '../../core/Dom';
import {Locale} from '../../core/Locale';
import {_Function} from '../../core/utils/Function';

/**
 * Fired when the external filebrowser should be opened
 *
 * @event filebrowser
 * @param {Function} callback The callback to invoke once a file is selected throught the external file browser
 */
var EVT_FILEBROWSER = 'filebrowser';

/**
 * Fired when the resize button is clicked
 *
 * @event resize
 * @param {Object} field The field instance
 * @param {Mixed} value The field value
 */
var EVT_RESIZE = 'resize';

export default class Image extends Field {

    /**
     * An image field wich depends on an external file browser to function
     *
     * @class ImageField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.placeholder="Browse..."] A placeholder text
     * @param {Boolean} [configs.resizeButton=false] Whether to show the resize button
     */
    constructor(configs) {
        this.configs = this.getConfigs(configs);

        // fix event handlers scope
        this.onFileSelect = _Function.proxy(this.onFileSelect, this);

        // call parent constructor
        super(this.configs);

        this.addClass('imagefield');
    }

    ImageField.defaults = {
        'placeholder': Locale.t('editor.field.Image.placeholder', 'Browse...')
    };

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        var buttons;
        
        super.setupUI();

        this.input
            .attr('readonly', 'readonly')
            .attr('placeholder', this.configs.placeholder)
            .addListener('click', _Function.proxy(this.onClick, this));
            
        buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);
            
        if(this.configs.resizeButton){
            this.resize = new Dom('<button/>', {'text': '.', 'data-action': 'resize', 'title': Locale.t('editor.field.Image.resize.tooltip', 'Adapt container size to image')})
                .addListener('click', _Function.proxy(this.onResizeClick, this))
                .appendTo(buttons);
        }

        new Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': Locale.t('editor.field.Image.clear.tooltip', 'Clear value')})
            .addListener('click', _Function.proxy(this.onClearClick, this))
            .appendTo(buttons);
    };

    /**
     * Set the field'S value
     * 
     * @method setValue
     * @param {String} value The image file's url
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValue(value, supressEvent){
        ImageField.parent.prototype.setValue.call(this, value, supressEvent);

        this.input.attr('title', value);

        return this;
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    onClick(evt){
        if(this.disabled){
            return;
        }

        this.triggerEvent(EVT_FILEBROWSER, {'callback': this.onFileSelect}, true, false);
    };

    /**
     * The resize button click event handler
     * 
     * @method onResizeClick
     * @private
     * @param {Event} evt The event object
     */
    onResizeClick(evt){
        this.triggerEvent(EVT_RESIZE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * The clear button click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    onClearClick(evt){
        this.setValue(null);
    };

    /**
     * The file select event handler
     * 
     * @method onFileSelect
     * @private
     * @param {String} url The image file's url
     */
    onFileSelect(url){
        this.setValue(url);
    };
    
}