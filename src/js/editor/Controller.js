import Waveform from '../core/ui/Waveform';
import Dom from '../core/Dom';

export default class Controller extends Dom {

    /**
     * The editor's main menu
     *
     * @class Controller
     * @extends Dom
     * @constructor
     */
    constructor() {
        // call parent constructor
        super('<div/>', {'class': 'controller'});

        this.setupUI();
    }

    /**
     * Setup the menu's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        this.waveform = new Waveform().appendTo(this);
    }

    setWaveformData(data){
        this.waveform.setWaveData(data);
    }

    setTime(time){
        this.waveform.setTime(time);
    }

}
