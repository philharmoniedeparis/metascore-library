# metaScore-library

[![fr](https://img.shields.io/badge/lang-fr-white.svg)](README.md)
[![en](https://img.shields.io/badge/lang-en-blue.svg)](README.en.md)

Implemented by [La Cité de la musique - Philharmonie de Paris](https://philharmoniedeparis.fr), metaScore is an online authoring tool and publishing platform that specializes in handling music into educational presentations. It is designed for teachers and other professionals working in music education and mediation.

The metaScore editor and many examples of realizations can be found [here](https://metascore.philharmoniedeparis.fr/)

The _metaScore-library_ powers the front-end part of the platform.
It provides:
* a __Player__ to view and interact with applications
* an __Editor__ to modify applications
* and an __API__ to interact with embedded players through code

![A screenshot presenting the metaScore editor interface](./screenshot.jpg)

## # Table of contents

* [Quick start](#quick-start)
* [Releases](#releases)
* [Development](#development)
* [Contributing](#contributing)
* [License](#license)
* [Credits](#credits)
* [Copyright](#copyright)

<a name="quick-start"></a>
## # Quick start

### Prerequisites

The _metaScore-library_ consumes server-side RESTful APIs to load and save applications as well as related content such as media assets. The API endpoints are typically exposed by a CMS which also handles user permissions.

### Usage

The build process generates three main entry points and their related chunks.

To insert the Player in an HTML page, first include the entry point files in the head of the document:
```html
<link rel="stylesheet" href="metaScore.Player.css" />
<script src="metaScore.Player.umd.js"></script>
```
Then instantiate the Player:
```html
<script>
  // Wait for the DOM to be ready.
  document.addEventListener("DOMContentLoaded", function() {
    // Create an instance of the Player.
    metaScore.Player.create({
      el: document.body, // The element to append the instance to.
      url: "/api/app", // The main API entry point.
      // ... further config options,
    });
  });
</script>
```
Note that it is recommended to insert the Player in a separate HTML page which is then embedded via an iframe to prevent external CSS from affecting the application.

The same concept above applies when inserting the Editor in an HTML page:
```html
<link rel="stylesheet" href="metaScore.Editor.css" />
<script src="metaScore.Editor.umd.js"></script>
```
Then instantiate the Player:
```html
<script>
  // Wait for the DOM to be ready.
  document.addEventListener("DOMContentLoaded", function() {
    // Create an instance of the Player.
    metaScore.Editor.create({
      el: document.body, // The element to append the instance to.
      url: "/api/app", // The main API entry point.
      // ... further config options,
    });
  });
</script>
```

To programatically control an application that is embedded in an iframe, first include the API entry point script in the head of the document:
```html
<script src="metaScore.API.umd.js"></script>
```
Then either:
1. make sure the iframe has an `ìd` attribute and add HTML links in the form of:
    ```html
    <a href="#{action(s)}" rel="metascore" data-guide="{player's iframe id}">{link text}</a>
    ```
    where `{action(s)}` is a list of actions to perform separated by `&`. For examples, refer to src/player/modules/api/entry.js

2. create an instance of `metaScore.API` and call its methods. For example:
    ```js
    // Get the iframe HTML element.
    const iframe = document.querySelector("iframe#metascore");
    // Create the `metaScore.API` instance.
    new metaScore.API(iframe, () => {
      // This callback is called when the API is ready.

      // Play the media.
      this.play();

      // Seek media to 10 seconds.
      this.seek(10);
    });
    ```

<a name="releases"></a>
## # Releases

See [CHANGELOG.md](./CHANGELOG.md) for release details.

<a name="development"></a>
## # Development

### Prerequisites

To build from source code, first install [Node.js](http://nodejs.org/) and [npm](https://npmjs.org/), then run `npm install` to install dependencies.

### Code structure

The _metaScore-library_ is a modular, multi-package, [monorepo](https://en.wikipedia.org/wiki/Monorepo) project.
It consists of three main packages:
* __player__: defines features specific to the Player and its API
* __editor__: defines features specific to the Editor
* __core__: defines shared features

### Scripts

A list of npm scripts can be found in [package.json](./package.json) or by running `npm run`.
The mains ones are:

- `npm run develop` : compiles with hot-reload for development
- `npm run build` : compiles and minifies for production
- `npm run test:unit` : runs unit tests

<a name="contributing"></a>
## # Contributing

All contributions are welcome, whether in the form of code (pull-requests), feature requests, or bug reports.
Before you start, please read the [contribution guide](./.github/CONTRIBUTING.md).

<a name="license"></a>
## # License

Licensed under the terms of [CECILL-2.1](http://www.cecill.info/licences/Licence_CeCILL_V2.1-en.html) (French Free Software license, compatible with the GNU GPL).
For full details about the license, please check the [LICENSE.md](./LICENSE.md) file.

<a name="credits"></a>
## # Credits

metaScore is implemented by the Philharmonie de Paris since 2005, with the help of many professionals contributing to the product specification, design, development, tests, documentation, tutorials, production of examples, finance, etc. since 2005 (we apology for those not mentionned here) :

Rodolphe Bailly, Mhamed Belghith, Myriam Ben Bachir, Jean Benjamin, Vadim Bernard, Anne-Florence Borneuf, Sigrid Carré-Lecoindre, Roman Cieslik, Mikael Cixous, Jérémie Cohen, Jean Delahousse, Olivier Gaulon, Floriane Goubault, Julien Jugand, Olivier Koechlin, Pietro Milli, Louis Moreau-Gaudry, Oussama Mubarak, Marie-Hélène Serra, Alexandra Simon, Marianne Tricot, Lucas Zanotto...

The software development of metaScore was funded by The Philharmonie de Paris and The French Ministry of Education.

## # Contacts
Development : [Oussama Mubarak](https://github.com/semiaddict), semiaddict.com

Cité de la musique - Philharmonie de Paris : pole-ressources@cite-musique.fr

### Built With

- [Vue.js](https://vuejs.org/)
- [CKEditor](https://ckeditor.com/)
- [Blockly](https://developers.google.com/blockly)
- [Ajv](https://ajv.js.org/)
- and many more

<a name="copyright"></a>
## # Copyright

Copyright © 2024 Cité de la musique - Philharmonie de Paris
