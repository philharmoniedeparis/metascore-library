import Waveform from '../core/ui/Waveform';
import Dom from '../core/Dom';

import '../../css/editor/Controller.less';

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

        this.waveform = new Dom('<div/>', {'id': 'waveform'})
            .appendTo(this);

        this.overview = new Waveform({
                'draggable': false,
                'axis': false,
                'wave': {
                    'color': '#999',
                    'margin': 2
                }
            })
            .addClass('overview')
            .appendTo(this.waveform);

        this.zoom = new Waveform()
            .addClass('zoom')
            .appendTo(this.waveform);
    }

    setWaveformData(data){
        this.overview.setData(data.resample({'width': this.overview.get(0).clientWidth}));
        this.zoom.setData(data);
    }

    setTime(time){
        this.overview.setTime(time);
        this.zoom.setTime(time);
    }

}
