import Evented from '../core/Evented';

/**
 * Fired when a command is added
 *
 * @event add
 * @param {Object} command The added command
 */
const EVT_ADD = 'add';

/**
 * Fired when a command is undone
 *
 * @event undo
 * @param {Object} command The added command
 */
const EVT_UNDO = 'undo';

/**
 * Fired when a command is redone
 *
 * @event redo
 * @param {Object} command The added command
 */
const EVT_REDO = 'redo';

/**
 * Fired when the command history is cleared
 *
 * @event clear
 */
const EVT_CLEAR = 'clear';

export default class History extends Evented {

    /**
     * An undo/redo manager
     *
     * @class History
     * @namespace editor
     * @extends Evented
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Integer} [configs.max_commands=30] The max number of commands to store
     */
    constructor(configs) {
        // call parent constructor
        super();

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.commands = [];
        this.index = -1;
        this.executing = false;
    }

    static getDefaults() {
        return {
            'max_commands': 30
        };
    }

    /**
     * Execute a command's action
     *
     * @method execute
     * @private
     * @param {Object} command The command object
     * @param {String} action The action ('undo' or 'redo') to execute
     * @chainable
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
     * @method add
     * @param {Object} command The command object. It should contain an 'undo' and a 'redo' function
     * @chainable
     */
    add (command){
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

        this.triggerEvent(EVT_ADD, {'command': command});

        return this;
    }

    /**
     * Execute the undo action of the current command
     *
     * @method undo
     * @chainable
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

        this.triggerEvent(EVT_UNDO, {'command': command});

        return this;
    }

    /**
     * Execute the redo action of the previous command
     *
     * @method redo
     * @chainable
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

        this.triggerEvent(EVT_REDO, {'command': command});

        return this;
    }

    /**
     * Remove all commands
     *
     * @method clear
     * @chainable
     */
    clear () {
        const length = this.commands.length;

        this.commands = [];
        this.index = -1;

        if(length > 0) {
            this.triggerEvent(EVT_CLEAR);
        }

        return this;

    }

    /**
     * Check if an undo action is available
     *
     * @method hasUndo
     * @return {Boolean} Whether an undo action is available
     */
    hasUndo() {
        return this.index !== -1;
    }

    /**
     * Check if a redo action is available
     *
     * @method hasRedo
     * @return {Boolean} Whether a redo action is available
     */
    hasRedo() {
        return this.index < (this.commands.length - 1);
    }

}
