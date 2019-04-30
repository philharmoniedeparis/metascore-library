import EventEmitter from '../core/EventEmitter';

/**
 * An undo/redo manager
 *
 * @emits {add} Fired when a command is added
 * @param {Object} command The added command
 * @emits {undo} Fired when a command is undone
 * @param {Object} command The added command
 * @emits {redo} Fired when a command is redone
 * @param {Object} command The added command
 * @emits {clear} Fired when the command history is cleared
 *
 * @todo: make signleton
 * @todo: move closer to a Command Pattern ? see https://www.codeproject.com/Articles/33384/Multilevel-Undo-and-Redo-Implementation-in-Cshar-2
 */
export default class History extends EventEmitter {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Integer} [max_commands=30] The max number of commands to store
     */
    constructor(configs) {
        // call parent constructor
        super();

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The list of available undo/redo commands
         * @type {Array}
         */
        this.commands = [];

        /**
         * The current comamnd index
         * @type {Number}
         */
        this.index = -1;

        /**
         * Whether a command is being executed
         * @type {Boolean}
         */
        this.executing = false;
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults() {
        return {
            'max_commands': 20
        };
    }

    /**
     * Execute a command's action
     *
     * @private
     * @param {Object} command The command object
     * @param {String} action The action ('undo' or 'redo') to execute
     * @return {this}
     */
    execute(command, action) {
        if (command && (action in command)) {
            this.executing = true;
            command[action](command);
            this.executing = false;
        }

        return this;
    }

    /**
     * Add a command
     *
     * @param {Object} command The command object. It should contain an 'undo' and a 'redo' function
     * @return {this}
     */
    add(command){
        if (this.executing) {
            return this;
        }

        // invalidate items higher on the stack
        this.commands.splice(this.index + 1, this.commands.length - this.index);

        // insert the new command
        this.commands.push(command);

        // remove old commands
        if(this.commands.length > this.configs.max_commands){
            this.commands = this.commands.slice(this.configs.max_commands * -1);
        }

        // update the index
        this.index = this.commands.length - 1;

        this.triggerEvent('add', {'command': command});

        return this;
    }

    /**
     * Execute the undo action of the current command
     *
     * @return {this}
     */
    undo() {
        const command = this.commands[this.index];

        if (!command) {
            return this;
        }

        // execute the command's undo
         this.execute(command, 'undo');

        // update the index
        this.index -= 1;

        this.triggerEvent('undo', {'command': command});

        return this;
    }

    /**
     * Execute the redo action of the previous command
     *
     * @return {this}
     */
    redo() {
        const command = this.commands[this.index + 1];

        if (!command) {
            return this;
        }

        // execute the command's redo
        this.execute(command, 'redo');

        // update the index
        this.index += 1;

        this.triggerEvent('redo', {'command': command});

        return this;
    }

    /**
     * Remove all commands
     *
     * @return {this}
     */
    clear () {
        const length = this.commands.length;

        this.commands = [];
        this.index = -1;

        if(length > 0) {
            this.triggerEvent('clear');
        }

        return this;

    }

    /**
     * Check if an undo action is available
     *
     * @return {Boolean} Whether an undo action is available
     */
    hasUndo() {
        return this.index !== -1;
    }

    /**
     * Check if a redo action is available
     *
     * @return {Boolean} Whether a redo action is available
     */
    hasRedo() {
        return this.index < (this.commands.length - 1);
    }

}
