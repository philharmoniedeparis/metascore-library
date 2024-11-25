import * as Blockly from "blockly/core";
import "./core";
import "blockly/blocks";
import { javascriptGenerator } from 'blockly/javascript';
import { colourPicker } from '@blockly/field-colour';

colourPicker.installBlock({
  javascript: javascriptGenerator
});

export default Blockly;
