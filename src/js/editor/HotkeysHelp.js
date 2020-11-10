import Overlay from '../core/ui/Overlay';
import Locale from '../core/Locale'
import Dom from '../core/Dom';
import {isArray} from '../core/utils/Var';

import {className} from '../../css/editor/HotkeysHelp.scss';

/**
 * An overlay displaying a form to generate a spectrogram image
 */
export default class HotkeysInfo extends Overlay {

    static defaults = Object.assign({}, super.defaults, {
        'toolbar': true,
        'title': Locale.t('editor.HotkeysInfo.title', 'Keyboard shortcuts')
    });

    /**
     * Instantiate
     *
     * @param {Array} hotkeys A list of Hotkeys
     * @param {Object} configs Custom configs to override defaults
     * @property {Boolean} [toolbar=true] Whether to show a toolbar with a title and close button
     * @property {String} [title='Keyboard shortcuts'] The overlay's title
     */
    constructor(hotkeys, configs) {
        // call parent constructor
        super(configs);

        this.addClass(`hotkeysinfo ${className}`);

        const contents = this.getContents();

        Object.values(hotkeys).forEach((h) => {
            const wrapper = new Dom('<div/>', {'class': 'hotkeys'})
                .appendTo(contents);

            const title = new Dom('<div/>', {'class': 'title'})
                .appendTo(wrapper);

            new Dom('<h2/>')
                .text(h.title)
                .appendTo(title);

            new Dom('<p/>')
                .text(h.description)
                .appendTo(title);

            new Dom('<div/>', {'class': 'header'})
                .text(Locale.t('editor.HotkeysInfo.hotkeys.header.shortcut', 'Key combination'))
                .appendTo(wrapper);

            new Dom('<div/>', {'class': 'header'})
                .text(Locale.t('editor.HotkeysInfo.hotkeys.header.description', 'Description'))
                .appendTo(wrapper);

            Object.values(h.items).forEach((item) => {
                const combos = new Dom('<div/>', {'class': 'combos'})
                    .appendTo(wrapper);

                const key_combos = isArray(item.combo) ? item.combo : [item.combo];
                key_combos.forEach((c, c_index, c_arr) => {
                    const combo = new Dom('<kbd/>', {'class': 'combo'})
                        .appendTo(combos);

                    c.split('+').forEach((k, k_index, k_arr) => {
                        new Dom('<kbd/>', {'class': 'key'})
                            .text(this.getKeyName(k))
                            .appendTo(combo);

                            if(k_index < k_arr.length-1) {
                                new Dom('<span/>', {'class': 'key-separator'})
                                    .text('+')
                                    .appendTo(combo);
                            }
                    });

                    if(c_index < c_arr.length-1) {
                        new Dom('<span/>', {'class': 'combo-separator'})
                            .text(Locale.t('editor.HotkeysInfo.combo-separator', 'or'))
                            .appendTo(combos);
                    }
                });

                new Dom('<div/>', {'class': 'description'})
                    .text(item.description)
                    .appendTo(wrapper);
            });
        });
    }

    /**
     * Get a key's pretty name.
     *
     * @param {string} key The key.
     * @returns {string} The pretty name.
     */
    getKeyName(key) {
        switch (key){
            case ' ':
                return Locale.t('editor.HotkeysInfo.keyname.Spacebar', 'Spacebar');

            case 'Delete':
                return Locale.t('editor.HotkeysInfo.keyname.Delete', 'Delete');

            case 'Backspace':
                return Locale.t('editor.HotkeysInfo.keyname.Backspace', 'Backspace');

            case 'Control':
                return 'Ctrl';

            case 'ArrowRight':
                return '▶';

            case 'ArrowLeft':
                return '◀';

            case 'ArrowUp':
                return '▲';

            case 'ArrowDown':
                return '▼';

            default:
                return key.length === 1 ? key.toUpperCase() : key;
        }
    }
}
