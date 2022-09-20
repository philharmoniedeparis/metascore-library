import Msg from "blockly/msg/en";

Msg.APP_STARTUP = "at application startup";
Msg.APP_STARTUP_THEN = "do %1";
Msg.APP_STARTUP_TOOLTIP = "";
Msg.APP_STARTUP_HELPURL = "";

Msg.COMPONENTS_CLICK = "when component %1 is clicked";
Msg.COMPONENTS_CLICK_THEN = "do %1";
Msg.COMPONENTS_CLICK_TOOLTIP = "";
Msg.COMPONENTS_CLICK_HELPURL = "";

Msg.COMPONENTS_SET_SCENARIO = "go to the %1 scenario";
Msg.COMPONENTS_SET_SCENARIO_TOOLTIP = "";
Msg.COMPONENTS_SET_SCENARIO_HELPURL = "";

Msg.COMPONENTS_PROPERTY = {};
Msg.COMPONENTS_PROPERTY["background-color"] = "background color";
Msg.COMPONENTS_PROPERTY["background-image"] = "background image";
Msg.COMPONENTS_PROPERTY["border-color"] = "border color";
Msg.COMPONENTS_PROPERTY["border-width"] = "border width";
Msg.COMPONENTS_PROPERTY["hidden"] = "hidden";
Msg.COMPONENTS_PROPERTY["loop-duration"] = "loop duration";
Msg.COMPONENTS_PROPERTY["reversed"] = "reversed";
Msg.COMPONENTS_PROPERTY["text"] = "text";
Msg.COMPONENTS_PROPERTY["cursor-width"] = "cursor width";
Msg.COMPONENTS_PROPERTY["cursor-color"] = "cursor color";

Msg.COMPONENTS_EMPTY_OPTION = " -- ";
Msg.COMPONENTS_PROPERTY_MOCK_TOOLTIP =
  'there are currently no component in the workspace that supports the "%2" attribute';
Msg.COMPONENTS_NO_SCENARIO_TOOLTIP =
  "there are currently no scenario in the workspace";
Msg.COMPONENTS_NO_BLOCK_TOOLTIP =
  "there are currently no block in the workspace";

Msg.COMPONENTS_GET_PROPERTY = "%2 of %1";
Msg.COMPONENTS_GET_PROPERTY_TOOLTIP = "";
Msg.COMPONENTS_GET_PROPERTY_HELPURL = "";

Msg.COMPONENTS_SET_PROPERTY = "set %2 of %1 to %3";
Msg.COMPONENTS_SET_PROPERTY_TOOLTIP = "";
Msg.COMPONENTS_SET_PROPERTY_HELPURL = "";

Msg.COMPONENTS_GET_BLOCK_PAGE = "active page number of %1";
Msg.COMPONENTS_GET_BLOCK_PAGE_TOOLTIP = "";
Msg.COMPONENTS_GET_BLOCK_PAGE_HELPURL = "";

Msg.COMPONENTS_SET_BLOCK_PAGE = "set active page number of %1 to %2";
Msg.COMPONENTS_SET_BLOCK_PAGE_TOOLTIP = "";
Msg.COMPONENTS_SET_BLOCK_PAGE_HELPURL = "";

Msg.KEYBOARD_KEYPRESSED = "when key %1 is pressed";
Msg.KEYBOARD_KEYPRESSED_THEN = "do %1";
Msg.KEYBOARD_KEYPRESSED_TOOLTIP = "";
Msg.KEYBOARD_KEYPRESSED_HELPURL = "";
Msg.KEYBOARD_KEYPRESSED_ANY = "any";
Msg.KEYBOARD_KEYPRESSED_SPACE = "spacebar";
Msg.KEYBOARD_KEYPRESSED_UP = "▲";
Msg.KEYBOARD_KEYPRESSED_DOWN = "▼";
Msg.KEYBOARD_KEYPRESSED_RIGHT = "▶";
Msg.KEYBOARD_KEYPRESSED_LEFT = "◀";

Msg.LINKS_EMPTY_OPTION = " -- ";

Msg.LINKS_CLICK = "when link %1 is clicked";
Msg.LINKS_CLICK_THEN = "do %1";
Msg.LINKS_CLICK_TOOLTIP = "";
Msg.LINKS_CLICK_EMPTY_TOOLTIP = "";
Msg.LINKS_CLICK_HELPURL = "";

Msg.LINKS_OPEN_URL = "open the url %1";
Msg.LINKS_OPEN_URL_TOOLTIP = "";
Msg.LINKS_OPEN_URL_HELPURL = "";

Msg.MEDIA_TIMECODE_HELPURL = "";
Msg.MEDIA_TIMECODE_TOOLTIP = "";

Msg.MEDIA_GET_DURATION = "media duration";
Msg.MEDIA_GET_DURATION_TOOLTIP = "Returns the media's duration in seconds.";
Msg.MEDIA_GET_DURATION_HELPURL = "";

Msg.MEDIA_GET_TIME = "media time";
Msg.MEDIA_GET_TIME_TOOLTIP = "Returns the current media time in seconds.";
Msg.MEDIA_GET_TIME_HELPURL = "";

Msg.MEDIA_SET_TIME = "set the media time to %1";
Msg.MEDIA_SET_TIME_TOOLTIP = "Sets the media time to be equal to the input.";
Msg.MEDIA_SET_TIME_HELPURL = "";

Msg.MEDIA_PLAYING = "is playing";
Msg.MEDIA_PLAYING_TOOLTIP =
  "Returns true if the media is playing, false otherwise.";
Msg.MEDIA_PLAYING_HELPURL = "";

Msg.MEDIA_PLAY = "start playback";
Msg.MEDIA_PLAY_TOOLTIP = "";
Msg.MEDIA_PLAY_HELPURL = "";

Msg.MEDIA_PLAY_EXCERPT = "%1 play excerpt from %2 to %3";
Msg.MEDIA_PLAY_EXCERPT_TOOLTIP = "";
Msg.MEDIA_PLAY_EXCERPT_HELPURL = "";

Msg.MEDIA_PLAY_EXCERPT_THEN = "then do";
Msg.MEDIA_PLAY_EXCERPT_THEN_TOOLTIP = "";
Msg.MEDIA_PLAY_EXCERPT_THEN_HELPURL = "";

Msg.MEDIA_PAUSE = "pause playback";
Msg.MEDIA_PAUSE_TOOLTIP = "";
Msg.MEDIA_PAUSE_HELPURL = "";

Msg.MEDIA_STOP = "stop playback";
Msg.MEDIA_STOP_TOOLTIP = "";
Msg.MEDIA_STOP_HELPURL = "";

Msg.REACTIVITY_WHEN = "when %1";
Msg.REACTIVITY_WHEN_THEN = "do %1";
Msg.REACTIVITY_WHEN_TOOLTIP = "";
Msg.REACTIVITY_WHEN_HELPURL = "";

export default Msg;
