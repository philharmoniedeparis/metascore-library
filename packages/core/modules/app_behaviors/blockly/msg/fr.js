import Msg from "blockly/msg/fr";

Msg.APP_STARTUP = "au chargement de l’application";
Msg.APP_STARTUP_THEN = "faire %1";
Msg.APP_STARTUP_TOOLTIP = "";
Msg.APP_STARTUP_HELPURL = "";

Msg.APP_ENTER_FULLSCREEN = "entrer en mode plein écran";
Msg.APP_ENTER_FULLSCREEN_TOOLTIP = "";
Msg.APP_ENTER_FULLSCREEN_HELPURL = "";

Msg.APP_EXIT_FULLSCREEN = "quitter le mode plein écran";
Msg.APP_EXIT_FULLSCREEN_TOOLTIP = "";
Msg.APP_EXIT_FULLSCREEN_HELPURL = "";

Msg.APP_TOGGLE_FULLSCREEN = "basculer le mode plein écran";
Msg.APP_TOGGLE_FULLSCREEN_TOOLTIP = "";
Msg.APP_TOGGLE_FULLSCREEN_HELPURL = "";

Msg.COMPONENTS_CLICK = "au clic sur le composant %1";
Msg.COMPONENTS_CLICK_THEN = "faire %1";
Msg.COMPONENTS_CLICK_TOOLTIP = "";
Msg.COMPONENTS_CLICK_HELPURL = "";

Msg.COMPONENTS_SET_SCENARIO = "aller au scénario %1";
Msg.COMPONENTS_SET_SCENARIO_TOOLTIP = "";
Msg.COMPONENTS_SET_SCENARIO_HELPURL = "";

Msg.COMPONENTS_PROPERTY = {};
Msg.COMPONENTS_PROPERTY["background-color"] = "couleur de fond";
Msg.COMPONENTS_PROPERTY["background-image"] = "image de fond";
Msg.COMPONENTS_PROPERTY["border-color"] = "couleur de bordure";
Msg.COMPONENTS_PROPERTY["border-width"] = "largeur de bordure";
Msg.COMPONENTS_PROPERTY["hidden"] = "caché";
Msg.COMPONENTS_PROPERTY["loop-duration"] = "durée d’un boucle";
Msg.COMPONENTS_PROPERTY["reversed"] = "inversé";
Msg.COMPONENTS_PROPERTY["text"] = "texte";
Msg.COMPONENTS_PROPERTY["cursor-width"] = "largeur du curseur";
Msg.COMPONENTS_PROPERTY["cursor-color"] = "couleur du curseur";

Msg.COMPONENTS_EMPTY_OPTION = " -- ";
Msg.COMPONENTS_PROPERTY_MOCK_TOOLTIP =
  "il n’y a actuellement aucun composant dans l’espace de travail qui supporte l’attribut « %2 ».";
Msg.COMPONENTS_NO_SCENARIO_TOOLTIP =
  "il n’y a actuellement aucun scénario dans l’espace de travail";
Msg.COMPONENTS_NO_BLOCK_TOOLTIP =
  "il n’y a actuellement aucun bloc dans l’espace de travail";

Msg.COMPONENTS_GET_PROPERTY = "%2 de %1";
Msg.COMPONENTS_GET_PROPERTY_TOOLTIP = "";
Msg.COMPONENTS_GET_PROPERTY_HELPURL = "";

Msg.COMPONENTS_SET_PROPERTY = "définir %2 de %1 à %3";
Msg.COMPONENTS_SET_PROPERTY_TOOLTIP = "";
Msg.COMPONENTS_SET_PROPERTY_HELPURL = "";

Msg.COMPONENTS_GET_BLOCK_PAGE = "page active de %1";
Msg.COMPONENTS_GET_BLOCK_PAGE_TOOLTIP = "";
Msg.COMPONENTS_GET_BLOCK_PAGE_HELPURL = "";

Msg.COMPONENTS_SET_BLOCK_PAGE = "aller à la page %2 de %1";
Msg.COMPONENTS_SET_BLOCK_PAGE_TOOLTIP = "";
Msg.COMPONENTS_SET_BLOCK_PAGE_HELPURL = "";

