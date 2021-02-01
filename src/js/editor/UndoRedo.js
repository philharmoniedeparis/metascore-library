import EventEmitter from '../core/EventEmitter';
import {isArray} from '../core/utils/Var';

/**
 * An undo/redo manager
 *
 * @emits {add} Fired when a command is added
 * @param {Object} command The added command
 *
 * @emits {undo} Fired when a command is undone
 * @param {Object} command The added command
 *
 * @emits {redo} Fired when a command is redone
 * @param {Object} command The added command
 */
export default class UndoRedo extends EventEmitter {

    static defaults = {
        'max_commands': 20
    };

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
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        /**
         * The list of available undo/redo commands
         * @type {Array}
         */
        this.commands = {
            'redo': [],
            'undo': []
        };

        /**
         * Whether a command is being executed
         * @type {Boolean}
         */
        this.executing = false;
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

            // Check if this is a group of commands.
            if (isArray(command[action])) {
                command[action].forEach((sub_command) => {
                    sub_command();
                });
            }
            else {
                command[action]();
            }

            this.executing = false;
        }

        return this;
    }

    /**
     * Add a command
     *
     * @param {Object|Array} command The command(s) object. It/each should contain an 'undo' and a 'redo' function
     * @return {this}
     */
    add(command){
        if (this.executing) {
            return this;
        }

        if (this.group) {
            // Add command(s) to group.
            this.group.undo = this.group.undo.concat(command.undo);
            this.group.redo = this.group.redo.concat(command.redo);
        }
        else {
            // remove all redo items
            this.commands.redo = [];

            // insert the new command
            this.commands.undo.push(command);

            // remove old commands
            if(this.commands.undo.length > this.configs.max_commands){
                this.commands.undo = this.commands.undo.slice(this.configs.max_commands * -1);
            }

            this.triggerEvent('add', {'command': command});

        }

        return this;
    }

    /**
     * Start a group of undo/redo commands.
     *
     * @return {this}
     */
    startGroup() {
        if (!this.group) {
            this.group = {
                'undo': [],
                'redo': []
            };
        }

        return this;
    }

    /**
     * End a group of undo/redo commands.
     *
     * @return {this}
     */
    endGroup() {
        const group = this.group;
        delete this.group;

        this.add(group);

        return this;
    }

    /**
     * Execute the undo action of the current command
     *
     * @return {this}
     */
    undo() {
        const command = this.commands.undo.pop();

        if (!command) {
            return this;
        }

        // execute the command's undo
        this.execute(command, 'undo');

        this.commands.redo.push(command);

        this.triggerEvent('undo', {'command': command});

        return this;
    }

    /**
     * Execute the redo action of the previous command
     *
     * @return {this}
     */
    redo() {
        const command = this.commands.redo.pop();

        if (!command) {
            return this;
        }

        // execute the command's redo
        this.execute(command, 'redo');

        this.commands.undo.push(command);

        this.triggerEvent('redo', {'command': command});

        return this;
    }

    /**
     * Remove all commands
     *
     * @return {this}
     */
    clear () {
        this.commands.undo = [];
        this.commands.redo = [];

        return this;
    }

    /**
     * Check if an undo action is available
     *
     * @return {Boolean} Whether an undo action is available
     */
    hasUndo() {
        return this.commands.undo.length > 0;
    }

    /**
     * Check if a redo action is available
     *
     * @return {Boolean} Whether a redo action is available
     */
    hasRedo() {
        return this.commands.redo.length > 0;
    }

    /**
     * Check if an undo or redo operation is undergoing
     *
     * @return {Boolean} Whether a action is undergoing
     */
    isExecuting(){
        return this.executing;
    }

}

export const History = new UndoRedo();