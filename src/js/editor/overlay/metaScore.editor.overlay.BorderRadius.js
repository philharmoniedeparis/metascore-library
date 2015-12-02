/**
* Description
*
* @class editor.overlay.BorderRadius
* @extends editor.Overlay
*/

metaScore.namespace('editor.overlay').BorderRadius = (function () {

    /**
     * Fired when the submit button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {String} value The border radius value in CSS format
     */
    var EVT_SUBMIT = 'submit';

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function BorderRadius(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        BorderRadius.parent.call(this, this.configs);

        this.addClass('border-radius');
    }

    BorderRadius.defaults = {
        /**
        * True to add a toolbar with title and close button
        */
        toolbar: true,

        /**
        * The overlay's title
        */
        title: metaScore.Locale.t('editor.overlay.BorderRadius.title', 'Border Radius')
    };

    metaScore.editor.Overlay.extend(BorderRadius);

    /**
     * Description
     * @method setupDOM
     * @return 
     */
    BorderRadius.prototype.setupDOM = function(){
        var contents;

        // call parent method
        BorderRadius.parent.prototype.setupDOM.call(this);

        contents = this.getContents();

        this.fields = {};
        this.buttons = {};

        this.preview = new metaScore.Dom('<div/>', {'class': 'preview'})
            .appendTo(contents);

        this.fields.tlw = new metaScore.editor.field.Number({min: 0})
            .addClass('tlw')
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .appendTo(this.preview);

        this.fields.tlh = new metaScore.editor.field.Number({min: 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('tlh')
            .appendTo(this.preview);

        this.fields.trw = new metaScore.editor.field.Number({min: 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('trw')
            .appendTo(this.preview);

        this.fields.trh = new metaScore.editor.field.Number({min: 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('trh')
            .appendTo(this.preview);

        this.fields.brw = new metaScore.editor.field.Number({min: 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('brw')
            .appendTo(this.preview);

        this.fields.brh = new metaScore.editor.field.Number({min: 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('brh')
            .appendTo(this.preview);

        this.fields.blw = new metaScore.editor.field.Number({min: 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('blw')
            .appendTo(this.preview);

        this.fields.blh = new metaScore.editor.field.Number({min: 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('blh')
            .appendTo(this.preview);

        // Buttons
        this.buttons.apply = new metaScore.editor.Button({'label': 'Apply'})
            .addClass('apply')
            .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
            .appendTo(contents);

        this.buttons.cancel = new metaScore.editor.Button({'label': 'Cancel'})
            .addClass('cancel')
            .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
            .appendTo(contents);

    };

    /**
     * Description
     * @method onValueChange
     * @return 
     */
    BorderRadius.prototype.onValueChange = function(){    
        var radius    = '';
        
        radius += this.fields.tlw.getValue() +'px ';
        radius += this.fields.trw.getValue() +'px ';
        radius += this.fields.brw.getValue() +'px ';
        radius += this.fields.blw.getValue() +'px ';
        radius += '/ ';
        radius += this.fields.tlh.getValue() +'px ';
        radius += this.fields.trh.getValue() +'px ';
        radius += this.fields.brh.getValue() +'px ';
        radius += this.fields.blh.getValue() +'px';
        
        this.preview.css('border-radius', radius);
    };

    /**
     * Description
     * @method setValue
     * @param {} val
     * @return ThisExpression
     */
    BorderRadius.prototype.setValue = function(val){
        var matches,
            values = {
                tlw: 0, tlh: 0,
                trw: 0, trh: 0,
                blw: 0, blh: 0,
                brw: 0, brh: 0
            };
        
        this.preview.css('border-radius', val);
        
        if(matches = this.preview.css('border-top-left-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.tlw = matches[0];
                values.tlh = matches[1];
            }
            else{
                values.tlw = values.tlh = matches[0];
            }
        }
        
        if(matches = this.preview.css('border-top-right-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.trw = matches[0];
                values.trh = matches[1];
            }
            else{
                values.trw = values.trh = matches[0];
            }
        }
        
        if(matches = this.preview.css('border-bottom-left-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.blw = matches[0];
                values.blh = matches[1];
            }
            else{
                values.blw = values.blh = matches[0];
            }
        }
        
        if(matches = this.preview.css('border-bottom-right-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.brw = matches[0];
                values.brh = matches[1];
            }
            else{
                values.brw = values.brh = matches[0];
            }
        }
        
        metaScore.Object.each(this.fields, function(key, field){
            field.setValue(parseInt(values[key], 10), true);
        });
        
        return this;
    };

    /**
     * Description
     * @method getValue
     * @return CallExpression
     */
    BorderRadius.prototype.getValue = function(){
        return this.preview.css('border-radius');
    };

    /**
     * Description
     * @method onApplyClick
     * @param {} evt
     * @return 
     */
    BorderRadius.prototype.onApplyClick = function(evt){    
        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'value': this.getValue()}, true, false);
        this.hide();
    };

    BorderRadius.prototype.onCancelClick = BorderRadius.prototype.onCloseClick;

    return BorderRadius;

})();