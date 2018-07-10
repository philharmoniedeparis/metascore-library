import Component from '../Component';
import Dom from '../../core/Dom';
import Draggable from '../../core/ui/Draggable';
import Resizable from '../../core/ui/Resizable';
import Locale from '../../core/Locale';
import {toCSS} from '../../core/utils/Color';
import {isString} from '../../core/utils/Var';

/**
 * An element component
 */
export default class Element extends Component{

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'properties': {
                'name': {
                    'type': 'Text',
                    'configs': {
                        'label': Locale.t('player.component.Element.name', 'Name')
                    },
                    'getter': function(){
                        return this.data('name');
                    },
                    'setter': function(value){
                        this.data('name', value);
                    }
                },
                'locked': {
                    'type': 'Checkbox',
                    'configs': {
                        'label': Locale.t('player.component.Element.locked', 'Locked?')
                    },
                    'getter': function(){
                        return this.data('locked') === "true";
                    },
                    'setter': function(value){
                        this.data('locked', value ? "true" : null);
                    }
                },
                'x': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Element.x', 'X'),
                        'spinDirection': 'vertical'
                    },
                    'getter': function(){
                        return parseInt(this.css('left'), 10);
                    },
                    'setter': function(value){
                        this.css('left', `${value}px`);
                    }
                },
                'y': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Element.y', 'Y'),
                        'flipSpinButtons': true
                    },
                    'getter': function(){
                        return parseInt(this.css('top'), 10);
                    },
                    'setter': function(value){
                        this.css('top', `${value}px`);
                    }
                },
                'width': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Element.width', 'Width'),
                        'spinDirection': 'vertical'
                    },
                    'getter': function(){
                        return parseInt(this.css('width'), 10);
                    },
                    'setter': function(value){
                        this.css('width', `${value}px`);
                    }
                },
                'height': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Element.height', 'Height'),
                        'flipSpinButtons': true
                    },
                    'getter': function(){
                        return parseInt(this.css('height'), 10);
                    },
                    'setter': function(value){
                        this.css('height', `${value}px`);
                    }
                },
                'r-index': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Element.r-index', 'Reading index'),
                        'min': 0
                    },
                    'getter': function(){
                        const value = parseInt(this.data('r-index'), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('r-index', value);
                    }
                },
                'z-index': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Element.z-index', 'Display index')
                    },
                    'getter': function(skipDefault){
                        const value = parseInt(this.css('z-index', undefined, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.css('z-index', value);
                    }
                },
                'background-color': {
                    'type': 'Color',
                    'configs': {
                        'label': Locale.t('player.component.Element.background-color', 'Background color')
                    },
                    'getter': function(skipDefault){
                        return this.contents.css('background-color', undefined, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('background-color', toCSS(value));
                    }
                },
                'background-image': {
                    'type': 'Image',
                    'configs': {
                        'label': Locale.t('player.component.Element.background-image', 'Background image'),
                        'resizeButton': true
                    },
                    'getter': function(skipDefault){
                        let value = this.contents.css('background-image', undefined, skipDefault);

                        if(value === 'none' || !isString(value)){
                            return null;
                        }

                        value = value.replace(/^url\(["']?/, '');
                        value = value.replace(/["']?\)$/, '');
                        value = value.replace(document.baseURI, '');

                        return value;
                    },
                    'setter': function(value){
                        value = (value !== 'none' && isString(value) && (value.length > 0)) ? `url(${value})` : null;
                        this.contents.css('background-image', value);
                    }
                },
                'border-width': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Element.border-width', 'Border width'),
                        'min': 0
                    },
                    'getter': function(skipDefault){
                        const value = parseInt(this.contents.css('border-width', undefined, skipDefault), 10);
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.contents.css('border-width', `${value}px`);
                    }
                },
                'border-color': {
                    'type': 'Color',
                    'configs': {
                        'label': Locale.t('player.component.Element.border-color', 'Border color')
                    },
                    'getter': function(skipDefault){
                        return this.contents.css('border-color', undefined, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('border-color', toCSS(value));
                    }
                },
                'border-radius': {
                    'type': 'BorderRadius',
                    'configs': {
                        'label': Locale.t('player.component.Element.border-radius', 'Border radius')
                    },
                    'getter': function(skipDefault){
                        return this.contents.css('border-radius', undefined, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('border-radius', value);
                    }
                },
                'opacity': {
                    'type': 'Number',
                    'configs': {
                        'label': Locale.t('player.component.Element.opacity', 'Opacity'),
                        'min': 0,
                        'max': 1,
                        'step': 0.1
                    },
                    'getter': function(skipDefault){
                        return this.contents.css('opacity', undefined, skipDefault);
                    },
                    'setter': function(value){
                        this.contents.css('opacity', value);
                    }
                },
                'start-time': {
                    'type': 'Time',
                    'configs': {
                        'label': Locale.t('player.component.Element.start-time', 'Start time'),
                        'clearButton': true,
                        'inButton': true,
                        'outButton': true
                    },
                    'getter': function(){
                        const value = parseFloat(this.data('start-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('start-time', isNaN(value) ? null : value);
                    }
                },
                'end-time': {
                    'type': 'Time',
                    'configs': {
                        'label': Locale.t('player.component.Element.end-time', 'End time'),
                        'clearButton': true,
                        'inButton': true,
                        'outButton': true
                    },
                    'getter': function(){
                        const value = parseFloat(this.data('end-time'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('end-time', isNaN(value) ? null : value);
                    }
                }
            }
        });
    }

    static getType(){
        return 'Element';
    }

    /**
     * Setup the element's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        // call parent function
        super.setupUI();

        this
            .addClass('element')
            .addClass(this.constructor.getType());

        this.contents = new Dom('<div/>', {'class': 'contents'})
            .appendTo(this);
    }

    /**
     * Get the page component this element belongs to
     *
     * @method getPage
     * @return {player.component.Page} The page
     */
    getPage() {
        let dom = this.parents().get(0),
            page;

        if(dom){
            page = dom._metaScore;
        }

        return page;
    }

    /**
     * The cuepoint start event handler
     *
     * @method onCuePointStart
     * @private
     */
    onCuePointStart(){
        this.addClass('active');
    }

    /**
     * The cuepoint stop event handler
     *
     * @method onCuePointStop
     * @private
     */
    onCuePointStop(){
        this.removeClass('active');
    }

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    setDraggable(draggable){
        if(this.getPropertyValue('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            this._draggable = new Draggable({
                'target': this,
                'handle': this
            });
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this._draggable;

    }

    /**
     * Set/Unset the resizable behaviour
     *
     * @method setResizable
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    setResizable(resizable){
        if(this.getPropertyValue('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
            this._resizable = new Resizable({
                'target': this
            });
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this._resizable;

    }

}