Msg.KEYBOARD_KEYPRESSED = "lorsque la touche %1 est appuyée";
Msg.KEYBOARD_KEYPRESSED_THEN = "faire %1";
Msg.KEYBOARD_KEYPRESSED_TOOLTIP = "";
Msg.KEYBOARD_KEYPRESSED_HELPURL = "";
Msg.KEYBOARD_KEYPRESSED_ANY = "n’importe quelle";
Msg.KEYBOARD_KEYPRESSED_SPACE = "barre d’espace";
Msg.KEYBOARD_KEYPRESSED_UP = "▲";
Msg.KEYBOARD_KEYPRESSED_DOWN = "▼";
Msg.KEYBOARD_KEYPRESSED_RIGHT = "▶";
Msg.KEYBOARD_KEYPRESSED_LEFT = "◀";

Msg.LINKS_EMPTY_OPTION = "    ";

Msg.LINKS_CLICK = "au clic sur l’élément déclencheur %1";
Msg.LINKS_CLICK_THEN = "faire %1";
Msg.LINKS_CLICK_TOOLTIP = "";
Msg.LINKS_CLICK_EMPTY_TOOLTIP = "";
Msg.LINKS_CLICK_HELPURL = "";

Msg.LINKS_OPEN_URL = "ouvrir l’url %1";
Msg.LINKS_OPEN_URL_TOOLTIP = "";
Msg.LINKS_OPEN_URL_HELPURL = "";

Msg.MEDIA_TIMECODE_HELPURL = "";
Msg.MEDIA_TIMECODE_TOOLTIP = "";

Msg.MEDIA_GET_DURATION = "durée du média";
Msg.MEDIA_GET_DURATION_TOOLTIP = "Retourne la durée du média en secondes.";
Msg.MEDIA_GET_DURATION_HELPURL = "";

Msg.MEDIA_GET_TIME = "temp du média";
Msg.MEDIA_GET_TIME_TOOLTIP = "Retourne le temps actuel du média en secondes.";
Msg.MEDIA_GET_TIME_HELPURL = "";

Msg.MEDIA_SET_TIME = "définir le temp du média à %1";
Msg.MEDIA_SET_TIME_TOOLTIP =
  "Définit le temp du média pour qu’il soit égale à la valeur de l’entrée.";
Msg.MEDIA_SET_TIME_HELPURL = "";

Msg.MEDIA_PLAYING = "la lecture est en cours";
Msg.MEDIA_PLAYING_TOOLTIP =
  "Retourne vrai si le média est en cours de lecture, faux autrement.";
Msg.MEDIA_PLAYING_HELPURL = "";

Msg.MEDIA_PLAY = "lancer la lecture";
Msg.MEDIA_PLAY_TOOLTIP = "";
Msg.MEDIA_PLAY_HELPURL = "";

Msg.MEDIA_PLAY_EXCERPT = "%1 lire l’extrait de %2 à %3 %4";
Msg.MEDIA_PLAY_EXCERPT_TOOLTIP = "";
Msg.MEDIA_PLAY_EXCERPT_HELPURL = "";

Msg.MEDIA_PLAY_EXCERPT_HIGHLIGHT_LINK = "Surbrillance auto";
Msg.MEDIA_PLAY_EXCERPT_HIGHLIGHT_LINK_TOOLTIP =
  "Mettre le lien en évidence lorsque le temps actuel du média se situe entre ses limites temporelles";

Msg.MEDIA_PLAY_EXCERPT_THEN = "puis faire";
Msg.MEDIA_PLAY_EXCERPT_THEN_TOOLTIP = "";
Msg.MEDIA_PLAY_EXCERPT_THEN_HELPURL = "";

Msg.MEDIA_PAUSE = "suspendre la lecture";
Msg.MEDIA_PAUSE_TOOLTIP = "";
Msg.MEDIA_PAUSE_HELPURL = "";

Msg.MEDIA_STOP = "arrêter la lacture";
Msg.MEDIA_STOP_TOOLTIP = "";
Msg.MEDIA_STOP_HELPURL = "";

Msg.REACTIVITY_WHEN = "lorsque %1";
Msg.REACTIVITY_WHEN_THEN = "faire %1";
Msg.REACTIVITY_WHEN_TOOLTIP = "";
Msg.REACTIVITY_WHEN_HELPURL = "";

export default Msg;
