import Msg from "blockly/msg/fr";

Msg.CATEGORIES_ACTIONS = "Actions";
Msg.CATEGORIES_APP = "Application";
Msg.CATEGORIES_COLOR = "Couleur";
Msg.CATEGORIES_COMPONENTS = "Composants";
Msg.CATEGORIES_LOGIC = "Logique";
Msg.CATEGORIES_MATH = "Mathématiques";
Msg.CATEGORIES_MEDIA = "Média";
Msg.CATEGORIES_PRESETS = "Prédéfinis";
Msg.CATEGORIES_TEXT = "Texte";
Msg.CATEGORIES_TRIGGERS = "Déclencheurs";
Msg.CATEGORIES_VARIABLES = "Variables";

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

Msg.APP_GET_IDLE_TIME = "durée d’inactivité";
Msg.APP_GET_IDLE_TIME_TOOLTIP =
  "Secondes écoulées depuis la dernière interaction de l’utilisateur";
Msg.APP_GET_IDLE_TIME_HELPURL = "";

Msg.APP_RESET = "réinitialiser l’application";
Msg.APP_RESET_TOOLTIP = "";
Msg.APP_RESET_HELPURL = "";

Msg.COMPONENTS_COMPONENT = "composant %1";
Msg.COMPONENTS_COMPONENT_TOOLTIP = "";
Msg.COMPONENTS_COMPONENT_HELPURL = "";

Msg.COMPONENTS_CLICK = "au clic sur le composant %1";
Msg.COMPONENTS_CLICK_THEN = "faire %1";
Msg.COMPONENTS_CLICK_TOOLTIP = "";
Msg.COMPONENTS_CLICK_HELPURL = "";

Msg.COMPONENTS_SET_SCENARIO = "aller au scénario %1";
Msg.COMPONENTS_SET_SCENARIO_TOOLTIP = "";
Msg.COMPONENTS_SET_SCENARIO_HELPURL = "";

Msg.COMPONENTS_PROPERTIES = {};
Msg.COMPONENTS_PROPERTIES["background-color"] = "couleur de fond";
Msg.COMPONENTS_PROPERTIES["background-image"] = "image de fond";
Msg.COMPONENTS_PROPERTIES["border-color"] = "couleur de bordure";
Msg.COMPONENTS_PROPERTIES["border-width"] = "largeur de bordure";
Msg.COMPONENTS_PROPERTIES["hidden"] = "caché";
Msg.COMPONENTS_PROPERTIES["loop-duration"] = "durée d’une boucle";
Msg.COMPONENTS_PROPERTIES["reversed"] = "inversé";
Msg.COMPONENTS_PROPERTIES["text"] = "texte";
Msg.COMPONENTS_PROPERTIES["cursor-width"] = "largeur du curseur";
Msg.COMPONENTS_PROPERTIES["cursor-color"] = "couleur du curseur";

Msg.COMPONENTS_PROPERTY_MOCK_TOOLTIP =
  "il n’y a actuellement aucun composant dans l’espace de travail qui supporte l’attribut « %2 ».";
Msg.COMPONENTS_NO_SCENARIO_TOOLTIP =
  "il n’y a actuellement aucun scénario dans l’espace de travail";
Msg.COMPONENTS_NO_BLOCK_TOOLTIP =
  "il n’y a actuellement aucun bloc dans l’espace de travail";

Msg.COMPONENTS_GET_PROPERTY = "%1 de %2";
Msg.COMPONENTS_GET_PROPERTY_TOOLTIP = "";
Msg.COMPONENTS_GET_PROPERTY_HELPURL = "";

Msg.COMPONENTS_SET_PROPERTY = "définir %1 de %2 à %3";
Msg.COMPONENTS_SET_PROPERTY_TOOLTIP = "";
Msg.COMPONENTS_SET_PROPERTY_HELPURL = "";

Msg.COMPONENTS_GET_BLOCK_PAGE = "page active de %1";
Msg.COMPONENTS_GET_BLOCK_PAGE_TOOLTIP = "";
Msg.COMPONENTS_GET_BLOCK_PAGE_HELPURL = "";

Msg.COMPONENTS_SET_BLOCK_PAGE = "aller à la page %1 de %2";
Msg.COMPONENTS_SET_BLOCK_PAGE_TOOLTIP = "";
Msg.COMPONENTS_SET_BLOCK_PAGE_HELPURL = "";

Msg.COMPONENTS_BEHAVIOUR_TRIGGER = "élément déclencheur %1";
Msg.COMPONENTS_BEHAVIOUR_TRIGGER_TOOLTIP = "";
Msg.COMPONENTS_BEHAVIOUR_TRIGGER_HELPURL = "";

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

Msg.LINKS_CLICK = "au clic sur %1";
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

Msg.MEDIA_GET_TIME = "temps du média";
Msg.MEDIA_GET_TIME_TOOLTIP = "Retourne le temps actuel du média en secondes.";
Msg.MEDIA_GET_TIME_HELPURL = "";

Msg.MEDIA_SET_TIME = "définir le temps du média à %1";
Msg.MEDIA_SET_TIME_TOOLTIP =
  "Définit le temps du média pour qu’il soit égale à la valeur de l’entrée.";
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

Msg.MEDIA_STOP = "arrêter la lecture";
Msg.MEDIA_STOP_TOOLTIP = "";
Msg.MEDIA_STOP_HELPURL = "";

Msg.REACTIVITY_WHEN = " %1 lorsque %2";
Msg.REACTIVITY_WHEN_THEN = "faire %1";
Msg.REACTIVITY_WHEN_TOOLTIP = "";
Msg.REACTIVITY_WHEN_HELPURL = "";

Msg.REACTIVITY_WHEN_ELSE = "sinon";
Msg.REACTIVITY_WHEN_ELSE_TOOLTIP = "";
Msg.REACTIVITY_WHEN_ELSE_HELPURL = "";

Msg.VARIABLES_DEFAULT_NAME = "--";
Msg.RENAME_LIST = "Renommer la liste...";
Msg.NEW_LIST = "Créer une liste...";
Msg.NEW_LIST_TITLE = "Nom de la nouvelle liste:";
Msg.RENAME_LIST = "Renommer la liste......";
Msg.RENAME_LIST_TITLE = "Renommer toutes les listes « %1 » en :";
Msg.LISTS_GET = "liste %1";
Msg.LISTS_GET_TOOLTIP = "Renvoie la valeur de cette liste.";
Msg.LISTS_GET_CREATE_SET = "Créer « définir la list %1 à ... »";
Msg.LISTS_SET = "%1 définir la liste %2 à";
Msg.LISTS_SET_TOOLTIP = "Définit cette liste comme étant égale aux entrées.";
Msg.LISTS_SET_CREATE_GET = "Créer « (obtenir) list %1 »";
Msg.LISTS_ADD = "ajouter %1 à la liste %2";
Msg.LISTS_ADD_TOOLTIP = "Ajouter l’item à la liste.";
Msg.LISTS_EMPTY = "vider %1";
Msg.LISTS_EMPTY_TOOLTIP = "Retirer tous les éléments de cette liste";
Msg.LISTS_ISEMPTY_TITLE = "la liste %1 est vide";

export default Msg;
