/**
* Description
*
* @class editor.overlay.InsertImage
* @extends editor.Overlay
*/

metaScore.namespace('editor.overlay').InsertImage = (function () {

    /**
     * Fired when the submit button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {String} url The image's url
     * @param {Number} width The image's width
     * @param {Number} height The image's height
     * @param {String} alignement The image's alignement
     */
    var EVT_SUBMIT = 'submit';

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function InsertImage(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        InsertImage.parent.call(this, this.configs);

        this.addClass('insert-image');

        if(this.configs.image){
            this.setValuesFromImage(this.configs.image);
        }
    }

    InsertImage.defaults = {
        /**
        * True to add a toolbar with title and close button
        */
        toolbar: true,

        /**
        * The overlay's title
        */
        title: metaScore.Locale.t('editor.overlay.InsertImage.title', 'Insert Image'),

        /**
        * The current image
        */
        image: null
    };

    metaScore.editor.Overlay.extend(InsertImage);

    /**
     * Description
     * @method setupDOM
     * @return
     */
    InsertImage.prototype.setupDOM = function(){
        var contents, size_wrapper, size_buttons;

        // call parent method
        InsertImage.parent.prototype.setupDOM.call(this);

        contents = this.getContents();

        this.fields = {};
        this.buttons = {};

        // URL
        this.fields.image = new metaScore.editor.field.Image({
                'label': metaScore.Locale.t('editor.overlay.InsertImage.fields.image', 'Image')
            })
            .addClass('image')
            .addListener('valuechange', metaScore.Function.proxy(this.onURLChange, this))
            .appendTo(contents);

        size_wrapper = new metaScore.Dom('<div/>', {'class': 'size-wrapper clearfix'})
            .appendTo(contents);

        // Width
        this.fields.width = new metaScore.editor.field.Number({
                'label': metaScore.Locale.t('editor.overlay.InsertImage.fields.width', 'Width'),
                'min': 0
            })
            .addClass('width')
            .addListener('valuechange', metaScore.Function.proxy(this.onWidthChange, this))
            .appendTo(size_wrapper);

        size_buttons = new metaScore.Dom('<div/>', {'class': 'size-buttons'})
            .appendTo(size_wrapper);

        // Lock ratio
        this.fields.lock_ratio = new metaScore.editor.field.Boolean({
                'checked': true,
                'label': '&nbsp;'
            })
            .addClass('lock-ratio')
            .attr('title', metaScore.Locale.t('editor.overlay.InsertImage.lock-ratio', 'Lock ratio'))
            .addListener('valuechange', metaScore.Function.proxy(this.onLockRatioChange, this))
            .appendTo(size_buttons);

        // Reset
        this.fields.reset_size = new metaScore.editor.Button({
            })
            .addClass('reset-size')
            .attr('title', metaScore.Locale.t('editor.overlay.InsertImage.reset-size', 'Reset size'))
            .addListener('click', metaScore.Function.proxy(this.onRevertSizeClick, this))
            .appendTo(size_buttons);

        // Height
        this.fields.height = new metaScore.editor.field.Number({
                'label': metaScore.Locale.t('editor.overlay.InsertImage.fields.height', 'Height'),
                'min': 0
            })
            .addClass('height')
            .addListener('valuechange', metaScore.Function.proxy(this.onHeightChange, this))
            .appendTo(size_wrapper);

        // Alignment
        this.fields.alignment = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment', 'Alignment'),
                'options': {
                    '': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment.unset', '&lt;not set&gt;'),
                    'left': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment.left', 'Left'),
                    'right': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment.right', 'Right')
                }
            })
            .addClass('alignment')
            .appendTo(contents);

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
     * @method setValuesFromLink
     * @param {} link
     * @return
     */
    InsertImage.prototype.setValuesFromImage = function(image){
        this.fields.image.setValue(image.url);
    };

    /**
     * Description
     * @method onURLChange
     * @param {} evt
     * @return
     */
    InsertImage.prototype.onURLChange = function(evt){
        var url = evt.detail.value;

        if(url){
            new metaScore.Dom('<img/>')
                .addListener('load', metaScore.Function.proxy(function(evt){
                    this.img = evt.target;

                    this.fields.width.setValue(this.img.width, true);
                    this.fields.height.setValue(this.img.height, true);
                }, this))
                .attr('src', url);
        }
    };

    /**
     * Description
     * @method onWidthChange
     * @param {} evt
     * @return
     */
    InsertImage.prototype.onWidthChange = function(evt){
        var lock_ratio = this.fields.lock_ratio.getValue(),
            width, height;

        if(lock_ratio && this.img){
            width = this.fields.width.getValue();
            height = Math.round(width * this.img.height / this.img.width);

            this.fields.height.setValue(height, true);
        }
    };

    /**
     * Description
     * @method onHeightChange
     * @param {} evt
     * @return
     */
    InsertImage.prototype.onHeightChange = function(evt){
        var lock_ratio = this.fields.lock_ratio.getValue(),
            width, height;

        if(lock_ratio && this.img){
            height = this.fields.height.getValue();
            width = Math.round(height * this.img.width / this.img.height);

            this.fields.width.setValue(width, true);
        }
    };

    /**
     * Description
     * @method onRatioChange
     * @param {} evt
     * @return
     */
    InsertImage.prototype.onLockRatioChange = function(evt){
        var lock_ratio = evt.detail.value;

        if(lock_ratio && this.img){
            this.fields.width.setValue(this.fields.width.getValue());
        }
    };

    /**
     * Description
     * @method onRevertSizeClick
     * @param {} evt
     * @return
     */
    InsertImage.prototype.onRevertSizeClick = function(evt){
        if(this.img){
            this.fields.width.setValue(this.img.width);
            this.fields.height.setValue(this.img.height);
        }
    };

    /**
     * Description
     * @method onApplyClick
     * @param {} evt
     * @return
     */
    InsertImage.prototype.onApplyClick = function(evt){
        var url, width, height, alignment;

        url = this.fields.image.getValue();
        width = this.fields.width.getValue();
        height = this.fields.height.getValue();
        alignment = this.fields.alignment.getValue();

        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'url': url, 'width': width, 'height': height, 'alignment': alignment}, true, false);

        this.hide();
    };

    /**
     * Description
     * @method onCancelClick
     * @param {} evt
     * @return
     */
    InsertImage.prototype.onCancelClick = function(evt){
        this.hide();
    };

    return InsertImage;

})();