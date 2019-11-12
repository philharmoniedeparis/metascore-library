import Dom from '../../core/Dom';
import Lottie from 'lottie-web';

import {className} from '../../../css/editor/assetbrowser/AssetFigure.scss';

/**
 * An asset browser class
 */
export default class AssetFigure extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} asset The asset data
     */
    constructor(asset) {
        // call parent constructor
        super('<figure/>', {'class': `asset-figure ${className}`});

        if('shared' in asset && asset.shared){
            switch(asset.type){
                case 'image':
                case 'svg':
                    new Dom('<img/>', {'src': asset.file.url}).appendTo(this);
                    break;

                case 'lottie_animation':
                    this.animation = Lottie.loadAnimation({
                        container: this.get(0),
                        path: asset.file.url,
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                    });
                    break;
            }
        }
        else{
            const matches = /^(image|audio|video)\/.*/.exec(asset.mimetype);
            if(matches){
                const type = matches[1];
                switch(type){
                    case 'image':
                        new Dom('<img/>', {'src': asset.url}).appendTo(this);
                        break;

                    case 'audio':
                        new Dom('<audio/>', {'src': asset.url}).appendTo(this);
                        break;

                    case 'video':
                        new Dom('<video/>', {'src': asset.url}).appendTo(this);
                        break;
                }
            }
        }
    }

    play(){
        if(this.animation){
            this.animation.play();
        }
    }

    stop(){
        if(this.animation){
            this.animation.stop();
        }
    }

    destroy(){
        if(this.animation){
            this.animation.destroy();
        }
    }
}
