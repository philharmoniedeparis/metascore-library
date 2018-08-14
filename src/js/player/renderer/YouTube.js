import Renderer from '../Renderer';

let API_LOADED = false;

/**
 * YouTube renderer
 */
export default class YouTube extends Renderer {

    constructor(configs){
        super(`<div/>`);

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        if (API_LOADED) {
			this.createIFrame();
        }
        else {
			this.loadAPI();
		}
    }

    loadAPI(){
        const script = new Dom('<script/>');

        script.addListener('load', this.onAPILoad.bind(this, script));
        script.addListener('error', this.onAPIError.bind(this, script));

        script.attr('async', true);
        script.attr('src', 'https://www.youtube.com/player_api');

        script.appendTo(document.head);
    }

    onAPILoad(script){
        script.remove();
    }

    onAPIError(script){
        script.remove();
    }

}
