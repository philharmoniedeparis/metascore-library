/**
* Description
*
* @class player.component.Page
* @extends player.Component
*/

metaScore.namespace('player.component').Page = (function () {

    /**
     * Fired when an element is added
     *
     * @event elementadd
     * @param {Object} page The page instance
     * @param {Object} element The element instance
     */
    var EVT_ELEMENTADD = 'elementadd';

    /**
     * Fired when a cuepoint started
     *
     * @event cuepointstart
     */
    var EVT_CUEPOINTSTART = 'cuepointstart';

    /**
     * Fired when a cuepoint ended
     *
     * @event cuepointend
     */
    var EVT_CUEPOINTEND = 'cuepointend';

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function Page(configs) {
        // call parent constructor
        Page.parent.call(this, configs);
    }

    metaScore.player.Component.extend(Page);

    Page.defaults = {
        'properties': {
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.background-color', 'Background color')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return this.css('background-color', undefined, skipDefault);
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'background-image': {
                'type': 'Image',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.background-image', 'Background image')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    var value = this.css('background-image', undefined, skipDefault);

                    if(value === 'none' || !metaScore.Var.is(value, "string")){
                        return null;
                    }

                    return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
                    this.css('background-image', value);
                }
            },
            'start-time': {
                'type': 'Time',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.start-time', 'Start time'),
                    'checkbox': false,
                    'inButton': true,
                    'outButton': true
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return ConditionalExpression
                 */
                'getter': function(skipDefault){
                    var value = parseFloat(this.data('start-time'));
                    return isNaN(value) ? null : value;
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.data('start-time', isNaN(value) ? null : value);
                }
            },
            'end-time': {
                'type': 'Time',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Page.end-time', 'End time'),
                    'checkbox': false,
                    'inButton': true,
                    'outButton': true
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return ConditionalExpression
                 */
                'getter': function(skipDefault){
                    var value = parseFloat(this.data('end-time'));
                    return isNaN(value) ? null : value;
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.data('end-time', isNaN(value) ? null : value);
                }
            },
            'elements': {
                'editable': false,
                /**
                 * Description
                 * @param {} skipDefault
                 * @return elements
                 */
                'getter': function(skipDefault){
                    var elements = [];

                    this.getElements().each(function(index, element){
                        elements.push(element._metaScore.getProperties(skipDefault));
                    }, this);

                    return elements;
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    metaScore.Array.each(value, function(index, configs){
                        this.addElement(configs);
                    }, this);
                }
            }
        }
    };

    /**
     * Description
     * @method setupDOM
     * @return
     */
    Page.prototype.setupDOM = function(){
        // call parent function
        Page.parent.prototype.setupDOM.call(this);

        this.addClass('page');
    };

    /**
     * Description
     * @method addElement
     * @param {} configs
     * @return element
     */
    Page.prototype.addElement = function(configs, supressEvent){
        var element;

        if(configs instanceof metaScore.player.component.Element){
            element = configs;
            element.appendTo(this);
        }
        else{
            element = new metaScore.player.component.element[configs.type](metaScore.Object.extend({}, configs, {
                'container': this
            }));
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_ELEMENTADD, {'page': this, 'element': element});
        }

        return element;
    };

    /**
     * Description
     * @method getBlock
     * @return CallExpression
     */
    Page.prototype.getBlock = function(){
        var dom = this.parents().parents().get(0),
            block;

        if(dom){
            block = dom._metaScore;
        }

        return block;
    };

    /**
     * Description
     * @method getElements
     * @return CallExpression
     */
    Page.prototype.getElements = function(){
        return this.children('.element');
    };

    /**
     * Description
     * @method onCuePointStart
     * @param {} cuepoint
     * @return
     */
    Page.prototype.onCuePointStart = function(cuepoint){
        this.triggerEvent(EVT_CUEPOINTSTART);
    };

    /**
     * Description
     * @method onCuePointEnd
     * @param {} cuepoint
     * @return
     */
    Page.prototype.onCuePointEnd = function(cuepoint){
        this.triggerEvent(EVT_CUEPOINTEND);
    };

    /**
     * Description
     * @method onCuePointSeekOut
     * @param {} cuepoint
     * @return
     */
    Page.prototype.onCuePointSeekOut = Page.prototype.onCuePointEnd;

    return Page;

})();