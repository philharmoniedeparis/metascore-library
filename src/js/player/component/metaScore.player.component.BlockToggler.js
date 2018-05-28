/**
 * @module Player
 */

metaScore.namespace('player.component').BlockToggler = (function () {

    /**
     * A block toggler component
     *
     * @class BlockToggler
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function BlockToggler(configs) {
        // call parent constructor
        BlockToggler.parent.call(this, configs);
    }

    metaScore.player.Component.extend(BlockToggler);

    BlockToggler.defaults = {
        'properties': {
            'name': {
                'type': 'Text',
                'configs': {
                    'label': metaScore.Locale.t('player.component.BlockToggler.name', 'Name')
                },
                'getter': function(skipDefault){
                    return this.data('name');
                },
                'setter': function(value){
                    this.data('name', value);
                }
            },
            'locked': {
                'type': 'Checkbox',
                'configs': {
                    'label': metaScore.Locale.t('player.component.BlockToggler.locked', 'Locked?')
                },
                'getter': function(skipDefault){
                    return this.data('locked') === "true";
                },
                'setter': function(value){
                    this.data('locked', value ? "true" : null);
                }
            },
            'x': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.BlockToggler.x', 'X'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('left'), 10);
                },
                'setter': function(value){
                    this.css('left', value +'px');
                }
            },
            'y': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.BlockToggler.y', 'Y'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('top'), 10);
                },
                'setter': function(value){
                    this.css('top', value +'px');
                }
            },
            'width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.BlockToggler.width', 'Width'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('width'), 10);
                },
                'setter': function(value){
                    this.css('width', value +'px');
                }
            },
            'height': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.BlockToggler.height', 'Height'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('height'), 10);
                },
                'setter': function(value){
                    this.css('height', value +'px');
                }
            },
            'z-index': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.BlockToggler.z-index', 'Display index')
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('z-index', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('z-index', value);
                }
            },
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.background-color', 'Background color')
                },
                'getter': function(skipDefault){
                    return this.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    this.css('background-color', metaScore.Color.toCSS(value));
                }
            },
            'border-width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.BlockToggler.border-width', 'Border width'),
                    'min': 0
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('border-width', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('border-width', value +'px');
                }
            },
            'border-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.BlockToggler.border-color', 'Border color')
                },
                'getter': function(skipDefault){
                    return this.css('border-color', undefined, skipDefault);
                },
                'setter': function(value){
                    this.css('border-color', metaScore.Color.toCSS(value));
                }
            },
            'border-radius': {
                'type': 'BorderRadius',
                'configs': {
                    'label': metaScore.Locale.t('player.component.BlockToggler.border-radius', 'Border radius')
                },
                'getter': function(skipDefault){
                    return this.css('border-radius', undefined, skipDefault);
                },
                'setter': function(value){
                    this.css('border-radius', value);
                }
            }
        }
    };

    /**
     * Setup the block's UI
     * 
     * @method setupUI
     * @private
     */
    BlockToggler.prototype.setupUI = function(){
        // call parent function
        BlockToggler.parent.prototype.setupUI.call(this);

        this.addClass('block-toggler');

        this.btn_wrapper = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);
    };

    /**
     * Update the displayed time
     *
     * @method update
     * @param {Dom} blocks A Dom instance containing the components to control
     * @chainable
     */
    BlockToggler.prototype.update = function(components){   
        var blocktoggler = this,
            button_width = this.getProperty('width') / components.count(),
            button_height = this.getProperty('height'),
            componenets_width = 0, componenets_height = 0,
            boxes = [];
        
        this.btn_wrapper.empty();

        components.each(function(index, dom){
            var component = dom._metaScore,
                x = component.getProperty('x') || 0,
                y = component.getProperty('y') || 0,
                width = component.getProperty('width') || 0,
                height = component.getProperty('height') || 0;

            boxes.push({
                'component': component,
                'x': x,
                'y': y,
                'width': width,
                'height': height
            });

            componenets_width = Math.max(x + width, componenets_width);
            componenets_height = Math.max(y + height, componenets_height);
        }, this);

        boxes.forEach(function(box, index){
            var button, svg;

            button = new metaScore.Dom('<div/>', {'class': 'button'})
                .addListener('click', metaScore.Function.proxy(blocktoggler.onTogglerClick, blocktoggler, [box.component]))
                .appendTo(blocktoggler.btn_wrapper);

            svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttributeNS(null, "preserveAspectRatio", "xMidYMidmeet");
            svg.setAttributeNS(null, "viewBox", "0 0 " + componenets_width +" "+ componenets_height);
            button.get(0).appendChild(svg);

            boxes.forEach(function(box2, index2){
                var x = box2.x,
                    y = box2.y,
                    width = box2.width,
                    height = box2.height,
                    rect;
                             
                rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttributeNS(null, "fill", index2 === index ? "#666666" : "#CECECE");
                rect.setAttributeNS(null, "width", width);
                rect.setAttributeNS(null, "height", height);
                rect.setAttributeNS(null, "x", x);
                rect.setAttributeNS(null, "y", y);
                
                svg.appendChild(rect);
            });
        });

        return this;
    };

    BlockToggler.prototype.onTogglerClick = function(component, evt){

        component.toggleVisibility();

    };

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    BlockToggler.prototype.setDraggable = function(draggable){

        draggable = draggable !== false;

        if(this.getProperty('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            this._draggable = new metaScore.Draggable({
                'target': this,
                'handle': this,
                'limits': {
                    'top': 0,
                    'left': 0
                }
            });
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this._draggable;

    };

    /**
     * Set/Unset the resizable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    BlockToggler.prototype.setResizable = function(resizable){

        resizable = resizable !== false;

        if(this.getProperty('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
            this._resizable = new metaScore.Resizable({
                'target': this
            });
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this._resizable;

    };

    return BlockToggler;

})();