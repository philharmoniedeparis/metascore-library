# Changelog

All notable changes to this project will be documented in this file.

## [3.7.0](https://github.com/philharmoniedeparis/metascore-library/compare/v3.6.4...v3.7.0) (2025-03-13)


### Features

* add Editor.getBlockly ([e011bcd](https://github.com/philharmoniedeparis/metascore-library/commit/e011bcd1c00fc410827efd8e5823d39f835810fb))

## [3.6.2](https://github.com/philharmoniedeparis/metascore-library/compare/v3.6.0...v3.6.2) (2024-10-25)


### Bug Fixes

* don't track idle time when media is playing ([bdbdbd9](https://github.com/philharmoniedeparis/metascore-library/commit/bdbdbd9423f811523de4e66f6ef8c288cfea32a0)), closes [#718](https://github.com/philharmoniedeparis/metascore-library/issues/718)
* fix api's "ready" watcher ([e7c39a2](https://github.com/philharmoniedeparis/metascore-library/commit/e7c39a246a2114a5162756d4e48dca8c0c808785))

## [3.6.1](https://github.com/philharmoniedeparis/metascore-library/compare/v3.6.0...v3.6.1) (2024-10-23)


### Bug Fixes

* don't track idle time when media is playing ([bdbdbd9](https://github.com/philharmoniedeparis/metascore-library/commit/bdbdbd9423f811523de4e66f6ef8c288cfea32a0)), closes [#718](https://github.com/philharmoniedeparis/metascore-library/issues/718)

## [3.6.0](https://github.com/philharmoniedeparis/metascore-library/compare/v3.5.0...v3.6.0) (2024-10-21)


### Features

* add "else" statement to reactivity_when behavior block ([85007d6](https://github.com/philharmoniedeparis/metascore-library/commit/85007d60cf7feb4e49265e11d3040f201f846461)), closes [#686](https://github.com/philharmoniedeparis/metascore-library/issues/686)
* add app_get_idle_time behavior block ([eb95f75](https://github.com/philharmoniedeparis/metascore-library/commit/eb95f75a87b2319d905ad351676be5e8478619c4)), closes [#718](https://github.com/philharmoniedeparis/metascore-library/issues/718)
* add app_reset behavior block ([1048249](https://github.com/philharmoniedeparis/metascore-library/commit/1048249f3ed026c02a2bb61146459aa702163da3))
* add tootips ([64cdc58](https://github.com/philharmoniedeparis/metascore-library/commit/64cdc58b97af723fd5fa78376e12decea3c63404)), closes [#702](https://github.com/philharmoniedeparis/metascore-library/issues/702)
* allow changing the asset's source for media, svg, ... components ([4174058](https://github.com/philharmoniedeparis/metascore-library/commit/41740581e12639913fa7278e6c58511a9526822b)), closes [#694](https://github.com/philharmoniedeparis/metascore-library/issues/694)
* enhance component lists in behavior blocks ([ae010d6](https://github.com/philharmoniedeparis/metascore-library/commit/ae010d6ee619bc15faf5d527e83dfb4e595e2cc9)), closes [#685](https://github.com/philharmoniedeparis/metascore-library/issues/685)
* remove background for timecode behavior fields ([d997eca](https://github.com/philharmoniedeparis/metascore-library/commit/d997ecaefe71845c8b2f092e70f12a294034c6fa))
* remove BlockToggler dimension minimum value constraint ([4aa242e](https://github.com/philharmoniedeparis/metascore-library/commit/4aa242eab6abe98fa1a7480c6fb3ef4c92b8770c))


### Bug Fixes

* fix blockly interpreters' context in production builds ([c9f9c73](https://github.com/philharmoniedeparis/metascore-library/commit/c9f9c73b62bf3f8504c0e9d45f264e6a8700c226))
* fix typo in blockly Components interpreter ([5e3b595](https://github.com/philharmoniedeparis/metascore-library/commit/5e3b59513e4d904f8f24476873b845caa0e874dd))
* insure resampled waveform's scale doesn't go below allowed value ([271a5cc](https://github.com/philharmoniedeparis/metascore-library/commit/271a5cc1041905f2aacbcb01def29eeff9ecf7d9)), closes [#715](https://github.com/philharmoniedeparis/metascore-library/issues/715)
* prevent Blockly keyboard shortcuts from firing when not in focus ([9c5f05c](https://github.com/philharmoniedeparis/metascore-library/commit/9c5f05c094e5efca157e4492aa9b886f98382f6c)), closes [#714](https://github.com/philharmoniedeparis/metascore-library/issues/714)
* remove blockly dropdown watcher updates ([02021c1](https://github.com/philharmoniedeparis/metascore-library/commit/02021c10ad63bd13b81cca2182fd5a04316c74a2))
* round alpha values in ColorPicker ([53ad177](https://github.com/philharmoniedeparis/metascore-library/commit/53ad177403c2040715050fc8e1fce3fc8819b4f0))

## [3.5.0](https://github.com/philharmoniedeparis/metascore-library/compare/v3.4.5...v3.5.0) (2024-03-19)


### Features

* add transition animations to scenario manager ([352624c](https://github.com/philharmoniedeparis/metascore-library/commit/352624ca17859b3ea609927d6a22eaa99d574e2c))
* allow modifying responsiveness via an API method ([ccb42cc](https://github.com/philharmoniedeparis/metascore-library/commit/ccb42ccea5b460afea17fbd38210fcabbba5c2ea))
* allow reordering of scenarios ([c6a52ea](https://github.com/philharmoniedeparis/metascore-library/commit/c6a52ea3f3023538ae705d4ff02645336e271e47)), closes [#697](https://github.com/philharmoniedeparis/metascore-library/issues/697)


### Bug Fixes

* fix history item coalescence ([56bf8b9](https://github.com/philharmoniedeparis/metascore-library/commit/56bf8b9ab55cf42c3858b51bde7e258ff68cc4fc))
* improve component track handle selector in timeline ([b4936a2](https://github.com/philharmoniedeparis/metascore-library/commit/b4936a29ac8ad6d7776e98868dabe738dc37fb9f))
* remove url-regex validator on 'html' schema format ([472d239](https://github.com/philharmoniedeparis/metascore-library/commit/472d239cbed93372551de7ca0f8a52c454eaf6ab))
* revert validate-color dependency to 2.2.1 ([bfb65c2](https://github.com/philharmoniedeparis/metascore-library/commit/bfb65c2b2779ed10922ce3f5a67520f429a6f9d2))

## [3.4.5](https://github.com/philharmoniedeparis/metascore-library/compare/v3.4.4...v3.4.5) (2024-03-09)


### Bug Fixes

* prevent player app from overflowing upwards ([c0a8c7e](https://github.com/philharmoniedeparis/metascore-library/commit/c0a8c7eb174e816b289baae4e407cf11d87bcd6d))

## [3.4.4](https://github.com/philharmoniedeparis/metascore-library/compare/v3.4.3...v3.4.4) (2024-02-22)


### Bug Fixes

* correctly add behavior listeners on scenario change ([aa176bd](https://github.com/philharmoniedeparis/metascore-library/commit/aa176bdf20d3e618447888978431d40ad37e0776)), closes [#622](https://github.com/philharmoniedeparis/metascore-library/issues/622)
* remove Cusror acceleration maximum value constraint ([f4b31a7](https://github.com/philharmoniedeparis/metascore-library/commit/f4b31a717f2906649c22dbacf38bedb2f48e2b79))

## [3.4.3](https://github.com/philharmoniedeparis/metascore-library/compare/v3.4.2...v3.4.3) (2024-01-26)


### Bug Fixes

* fix a focus/selection issue in CKEditor's link plugin ([1f12dcb](https://github.com/philharmoniedeparis/metascore-library/commit/1f12dcbe2775bbbcc4c1bc3c070d46d43f56843b)), closes [#704](https://github.com/philharmoniedeparis/metascore-library/issues/704)

## [3.4.2](https://github.com/philharmoniedeparis/metascore-library/compare/v3.4.1...v3.4.2) (2024-01-19)


### Bug Fixes

* allow block page swiping on touch devices ([de2e321](https://github.com/philharmoniedeparis/metascore-library/commit/de2e321e0282999468d5ecf53ba94a719989f21b))
* coerce animated property values on model update ([29d4c7c](https://github.com/philharmoniedeparis/metascore-library/commit/29d4c7c23955dfd12f35b9f04bcc4ebfd32621b8))
* correctly handle textual breadcrumb items ([d100ba2](https://github.com/philharmoniedeparis/metascore-library/commit/d100ba23ea80ed569145707f823724b078a8d310))
* deselect animated property keyframe when deselecting parent track ([af25414](https://github.com/philharmoniedeparis/metascore-library/commit/af2541430aa3dae04696724262f07eedf3e9f5f1))
* homogenize scrollbar styles across browsers ([68784f4](https://github.com/philharmoniedeparis/metascore-library/commit/68784f4fb87d6c37ab2d19684a2eb062a22b5ce5)), closes [#701](https://github.com/philharmoniedeparis/metascore-library/issues/701)
* increase font size in ScenarioManager ([0b732ec](https://github.com/philharmoniedeparis/metascore-library/commit/0b732ec366da19c15d8331684c44646e3f58b881))
* keep animated property keyframe selected while dragging ([a093054](https://github.com/philharmoniedeparis/metascore-library/commit/a093054966f68545218868aa2d581278cbef9763))
* keep animated property values sorted ([de55f6d](https://github.com/philharmoniedeparis/metascore-library/commit/de55f6d29485ef073b92d516a069b6e6d43048fe))
* keep blockly dropdown options up-to-date ([2e6a797](https://github.com/philharmoniedeparis/metascore-library/commit/2e6a7975ece6f4e0d33eb7b846e2b30adaf1cf09)), closes [#674](https://github.com/philharmoniedeparis/metascore-library/issues/674)
* keep components' order when copying ([1603f43](https://github.com/philharmoniedeparis/metascore-library/commit/1603f432dda39fc3efcfa4fdafd14479bc4f5325)), closes [#649](https://github.com/philharmoniedeparis/metascore-library/issues/649)
* make component click behaviors work across scenarios ([53adbfd](https://github.com/philharmoniedeparis/metascore-library/commit/53adbfd8634565a6026c6f1fc322daeab0a1f86a)), closes [#695](https://github.com/philharmoniedeparis/metascore-library/issues/695)
* preseve shared assets order ([da96c17](https://github.com/philharmoniedeparis/metascore-library/commit/da96c171b6091c67f68528c9d988d87d713a4a8c))
* prevent page swiping during text editing ([8dc2281](https://github.com/philharmoniedeparis/metascore-library/commit/8dc2281306fb1c7eb41906836e9bf29ef77c0219)), closes [#637](https://github.com/philharmoniedeparis/metascore-library/issues/637)
* round displayed value in NumberControl according to the step prop ([07b5d33](https://github.com/philharmoniedeparis/metascore-library/commit/07b5d331c052e2fed891a714718c0057089e37a0)), closes [#696](https://github.com/philharmoniedeparis/metascore-library/issues/696)

## [3.4.1](https://github.com/philharmoniedeparis/metascore-library/compare/v3.4.0...v3.4.1) (2023-12-21)


### Bug Fixes

* import blockly messages before blocks ([dcc6709](https://github.com/philharmoniedeparis/metascore-library/commit/dcc6709cc2808eeb31f6851e9f69e6119784a38c)), closes [#698](https://github.com/philharmoniedeparis/metascore-library/issues/698)

## [3.4.0](https://github.com/philharmoniedeparis/metascore-library/compare/v3.3.2...v3.4.0) (2023-12-20)


### Features

* add image component ([8c44385](https://github.com/philharmoniedeparis/metascore-library/commit/8c443856c1ef59ef2f7152b33907363825fb4b59)), closes [#691](https://github.com/philharmoniedeparis/metascore-library/issues/691)
* update content component text editing button label ([186d880](https://github.com/philharmoniedeparis/metascore-library/commit/186d8808e4802aa923c375208796f99819848a89))
* update timecode-input dependency ([e9ad2cd](https://github.com/philharmoniedeparis/metascore-library/commit/e9ad2cd50c15c00828732c04e0addaf3e7fb7014))


### Bug Fixes

* correctly handle null values in TimeControl ([d1c485a](https://github.com/philharmoniedeparis/metascore-library/commit/d1c485a171d47106dd064e0bc9c270d8df8f5508))
* fix check in API link ids ([11c9f58](https://github.com/philharmoniedeparis/metascore-library/commit/11c9f580048c8857e5049c3f918dffd83f25b73d)), closes [#690](https://github.com/philharmoniedeparis/metascore-library/issues/690)
* fix component drag/resize snapping in timeline ([eb3ef09](https://github.com/philharmoniedeparis/metascore-library/commit/eb3ef09455b03771e8de13cd9a7412ced01289f2))
* fix component editing highlighter position when zooming ([8ce03d4](https://github.com/philharmoniedeparis/metascore-library/commit/8ce03d4e1798731a9428009fa6961fa8f3818d32)), closes [#693](https://github.com/philharmoniedeparis/metascore-library/issues/693)
* fix selection of a restored component ([e601308](https://github.com/philharmoniedeparis/metascore-library/commit/e6013082af98947253ad9981c7f1b46217a8bfc5))
* fix undo delete component ([710490e](https://github.com/philharmoniedeparis/metascore-library/commit/710490ecc97a6418265e0554454d727e4d74902d))
* implement component dragging in timeline ([c88b6a7](https://github.com/philharmoniedeparis/metascore-library/commit/c88b6a74940975b98d1d7ee38cc09a83a338a6d0)), closes [#619](https://github.com/philharmoniedeparis/metascore-library/issues/619)
* prevent click on video/audio of media components in edit mode ([f7d3533](https://github.com/philharmoniedeparis/metascore-library/commit/f7d35338cba3adf845198a4a7716bdc6b5921894))
* prevent resizing component below 1x1 pixels ([011bb1a](https://github.com/philharmoniedeparis/metascore-library/commit/011bb1a6fcdcb5b923072ff46bbcd7a9dc5fe96b))
* stop animated prop keyframe hotkeys from propagating ([b8bf3e1](https://github.com/philharmoniedeparis/metascore-library/commit/b8bf3e1498f6dc25b2aa465a3c84dc937cc67c4b))
* update timecode-input dependency ([28d0190](https://github.com/philharmoniedeparis/metascore-library/commit/28d0190d1a76f4f9ecae86acb9714c7f1e2aa339)), closes [#668](https://github.com/philharmoniedeparis/metascore-library/issues/668)
* use correct apostrophe in French texts ([0ae5ee2](https://github.com/philharmoniedeparis/metascore-library/commit/0ae5ee22e720e273cff751d55263f466a2e1a85a))

## [3.3.2](https://github.com/philharmoniedeparis/metascore-library/compare/v3.3.1...v3.3.2) (2023-10-24)


### Bug Fixes

* fix error in HtmlControl beforeUnmount hook ([4647a61](https://github.com/philharmoniedeparis/metascore-library/commit/4647a612dd05e0c896b12405de903ce6ee77bae5))
* improve cursor alignment in waveform ([bf33fcd](https://github.com/philharmoniedeparis/metascore-library/commit/bf33fcdef9943e14d6e18651c2672d75df13ef78))
* inverse scrollbar colors ([1e40397](https://github.com/philharmoniedeparis/metascore-library/commit/1e40397d743dcbdfe0384751d22a0a7f7953d2f0))
* make behavior triggers work across scenarios ([861004d](https://github.com/philharmoniedeparis/metascore-library/commit/861004da191909fc7acf773d04795ed07ce97f9d)), closes [#622](https://github.com/philharmoniedeparis/metascore-library/issues/622)

## [3.3.1](https://github.com/philharmoniedeparis/metascore-library/compare/v3.3.0...v3.3.1) (2023-10-18)


### Bug Fixes

* fix components behavior blocks error ([b432956](https://github.com/philharmoniedeparis/metascore-library/commit/b432956c5483854293ce60e87dbd3e3c56bb7770)), closes [#596](https://github.com/philharmoniedeparis/metascore-library/issues/596)
* properly handle API links with descendent elements ([67e68cc](https://github.com/philharmoniedeparis/metascore-library/commit/67e68cc090145e304e9b686e9c62dc84f1d0e598)), closes [#689](https://github.com/philharmoniedeparis/metascore-library/issues/689)

## [3.3.0](https://github.com/philharmoniedeparis/metascore-library/compare/v3.2.0...v3.3.0) (2023-09-07)


### Features

* add 'loading' class to player & editor while loading ([9bebb70](https://github.com/philharmoniedeparis/metascore-library/commit/9bebb704e22391e44ec2ec9c726c4c9416f828c4))
* add components breadcrumb ([3157e8d](https://github.com/philharmoniedeparis/metascore-library/commit/3157e8dc4bf157b3b24a10a20ffc13136febb611)), closes [#512](https://github.com/philharmoniedeparis/metascore-library/issues/512)
* add count badge to CursorKeyframesControl ([b8ae50c](https://github.com/philharmoniedeparis/metascore-library/commit/b8ae50c254d4243bd7a2210f9fda23b064bfb6ee)), closes [#676](https://github.com/philharmoniedeparis/metascore-library/issues/676)
* add timeline contextmenu and hotkeys ([e891a79](https://github.com/philharmoniedeparis/metascore-library/commit/e891a791b28587371804a308fc98d73d5034c3fe)), closes [#655](https://github.com/philharmoniedeparis/metascore-library/issues/655)
* allow clearing a cursor's keyframes via contextmenu ([961469b](https://github.com/philharmoniedeparis/metascore-library/commit/961469b036f5f603d0f3d56230a6c37fae3c8249)), closes [#677](https://github.com/philharmoniedeparis/metascore-library/issues/677)
* allow setting playback rate in editor ([9d3d5db](https://github.com/philharmoniedeparis/metascore-library/commit/9d3d5db49a44b65b2fd7e6cb0cdea619faa5d5e5)), closes [#568](https://github.com/philharmoniedeparis/metascore-library/issues/568)
* cache behaviors dropdown list options ([a86aab5](https://github.com/philharmoniedeparis/metascore-library/commit/a86aab5eaa34c04241ae01d9caf446e8bb86c854))
* remove player's hardcoded spacebar hotkey ([3e6e30f](https://github.com/philharmoniedeparis/metascore-library/commit/3e6e30f9035050240d7b09c2269b3d2ae1cf4300)), closes [#562](https://github.com/philharmoniedeparis/metascore-library/issues/562)
* reset playback rate to 1 in preview mode ([bd47902](https://github.com/philharmoniedeparis/metascore-library/commit/bd47902132d8f94c1ae57cfe4ae5b0bbda052039))


### Bug Fixes

* deselect componants when switching scenario ([9e87703](https://github.com/philharmoniedeparis/metascore-library/commit/9e877037edc1a65e717d79d764d785262a041dea))
* fix temporary preview hotkey ([2bcfe59](https://github.com/philharmoniedeparis/metascore-library/commit/2bcfe59046661ec2c640876cce611806af85bb06))
* hide playback-rate control in preview mode ([c2f20cb](https://github.com/philharmoniedeparis/metascore-library/commit/c2f20cb0ab755c3ae4dbe004ae0eae4540ae26b6))
* improve SVG model's error handling ([aa2cbee](https://github.com/philharmoniedeparis/metascore-library/commit/aa2cbeeb52cb49e0b94ed8fd238ed5f25dfb792b))
* prevent breadcrumb separator overflow ([971a1ee](https://github.com/philharmoniedeparis/metascore-library/commit/971a1eef322addd17788732fc9533dd26d362a2c))
* prevent default action on keyboard behavior ([edb3eec](https://github.com/philharmoniedeparis/metascore-library/commit/edb3eecf53078a64a4e52c46cbcc85ff9e3a8144))
* prevent deleting a scenario via hotkeys ([2778666](https://github.com/philharmoniedeparis/metascore-library/commit/27786660e0b6480fe8e01e7f20728be7073cd621))
* remove futile BaseModal wrapper ([c3f8301](https://github.com/philharmoniedeparis/metascore-library/commit/c3f83017113f5a84b8475a1ae83e7dfc3570a609))
* revert removal of BaseModal wrapper ([d80746e](https://github.com/philharmoniedeparis/metascore-library/commit/d80746e17aacdbbe1bfc126653493c5dad8bff07))
* use current locale in RevisionSelector date formatter ([afca7c4](https://github.com/philharmoniedeparis/metascore-library/commit/afca7c4ed551367d83ce7eac68367244992bcbe9))

## [3.2.0](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.11...v3.2.0) (2023-06-27)


### Features

* add "px" suffix to some UserPreferencesForm fields ([7337374](https://github.com/philharmoniedeparis/metascore-library/commit/73373745e59c30c83e3b5b51b90fbc210a2f0346))
* add editor user preferences ([f138364](https://github.com/philharmoniedeparis/metascore-library/commit/f138364b81177b4a0a87f103212e2528b2543d97)), closes [#104](https://github.com/philharmoniedeparis/metascore-library/issues/104)
* add support for "center" position in intro steps ([03e53cc](https://github.com/philharmoniedeparis/metascore-library/commit/03e53cc643ad712f55bd4feae9e19dd21daa09a9))
* add support for event modifiers in interactive intro steps ([24e676e](https://github.com/philharmoniedeparis/metascore-library/commit/24e676e84fc4e672073ef32d0e135dfd9e7ae13e))
* handle interactive and wait steps in intros ([c5e797b](https://github.com/philharmoniedeparis/metascore-library/commit/c5e797bebb42b89c8d8832bdf6933dcadfb82cb6)), closes [#587](https://github.com/philharmoniedeparis/metascore-library/issues/587)


### Bug Fixes

* fix intro steps processing ([2582406](https://github.com/philharmoniedeparis/metascore-library/commit/258240619ba81abdd3916d9b15f0f009bab22030))
* fix NumberControl horizontal spinner arrows ([deb50c4](https://github.com/philharmoniedeparis/metascore-library/commit/deb50c46149dc668b5824de3531ebb7f79b1238b))
* fix updating of ColorControl opener style ([ce4e2a5](https://github.com/philharmoniedeparis/metascore-library/commit/ce4e2a5535426fe375b17ef3074c5d4a8ba96eaf)), closes [#671](https://github.com/philharmoniedeparis/metascore-library/issues/671)
* improve UserPreferencesForm labels ([d7898db](https://github.com/philharmoniedeparis/metascore-library/commit/d7898db87c6070e627f814a0b11d24333a53fc6a))
* init user preferences before other modules ([0225425](https://github.com/philharmoniedeparis/metascore-library/commit/0225425a8131159c8d8a9cd31fcd7bfc2de16798))
* translate Cursor direction options in ComponentForm ([b730987](https://github.com/philharmoniedeparis/metascore-library/commit/b7309874004f382e3063ce46a1991c580ab792f1))
* update SVG document ref in SVGComponent when moved around the DOM tree ([f8b0775](https://github.com/philharmoniedeparis/metascore-library/commit/f8b077529b7e0deb943de70b0def71e9794f394b)), closes [#679](https://github.com/philharmoniedeparis/metascore-library/issues/679)

## [3.1.11](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.10...v3.1.11) (2023-04-25)


### Bug Fixes

* add padding to SharedAssetsToolbar input ([7c40e4c](https://github.com/philharmoniedeparis/metascore-library/commit/7c40e4c0e134bd845f0a43f55830e3466802f16c))
* fix SVG icons' vertical alignment ([df6beea](https://github.com/philharmoniedeparis/metascore-library/commit/df6beea31021df4e83063fe7096fd20765150843)), closes [#666](https://github.com/philharmoniedeparis/metascore-library/issues/666)
* prevent BlockToggler buttons from being hidden ([ca4e84d](https://github.com/philharmoniedeparis/metascore-library/commit/ca4e84d25a9a6be32ea1d5ea471668475c033b26)), closes [#669](https://github.com/philharmoniedeparis/metascore-library/issues/669)
* remove duplicate mod+e hotkey in hotkeys list ([33d506e](https://github.com/philharmoniedeparis/metascore-library/commit/33d506ed1ff6e0864218171ac6c05c3c8cf3f4ec)), closes [#673](https://github.com/philharmoniedeparis/metascore-library/issues/673)
* translate Cursor form options in ComponentForm ([7c227c4](https://github.com/philharmoniedeparis/metascore-library/commit/7c227c4f883acce9955e88422ba4a0d40b471087)), closes [#670](https://github.com/philharmoniedeparis/metascore-library/issues/670)

## [3.1.10](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.9...v3.1.10) (2023-03-30)


### Bug Fixes

* allow dropping SVG assets in HTMLControl ([1aaf1cd](https://github.com/philharmoniedeparis/metascore-library/commit/1aaf1cd94e698b2e0562ce19e882bbc96a009ba8)), closes [#662](https://github.com/philharmoniedeparis/metascore-library/issues/662)
* prevent unsupported dropping in HTMLControl ([dd8db28](https://github.com/philharmoniedeparis/metascore-library/commit/dd8db280e3bfdd7f6481fae270655514699ece61))
* remove usage of app_preview in app_behaviors ([6d2fb5e](https://github.com/philharmoniedeparis/metascore-library/commit/6d2fb5e0a0ce88916f58f1e7be141ee4769049b4)), closes [#664](https://github.com/philharmoniedeparis/metascore-library/issues/664)

## [3.1.9](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.8...v3.1.9) (2023-03-29)


### Features

* isolate a ContentComponent when being edited ([5073302](https://github.com/philharmoniedeparis/metascore-library/commit/50733027a50ad853634efafe0e785ddfc097d367)), closes [#577](https://github.com/philharmoniedeparis/metascore-library/issues/577)
* isolate a CursorComponent when editing keyframes ([aaaaa4b](https://github.com/philharmoniedeparis/metascore-library/commit/aaaaa4bf707fb298519200326c22c56dcee932c1)), closes [#293](https://github.com/philharmoniedeparis/metascore-library/issues/293)
* reduce Cursor and Content highlight overlay opaccity ([c818fbf](https://github.com/philharmoniedeparis/metascore-library/commit/c818fbfd7e4da1f8153a818ee1d42158825e9281))


### Bug Fixes

* allow component multi-selection from timeline ([0fcf6d4](https://github.com/philharmoniedeparis/metascore-library/commit/0fcf6d42c33681da6bb1e3c6eef5e7a52b5f4eb3)), closes [#651](https://github.com/philharmoniedeparis/metascore-library/issues/651)
* prevent editor styles from affecting app styles ([3ceb5df](https://github.com/philharmoniedeparis/metascore-library/commit/3ceb5dfcf2946f0e98bb4031881dd031fc6bb5c1))
* use default font for buttons ([9ac7f85](https://github.com/philharmoniedeparis/metascore-library/commit/9ac7f8596c8dfea08753ad3f6d3354df788da95c))

## [3.1.8](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.7...v3.1.8) (2023-03-21)


### Features

* add label to empty background-image option in ComponentForm ([ade3ee9](https://github.com/philharmoniedeparis/metascore-library/commit/ade3ee9ca0aacd2f1a5ed645d29628a7054aafed)), closes [#389](https://github.com/philharmoniedeparis/metascore-library/issues/389)


### Bug Fixes

* draw first frame in VideoRenderer as soon as data is available ([f834b3f](https://github.com/philharmoniedeparis/metascore-library/commit/f834b3fa3aaee2901535917fbdd745445d638014)), closes [#395](https://github.com/philharmoniedeparis/metascore-library/issues/395)
* fix opener ref in ColorControl ([31a6e79](https://github.com/philharmoniedeparis/metascore-library/commit/31a6e7911e3cc10b8ca4005c496df571cc9c01b2))
* fix SVGComponent <object> position ([820328d](https://github.com/philharmoniedeparis/metascore-library/commit/820328dc302651223f85ba81b62d65495293b4b4))

## [3.1.7](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.6...v3.1.7) (2023-03-20)


### Bug Fixes

* fix "mod+e" hotkey for macOS ([becf124](https://github.com/philharmoniedeparis/metascore-library/commit/becf1246d16360504a7af714ac21ac2dab9bd3a8)), closes [#574](https://github.com/philharmoniedeparis/metascore-library/issues/574)
* fix component multi-selection with shift key ([272056d](https://github.com/philharmoniedeparis/metascore-library/commit/272056d33c96271ef1dab4de749d0f3e864c16ec)), closes [#658](https://github.com/philharmoniedeparis/metascore-library/issues/658)

## [3.1.6](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.5...v3.1.6) (2023-03-20)


### Bug Fixes

* fix attach general hotkeys to document ([242142c](https://github.com/philharmoniedeparis/metascore-library/commit/242142caab5a80bcbcfedc4add2a840113cddfb1))

## [3.1.5](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.4...v3.1.5) (2023-03-17)


### Bug Fixes

* prevent editor font color from affecting app ([9fda175](https://github.com/philharmoniedeparis/metascore-library/commit/9fda17571d5e002875bb4b10f86d33182476c45d)), closes [#656](https://github.com/philharmoniedeparis/metascore-library/issues/656)

## [3.1.4](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.3...v3.1.4) (2023-03-17)


### Features

* allow manual input in BorderRadiusControl ([12e1c43](https://github.com/philharmoniedeparis/metascore-library/commit/12e1c43dc8d1dd758508e620563a68a0a68a40b1)), closes [#652](https://github.com/philharmoniedeparis/metascore-library/issues/652)
* remove iframe usage in editor ([9863d69](https://github.com/philharmoniedeparis/metascore-library/commit/9863d69d7b9083ea9d62f149ad121b96cb3ac80d)), closes [#628](https://github.com/philharmoniedeparis/metascore-library/issues/628)


### Bug Fixes

* always show component selection indicator when in editing mode ([e3dd061](https://github.com/philharmoniedeparis/metascore-library/commit/e3dd06170c1c4c062f419b8728e3d09b3966bfb8)), closes [#636](https://github.com/philharmoniedeparis/metascore-library/issues/636)
* correctly handle SVG property values ([58b2301](https://github.com/philharmoniedeparis/metascore-library/commit/58b23014321e61c47c14e893c22d6400fe265273)), closes [#645](https://github.com/philharmoniedeparis/metascore-library/issues/645)
* fix asset uplaods in Blink based browsers ([be8caba](https://github.com/philharmoniedeparis/metascore-library/commit/be8caba46ca8fe74801ee1c4e900e2faea7befdf)), closes [#648](https://github.com/philharmoniedeparis/metascore-library/issues/648)
* fix control overlays' auto-hiding ([6d898d4](https://github.com/philharmoniedeparis/metascore-library/commit/6d898d4ce2384076aceb9f3f41875b695b486359))
* fix hotkey binding update ([593bbe8](https://github.com/philharmoniedeparis/metascore-library/commit/593bbe80a7fb77b465e53f90d9415925257dcdf7))
* fix links not added on selection when using CKEditor ([543994c](https://github.com/philharmoniedeparis/metascore-library/commit/543994c3bb8dc96a66ddb29de69622fcaaa4a1a1)), closes [#654](https://github.com/philharmoniedeparis/metascore-library/issues/654)
* fix some translations ([4ef381d](https://github.com/philharmoniedeparis/metascore-library/commit/4ef381d4c6742a5d94c329fa5e353450d63a8244)), closes [#642](https://github.com/philharmoniedeparis/metascore-library/issues/642)
* fix Tab-key focus navigation ([73cd690](https://github.com/philharmoniedeparis/metascore-library/commit/73cd690a6da5b322794dee598b20015a54cd4e37))
* fix typos ([36ec44b](https://github.com/philharmoniedeparis/metascore-library/commit/36ec44bdb9fbfedda908ae4e06d545f098f36c19)), closes [#631](https://github.com/philharmoniedeparis/metascore-library/issues/631)
* fix typos ([257007f](https://github.com/philharmoniedeparis/metascore-library/commit/257007f8dc9db92c687b6d2bf570e9938f3b048f)), closes [#631](https://github.com/philharmoniedeparis/metascore-library/issues/631)
* hide component controlbox when component is not visible in viewport ([b0dfe04](https://github.com/philharmoniedeparis/metascore-library/commit/b0dfe04e2c71263e380c31b27a4b31f39f5175bb)), closes [#639](https://github.com/philharmoniedeparis/metascore-library/issues/639)
* prevent editor styles from affecting app styles ([252a571](https://github.com/philharmoniedeparis/metascore-library/commit/252a571a22604d0a16674bce1fe4288552f3b9d1))
* prevent tab focus on NumberControl buttons ([5d15554](https://github.com/philharmoniedeparis/metascore-library/commit/5d15554c1db988354ffc42d19de86b00a8ec907a))
* update ckeditor patches ([fe2fb90](https://github.com/philharmoniedeparis/metascore-library/commit/fe2fb9000fa15da4c7284d827299728ca508a682))

## [3.1.3](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.2...v3.1.3) (2023-02-16)


### Bug Fixes

* don't run inernal update in inactive components ([9ef8c05](https://github.com/philharmoniedeparis/metascore-library/commit/9ef8c0561b34adef2119c54ce84cda36e45cd14d)), closes [#632](https://github.com/philharmoniedeparis/metascore-library/issues/632)
* fix time calculation on circular cursor click ([b227e39](https://github.com/philharmoniedeparis/metascore-library/commit/b227e39bacb0008aa986b7766f33bd11ffecd524)), closes [#630](https://github.com/philharmoniedeparis/metascore-library/issues/630)
* restore player keyboard shortcuts ([5187a20](https://github.com/philharmoniedeparis/metascore-library/commit/5187a20d98d7922ac94d8a9aea48eb41eaf8d389))

## [3.1.2](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.1...v3.1.2) (2023-02-16)


### Features

* enhance behavior block colors ([398e2d9](https://github.com/philharmoniedeparis/metascore-library/commit/398e2d905dfb672562e95e648cddd652bfcd7d2e)), closes [#586](https://github.com/philharmoniedeparis/metascore-library/issues/586)


### Bug Fixes

* apply backrgound containement to all components except pages ([c15bef9](https://github.com/philharmoniedeparis/metascore-library/commit/c15bef960595a8cec6676744b6df5f4921427aa1))

## [3.1.1](https://github.com/philharmoniedeparis/metascore-library/compare/v3.1.0...v3.1.1) (2023-02-16)


### Bug Fixes

* fix typo ([ef014a3](https://github.com/philharmoniedeparis/metascore-library/commit/ef014a3e307272572ca1825c1ecbf9f7c5174bf1))
* remove background containement in useBackground ([37475c1](https://github.com/philharmoniedeparis/metascore-library/commit/37475c1d1c5a096da17c4e0d26c50564ecb6ced6))

## [3.1.0](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.9...v3.1.0) (2023-02-16)


### Features

* add component rotatation ([c7f6db9](https://github.com/philharmoniedeparis/metascore-library/commit/c7f6db9951c4b0082f6ada11ca5d94598a7739b1)), closes [#295](https://github.com/philharmoniedeparis/metascore-library/issues/295)
* add default values to CSS var function calls ([ae019d9](https://github.com/philharmoniedeparis/metascore-library/commit/ae019d978db5ee1d8db642d2142223c362c6cc7c))
* customize player load indicator and context menu ([bab31e4](https://github.com/philharmoniedeparis/metascore-library/commit/bab31e43fef16bcd4a7718fbfdb9a58182b8e360)), closes [#593](https://github.com/philharmoniedeparis/metascore-library/issues/593)
* return full component instance in app_components get ([ca87ebe](https://github.com/philharmoniedeparis/metascore-library/commit/ca87ebe747962e6a1943ac3666e4b773f5be36df))


### Bug Fixes

* adapt BlockToggler to component override changes ([705a8e0](https://github.com/philharmoniedeparis/metascore-library/commit/705a8e07291646dcf3edce70ccb9de9e3f009f2e))
* adapt property keyframe handle positions to timeline zoom ([2b64fd1](https://github.com/philharmoniedeparis/metascore-library/commit/2b64fd1cc61b1cdad6db74d656d631a8492e7133)), closes [#620](https://github.com/philharmoniedeparis/metascore-library/issues/620)
* add missing defaults to the SVG model ([0d56855](https://github.com/philharmoniedeparis/metascore-library/commit/0d5685597d9f294cb6e43b0b21cee88c9a0d19da))
* add missing prefix to CSS variables ([69fc185](https://github.com/philharmoniedeparis/metascore-library/commit/69fc185ae122480c93d213f1762180c7f26a04ea))
* allow clicking on non-active cursors ([f0f3ba5](https://github.com/philharmoniedeparis/metascore-library/commit/f0f3ba52dc019d6ec2c28bdee3bbbc024a8a045d)), closes [#629](https://github.com/philharmoniedeparis/metascore-library/issues/629)
* center Waveform on current time when zooming ([e6e81a6](https://github.com/philharmoniedeparis/metascore-library/commit/e6e81a665af207926270e2aad5e7d2921084ea1e)), closes [#603](https://github.com/philharmoniedeparis/metascore-library/issues/603)
* don't assign values directly to _data when updating component ([c20eddf](https://github.com/philharmoniedeparis/metascore-library/commit/c20eddfe5f56e0b5272e897973067765772c92b0))
* don't save SVG markers ([9146e34](https://github.com/philharmoniedeparis/metascore-library/commit/9146e341488aef605ebb74fad992ca94f598840b))
* don't validate data on component paste ([b67378a](https://github.com/philharmoniedeparis/metascore-library/commit/b67378a72443fb15ed6369589ec28aade3c15ab9))
* fix Animation loop duration default retrieval ([3aa6f7d](https://github.com/philharmoniedeparis/metascore-library/commit/3aa6f7d63d4584d792981ba97d53e7f43ea1632b))
* fix component copy/paste ([8727cfe](https://github.com/philharmoniedeparis/metascore-library/commit/8727cfe4bb4112f69c4c64f1c6240cb2857384a0))
* fix data bindings in CKEditor links plugin ([fccf48d](https://github.com/philharmoniedeparis/metascore-library/commit/fccf48d1ba6ddd1d2211e5aab7553abdccf02192)), closes [#627](https://github.com/philharmoniedeparis/metascore-library/issues/627) [#626](https://github.com/philharmoniedeparis/metascore-library/issues/626)
* fix displaying of Timeline animated property tracks ([ba41dbc](https://github.com/philharmoniedeparis/metascore-library/commit/ba41dbc1128faa5ce737d12fe2c8b6ac396d39ab))
* fix error in AnimationComponent style ([3d32955](https://github.com/philharmoniedeparis/metascore-library/commit/3d32955c22b82ab263edcae8798fba19ceb73468))
* fix isComponentSelected and isComponentLocked ([eaf8769](https://github.com/philharmoniedeparis/metascore-library/commit/eaf87692379ab728003ae59056d48e6fc1aa658d))
* fix synched block icon ([eae796c](https://github.com/philharmoniedeparis/metascore-library/commit/eae796c8bf36244cfebabd3f07b1cb98819b7fc3)), closes [#625](https://github.com/philharmoniedeparis/metascore-library/issues/625)
* fix synched Block page turning ([fd9b86c](https://github.com/philharmoniedeparis/metascore-library/commit/fd9b86cbfc0cc114a4f8816a601884b941949347))
* fix VideoRenderer display in editor ([5f0d3a9](https://github.com/philharmoniedeparis/metascore-library/commit/5f0d3a90eb70260505f3bb20d2fdeae6b8d05385))
* improve scrollbar styles ([dc1554e](https://github.com/philharmoniedeparis/metascore-library/commit/dc1554e8520a0e5d0e057c28aa92c3f3ec00c8ba))
* keep children order when cloning component ([248d791](https://github.com/philharmoniedeparis/metascore-library/commit/248d791bb22fcfe4965bef548e501d3bdf6a751e)), closes [#621](https://github.com/philharmoniedeparis/metascore-library/issues/621)
* prevent overriding component type and id properties ([e941e10](https://github.com/philharmoniedeparis/metascore-library/commit/e941e1052f8300b740ec132ac6215d2dd7216a52))
* redraw component control box when exiting preview mode ([df79c7c](https://github.com/philharmoniedeparis/metascore-library/commit/df79c7c828a8258cdd17d02ce9629207fdb799f7))
* redraw component control box when reverting a delete ([1c3cf4f](https://github.com/philharmoniedeparis/metascore-library/commit/1c3cf4ffa5fc552dabca1361132b8283bac768f7))
* remove Block component background containement ([1db2d85](https://github.com/philharmoniedeparis/metascore-library/commit/1db2d85fdcd25524fa4a32c4e0fe2ab70e3893f9))
* remove most context menu items in preview mode ([18fb2a9](https://github.com/philharmoniedeparis/metascore-library/commit/18fb2a9a4ddf1d213e42fff8ca70c297c348a34c))
* rename block toggle action in CKEditor link plugin ([3193ca2](https://github.com/philharmoniedeparis/metascore-library/commit/3193ca2041b1da2c16c37d9aa326386512ea44d3))
* replace rotation handle cursor ([d65b66b](https://github.com/philharmoniedeparis/metascore-library/commit/d65b66b24017278a7970ba707d39aae6dcf96b80))
* round default animation loop-duration ([267f4f9](https://github.com/philharmoniedeparis/metascore-library/commit/267f4f9e82a99df18b36c98764548e55896432ad))
* unfreeze correct component when closing WYSIWYG ([ee4aabe](https://github.com/philharmoniedeparis/metascore-library/commit/ee4aabe9ee8967aeea15575e7ae3b10ef3b52373)), closes [#623](https://github.com/philharmoniedeparis/metascore-library/issues/623)

## [3.0.9](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.8...v3.0.9) (2023-02-01)


### Bug Fixes

* don't override SVG and Animation colors with defaults ([d7c7767](https://github.com/philharmoniedeparis/metascore-library/commit/d7c7767335ca36b252cd95b264d6e471fc630933))
* fix truncated animations ([3b18736](https://github.com/philharmoniedeparis/metascore-library/commit/3b18736d7faef382118a2ae4e6818a28a47b4430)), closes [#613](https://github.com/philharmoniedeparis/metascore-library/issues/613)

## [3.0.8](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.7...v3.0.8) (2023-02-01)


### Bug Fixes

* allow arbitrary precision in color opacity values ([ee30b3e](https://github.com/philharmoniedeparis/metascore-library/commit/ee30b3ed721e7d83ffee54ee061c93c37de7b85c)), closes [#612](https://github.com/philharmoniedeparis/metascore-library/issues/612)

## [3.0.7](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.6...v3.0.7) (2023-01-31)

## [3.0.6](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.5...v3.0.6) (2023-01-31)


### Features

* prefill audiowaveform and spectrogram asset dimensions to selected component dimensions ([e2a58b0](https://github.com/philharmoniedeparis/metascore-library/commit/e2a58b03202397f3a45bc1270191b0e97837cdac)), closes [#609](https://github.com/philharmoniedeparis/metascore-library/issues/609)
* theme with CSS variables ([58885ea](https://github.com/philharmoniedeparis/metascore-library/commit/58885ea572144f1fb1d1d0f66b36f7d424c43336))


### Bug Fixes

* don't render empty text in ContentComponent ([53271d6](https://github.com/philharmoniedeparis/metascore-library/commit/53271d6718fdc015514e6c56d16ce6e44c356174))
* fix ComponentTrack resize snap ([5a7b951](https://github.com/philharmoniedeparis/metascore-library/commit/5a7b951e0c8793d63b022b6526ca1fb8c5871482)), closes [#604](https://github.com/philharmoniedeparis/metascore-library/issues/604)
* handle play excerpt links with no scenario ([3adc436](https://github.com/philharmoniedeparis/metascore-library/commit/3adc4364e505f193c31baf088011f115009779b2)), closes [#598](https://github.com/philharmoniedeparis/metascore-library/issues/598)
* properly remove dblclick event listener in HtmlControl ([9b3f808](https://github.com/philharmoniedeparis/metascore-library/commit/9b3f8081c76704636b16b03783dd9ee3899115d9)), closes [#595](https://github.com/philharmoniedeparis/metascore-library/issues/595)
* set default dimensions to dropped media if none are specified ([4955c24](https://github.com/philharmoniedeparis/metascore-library/commit/4955c24a152a5b6ead5fa88be1fc2d74e35290bb)), closes [#611](https://github.com/philharmoniedeparis/metascore-library/issues/611)

## [3.0.5](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.4...v3.0.5) (2023-01-26)


### Bug Fixes

* work around i18n not being systematically available in HTMLControl ([8d9d82d](https://github.com/philharmoniedeparis/metascore-library/commit/8d9d82d2a8964ff303ead0b4ae7b08a4363c8b47)), closes [#595](https://github.com/philharmoniedeparis/metascore-library/issues/595)

## [3.0.4](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.3...v3.0.4) (2023-01-25)


### Bug Fixes

* fix component options in behavior blocks ([8c94039](https://github.com/philharmoniedeparis/metascore-library/commit/8c940393f57f980f744536b15590a7488292186f)), closes [#596](https://github.com/philharmoniedeparis/metascore-library/issues/596)

## [3.0.3](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.2...v3.0.3) (2023-01-24)


### Bug Fixes

* assign a unique id upon component creation ([085501b](https://github.com/philharmoniedeparis/metascore-library/commit/085501b0346f4f47f6be16502d1f89e92892c628))
* fix model error handling ([08cd93c](https://github.com/philharmoniedeparis/metascore-library/commit/08cd93c83c936591a2420317bff1d125c2dc04f0))

## [3.0.2](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.1...v3.0.2) (2023-01-24)


### Bug Fixes

* cache model validation functions ([0868eef](https://github.com/philharmoniedeparis/metascore-library/commit/0868eefad82acac202d18128bd1c3e701b49a916)), closes [#591](https://github.com/philharmoniedeparis/metascore-library/issues/591)

## [3.0.1](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0...v3.0.1) (2023-01-23)


### Bug Fixes

* fix erroneous references to "this" in player API service ([7bab3b8](https://github.com/philharmoniedeparis/metascore-library/commit/7bab3b81033264ab6c9b755b437dfe9f6199606e)), closes [#590](https://github.com/philharmoniedeparis/metascore-library/issues/590)

## [3.0.0](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.11...v3.0.0) (2023-01-22)


### Bug Fixes

* make behavior's toolbox scrollbar visible ([8937233](https://github.com/philharmoniedeparis/metascore-library/commit/8937233a1ae74ab621c581a0f202a87d645cad72))

## [3.0.0-alpha.11](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.10...v3.0.0-alpha.11) (2023-01-18)


### Bug Fixes

* disallow dropping page at the start or end time of another page ([fafcf1f](https://github.com/philharmoniedeparis/metascore-library/commit/fafcf1f7e03fc0d3161d513c9885fbe458dee8b9))
* fix undo adding page in synched block ([bf80d65](https://github.com/philharmoniedeparis/metascore-library/commit/bf80d65ef70f7af615510674ad952c62697ba403))
* fix WaveformZoom data resampling when swiching back from preview mode ([d3f3c4a](https://github.com/philharmoniedeparis/metascore-library/commit/d3f3c4a3b42f0f3670860250fe67b822d4aaaa4d))
* improve CKEditor behavior trigger preview ([598c2ea](https://github.com/philharmoniedeparis/metascore-library/commit/598c2ea8810a867020c749477335e0543154a4ea))
* remove padding from DotNavigation buttons in Chrome ([5cecbd3](https://github.com/philharmoniedeparis/metascore-library/commit/5cecbd3878ccd7ebd7620e2ac411242dde1dbe5c))
* use correct apostrophe in French texts ([36af261](https://github.com/philharmoniedeparis/metascore-library/commit/36af26125ad0d2b9041dd7b95b20389ffa4a2f35))

## [3.0.0-alpha.10](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.9...v3.0.0-alpha.10) (2023-01-17)


### Features

* add context prop to IntroTour ([1cd571e](https://github.com/philharmoniedeparis/metascore-library/commit/1cd571e6b9e6db2f773f50fc2d1c287b7119833c))
* add tooltip to MediaSelector button ([0e44d4f](https://github.com/philharmoniedeparis/metascore-library/commit/0e44d4fd75bed0650b3d644b7e26ea9a51245109))
* add translations to CKEditor behaviortrigger ([8e3e9b7](https://github.com/philharmoniedeparis/metascore-library/commit/8e3e9b7626d33437faf66a38fed41a624969e0d7))
* improve "auto highlight" label in behavior blocks ([cb7838c](https://github.com/philharmoniedeparis/metascore-library/commit/cb7838c1420a0215aa783bb8679f330b0079a64a))
* rearrange CKEditor's toolbar buttons ([56ccd53](https://github.com/philharmoniedeparis/metascore-library/commit/56ccd53e6dcec90bf5872ecd39e042eb632de158))
* replace CKEditor link and behaviortrigger icons ([bb76d8b](https://github.com/philharmoniedeparis/metascore-library/commit/bb76d8bca11e1241e4798592b656af06491d6e91))
* replace links_click behavior block label ([f11b360](https://github.com/philharmoniedeparis/metascore-library/commit/f11b360145218b4d14c422b8c6c6f5f207099f08))


### Bug Fixes

* center alert dialog text ([792b76c](https://github.com/philharmoniedeparis/metascore-library/commit/792b76c251bbeecb28c25568c5877484a8cc8c17))
* disable AppZoomController in preview mode ([b02e741](https://github.com/philharmoniedeparis/metascore-library/commit/b02e7418e8b5f4d93870292813840c070cf9510b))
* fix typo ([d28596e](https://github.com/philharmoniedeparis/metascore-library/commit/d28596ec915b52fff22c6cb86cfcb67bad8bee6b))
* handle MediaSelector errors ([e00e8fe](https://github.com/philharmoniedeparis/metascore-library/commit/e00e8fed27f84163b30e0fbf5e44badf72b42263))
* improve intro previous button label ([4af8a02](https://github.com/philharmoniedeparis/metascore-library/commit/4af8a027ebc79879ab84f973b3fc6e39b79d1741))
* update WaveformZoom when source changes ([f45c3b4](https://github.com/philharmoniedeparis/metascore-library/commit/f45c3b43624f4242747130d67f83ae8e27bec68f))

## [3.0.0-alpha.9](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.8...v3.0.0-alpha.9) (2023-01-17)


### Bug Fixes

* prevent width of right pane from jumping ([9cea986](https://github.com/philharmoniedeparis/metascore-library/commit/9cea986f00c3a5d61ca7d8cd078f2aebfebb2550))

## [3.0.0-alpha.8](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.7...v3.0.0-alpha.8) (2023-01-16)


### Bug Fixes

* allow clicking on blockly timecode field buttons ([cf675e8](https://github.com/philharmoniedeparis/metascore-library/commit/cf675e82d2a67641161dd6d79e7b92594e3db5f5)), closes [#583](https://github.com/philharmoniedeparis/metascore-library/issues/583)
* fix displaying contextmenu on Apple platforms ([2f93e2a](https://github.com/philharmoniedeparis/metascore-library/commit/2f93e2a8d420f79c0e98cb2ef8da3c3ed4b26d24)), closes [#581](https://github.com/philharmoniedeparis/metascore-library/issues/581)
* fix editor pane collapse on dblclick ([6fe8e7f](https://github.com/philharmoniedeparis/metascore-library/commit/6fe8e7f04cad32d5d9728a6fc886cc5df79a3bef)), closes [#582](https://github.com/philharmoniedeparis/metascore-library/issues/582)
* prevent text selection when expanding pane ([58a9788](https://github.com/philharmoniedeparis/metascore-library/commit/58a9788822634d790ba7715033d89aa7f8182ff9))

## [3.0.0-alpha.7](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.6...v3.0.0-alpha.7) (2023-01-14)


### Bug Fixes

* do not dim MediaSelector's border in preview mode ([797deb3](https://github.com/philharmoniedeparis/metascore-library/commit/797deb3d5e6c25acb91b75ef5c8a6884e10c3b5a))
* don't show intro on old revisions ([5e7eefa](https://github.com/philharmoniedeparis/metascore-library/commit/5e7eefafe3bc4c79158ed4e0fefeb5733f897268)), closes [#580](https://github.com/philharmoniedeparis/metascore-library/issues/580)
* improve modal forms styles ([9c1efb4](https://github.com/philharmoniedeparis/metascore-library/commit/9c1efb4c3f6acac2735945f57a7545e5502b903f))
* update hotkey dependency to fix hotkeys on Mac platforms ([9cc66f5](https://github.com/philharmoniedeparis/metascore-library/commit/9cc66f50e6580d69d1854ca5665758bfb41dbe66)), closes [#574](https://github.com/philharmoniedeparis/metascore-library/issues/574)

## [3.0.0-alpha.6](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.5...v3.0.0-alpha.6) (2023-01-13)


### Features

* add behaviors tip in CKEditor's link form ([b58cf50](https://github.com/philharmoniedeparis/metascore-library/commit/b58cf50b7d799d0856e1dbedef19b630a69c3a58)), closes [#569](https://github.com/philharmoniedeparis/metascore-library/issues/569)
* allow direct component model creation without having to re-specify the type ([b27c06e](https://github.com/philharmoniedeparis/metascore-library/commit/b27c06e40f3a54090473d28d8d2d992f36c22158))
* make module registration synchronous ([d741a0c](https://github.com/philharmoniedeparis/metascore-library/commit/d741a0c0c452b176cc9434bc31e4b90151b7e049))
* make the preview button conspicuous ([3add797](https://github.com/philharmoniedeparis/metascore-library/commit/3add797e2f9094edba070a7f55c0ba3a7f6c6022)), closes [#578](https://github.com/philharmoniedeparis/metascore-library/issues/578)
* trigger "then" of a behavior play link before actioning another one ([13554f2](https://github.com/philharmoniedeparis/metascore-library/commit/13554f228973e3b324524ef7cdf30cd6a018e8aa)), closes [#566](https://github.com/philharmoniedeparis/metascore-library/issues/566)
* use 'Cmd' for hotkeys in Apple platforms ([922626a](https://github.com/philharmoniedeparis/metascore-library/commit/922626a89e50539d7b5542f77e103c62272add3f)), closes [#574](https://github.com/philharmoniedeparis/metascore-library/issues/574)


### Bug Fixes

* disable most of the main menu in preview mode ([1f07816](https://github.com/philharmoniedeparis/metascore-library/commit/1f078160b3e494e767bd5bfef231d19da04db9c7))
* fix async functions which have no await ([208515d](https://github.com/philharmoniedeparis/metascore-library/commit/208515d74ca16b2c4d3361eb2144c7d5475b31f6))
* make cuepoint's startTime and endTime inclusive ([9cad36d](https://github.com/philharmoniedeparis/metascore-library/commit/9cad36d7110a159d5141b603011e754f36ac5ee9))
* prevent layout shifts when temporary toggling preview mode ([dc2a342](https://github.com/philharmoniedeparis/metascore-library/commit/dc2a34248975badd8b1be0ab1753c8e29da7e293)), closes [#574](https://github.com/philharmoniedeparis/metascore-library/issues/574)
* re-enable Controller buttons in edit mode ([3b6d8f0](https://github.com/philharmoniedeparis/metascore-library/commit/3b6d8f0dbb78c5ca0f7a2cb5a86e0d4b370a7fc8))
* use select field for Cursor's direction in ComponentForm ([2d9f7c3](https://github.com/philharmoniedeparis/metascore-library/commit/2d9f7c3396f388dfa05daee8c1d0796fef5a3e44))

## [3.0.0-alpha.5](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.4...v3.0.0-alpha.5) (2023-01-10)


### Features

* simplify CKEditor instantiation ([bd9ab0d](https://github.com/philharmoniedeparis/metascore-library/commit/bd9ab0df0c964b99f54a5fb84a9764af5bee853b))


### Bug Fixes

* fix HtmlControl's mode switch on component dblclick ([f2784a1](https://github.com/philharmoniedeparis/metascore-library/commit/f2784a126ee21d78c9e515c03031eb7c496259ca))
* fix undo/redo coalescence ([49d7386](https://github.com/philharmoniedeparis/metascore-library/commit/49d738632eca68920497741328491d11d26aadab))
* freeze Content components while editing text ([2ec2384](https://github.com/philharmoniedeparis/metascore-library/commit/2ec2384830567161f3253c5621fa863e2d58d5a4)), closes [#576](https://github.com/philharmoniedeparis/metascore-library/issues/576)
* improve scrollbars thumb color ([903868a](https://github.com/philharmoniedeparis/metascore-library/commit/903868acbb700d6e70487ddbc98f44d7da9066aa))

## [3.0.0-alpha.4](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.3...v3.0.0-alpha.4) (2023-01-06)


### Features

* add CSS class to save button ([265d61d](https://github.com/philharmoniedeparis/metascore-library/commit/265d61db8205caf8af64a2d82b19e50dab41695d))
* add Ctrl+S, Ctrl+Z and Ctrl+Y shortcuts ([f64a00c](https://github.com/philharmoniedeparis/metascore-library/commit/f64a00c7c6175522d94db4803f156483550f5681))
* add revert button in editor's main menu ([1678f78](https://github.com/philharmoniedeparis/metascore-library/commit/1678f78dc20dceee22e6412dc90c9ff50aa34ecd))
* alert about dirty data before loading a previous revision ([f67d114](https://github.com/philharmoniedeparis/metascore-library/commit/f67d11481e26ef52f099c1b50b41d081df744466))


### Bug Fixes

* clear dirty data and history upon loading ([bcc7091](https://github.com/philharmoniedeparis/metascore-library/commit/bcc7091700182e8aab1582793ce793415e17b291))

## [3.0.0-alpha.3](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2023-01-06)


### Features

* allow tab items to stay alive ([835ed80](https://github.com/philharmoniedeparis/metascore-library/commit/835ed808647dea99c7fb75903c8c3fa4834c1e37))
* group ComponentForm updates in history ([d1c83b6](https://github.com/philharmoniedeparis/metascore-library/commit/d1c83b67169cbb6cffb3287b60c1d13ddf5ee55b))
* improve history grouping ([ee8268a](https://github.com/philharmoniedeparis/metascore-library/commit/ee8268ac8409b2da42df0e38073f0064c649b2be))


### Bug Fixes

* clear ColorSwatches selection when no swatch matches current value ([ca1ae65](https://github.com/philharmoniedeparis/metascore-library/commit/ca1ae652bdcafa3212af86fa09c1ad6b98fde84c))
* emit HTMLControl value update on every data change event ([0298052](https://github.com/philharmoniedeparis/metascore-library/commit/0298052a8c1d572e8d209bfbbec60d9f1e54d1a8)), closes [#575](https://github.com/philharmoniedeparis/metascore-library/issues/575)
* ensure non-readonly data is sent in component update redo ([d5c25b1](https://github.com/philharmoniedeparis/metascore-library/commit/d5c25b11436dec456931399f4ae9ec2d651b33db))
* fix undo/redo grouping for componet drag and resize ([9751dcb](https://github.com/philharmoniedeparis/metascore-library/commit/9751dcbf6f368a003c7f3962604b29db86eed1c9))
* group undo/redo operations when adding a dropped component ([70eb2b8](https://github.com/philharmoniedeparis/metascore-library/commit/70eb2b8f9035c9c085bccdd8538c6180e786d07e))
* hide Blockly dropdowns when clicking in preview iframe ([333eeeb](https://github.com/philharmoniedeparis/metascore-library/commit/333eeeba62e76fcd0adcc5ffee5bd22565ac3c95))
* send rest arguments to super in component mixins ([032f62c](https://github.com/philharmoniedeparis/metascore-library/commit/032f62cabfc233e6c5ef20658672ee9a588f92c2))
* sort compoents in behavior dropdown ([f28ecf0](https://github.com/philharmoniedeparis/metascore-library/commit/f28ecf0ecf0da0e78f12d18995f738e7f61a8c39))

## [3.0.0-alpha.2](https://github.com/philharmoniedeparis/metascore-library/compare/v3.0.0-alpha.1...v3.0.0-alpha.2) (2023-01-04)


### Features

* add behaviors saving ([ee9271c](https://github.com/philharmoniedeparis/metascore-library/commit/ee9271cdfec5e82939346235b573cd1e452027ce))
* add behaviortrigger ckeditor custom plugin ([bdcb3ae](https://github.com/philharmoniedeparis/metascore-library/commit/bdcb3ae9201cb65c500edd4ce24c95696e905d1a))
* add breadcrumb to searchable behavior dropdowns ([4e44605](https://github.com/philharmoniedeparis/metascore-library/commit/4e4460550a89b59bccd1b87f52c4560d5cc25838))
* add buttons to timecode input in CKEditor link plugin ([0ac4de1](https://github.com/philharmoniedeparis/metascore-library/commit/0ac4de1bd722b38cbf308b0208e8bba203f6530c))
* add childrenProperty to Component models ([ef3b2d7](https://github.com/philharmoniedeparis/metascore-library/commit/ef3b2d71e0023fb2a69f841f24ba1b36982e5605))
* add clear button to BorderRadiusControl ([85a9786](https://github.com/philharmoniedeparis/metascore-library/commit/85a97860cec6ffe861b52fa7835de0a9ece12b1e))
* add clear button to ColorControl ([0c4a171](https://github.com/philharmoniedeparis/metascore-library/commit/0c4a171f0e11cbb710822fdf6ca9a8dcd0d83008))
* add colored border as type indicator in ComponentForm ([efc3a70](https://github.com/philharmoniedeparis/metascore-library/commit/efc3a70ae044d96c4d866b85446cf9ba25243493)), closes [#456](https://github.com/philharmoniedeparis/metascore-library/issues/456)
* add editor intro module ([2d8bc2c](https://github.com/philharmoniedeparis/metascore-library/commit/2d8bc2c8f3a3bc32b5e6f4470909f33d4bbc0f43)), closes [#481](https://github.com/philharmoniedeparis/metascore-library/issues/481)
* add excerpt link auto-highlighting ([ccb87aa](https://github.com/philharmoniedeparis/metascore-library/commit/ccb87aaa7afe6aa8ce7d2b46eb4bd9303f22e7c6))
* add fullscreen behavior blocks ([3b66a17](https://github.com/philharmoniedeparis/metascore-library/commit/3b66a17550214f2eb26e84e4c7ee74430c43515d))
* add get/set active block page behaviors ([167e6b5](https://github.com/philharmoniedeparis/metascore-library/commit/167e6b5d48a09c15ff7cc75a266af1e463f27a5e))
* add getComponentLabel to app_components module ([aaba767](https://github.com/philharmoniedeparis/metascore-library/commit/aaba767f2588701edb1b92d4731b3ad8a097a728))
* add icons to behavior_form component lists ([5d02d46](https://github.com/philharmoniedeparis/metascore-library/commit/5d02d46a1b29b6048909a05c86a5dd48e2fa00cf))
* add media_play_excerpt block mutation ([44b802b](https://github.com/philharmoniedeparis/metascore-library/commit/44b802b70405664fcac96b0c2ed126b2039f2224))
* add more heading options in CKEditor ([88a0dd4](https://github.com/philharmoniedeparis/metascore-library/commit/88a0dd44dd384923e75e2c393e8df5476466b8d4))
* add multi-value warning in ComponentForm ([546eb75](https://github.com/philharmoniedeparis/metascore-library/commit/546eb751da6b9c77372ad4c0d6cc7ece8dbb2e2c))
* add placeholder support to some form controls ([3bc39a0](https://github.com/philharmoniedeparis/metascore-library/commit/3bc39a041e93c90714f18d3c921d271cc63be88a))
* add placeholder to URL field in CKEditor link plugin ([bcf30cf](https://github.com/philharmoniedeparis/metascore-library/commit/bcf30cf28f23f29796de4b93a7f35d3ffcc0a3bc))
* add presets category in behaviors form ([a5ed519](https://github.com/philharmoniedeparis/metascore-library/commit/a5ed519802a9a0f8cc4f2bfadbbf1ec445d7437d))
* add searchability to behavior form dropdowns ([2d005d2](https://github.com/philharmoniedeparis/metascore-library/commit/2d005d21eef4cb9d8a9a2eed6419fc634367b507))
* add tooltips to TimeControl buttons ([4009e02](https://github.com/philharmoniedeparis/metascore-library/commit/4009e022e56c6a8d0fd86203966ce8fe52c474e2))
* add wheel scrolling to behaviors workspace ([fd95294](https://github.com/philharmoniedeparis/metascore-library/commit/fd95294f46d254ca33744eec31483c7c5a885e93)), closes [#551](https://github.com/philharmoniedeparis/metascore-library/issues/551)
* adjust blockly's context menu style ([7f4ad26](https://github.com/philharmoniedeparis/metascore-library/commit/7f4ad26c15cb8467b212373fa3ddebbe13a396be))
* allow "dir" attribute in CKEditor ([e28becd](https://github.com/philharmoniedeparis/metascore-library/commit/e28becd01d1f4db9a7cfb0581419627ea7458b28))
* allow adding new i18n messages outside of vue components ([fd72448](https://github.com/philharmoniedeparis/metascore-library/commit/fd72448f06227f165ebb7b35c62a260361c988d1))
* allow multiple history groups ([6ccc998](https://github.com/philharmoniedeparis/metascore-library/commit/6ccc998603dc084b22f8f448908bc28708bee846))
* allow number fields in media blocks ([fb013fa](https://github.com/philharmoniedeparis/metascore-library/commit/fb013fa4e0290c0dd3193848d05fc0467c899e74))
* allow resizing timeline tracks without having to select them ([d3099b0](https://github.com/philharmoniedeparis/metascore-library/commit/d3099b06619807e39c21407c91335f9128c787b3))
* allow unsubscribing store actions ([1d27303](https://github.com/philharmoniedeparis/metascore-library/commit/1d27303c1f4cf03f18ab98b1f4031055bdb73c15))
* allow using Scenario components in behaviors ([8ac6df2](https://github.com/philharmoniedeparis/metascore-library/commit/8ac6df20a656c613d57a897ccd6effcbb2993e1e))
* animate intro tooltip arrow ([50486ba](https://github.com/philharmoniedeparis/metascore-library/commit/50486ba1ded51b7bc39a5dbb75355203b5902e25))
* auto focus app when switching to preview mode ([d472da4](https://github.com/philharmoniedeparis/metascore-library/commit/d472da4032e59dcdf6021888d86ae665cab8ea75))
* auto-create a scenario if none available ([047ba6f](https://github.com/philharmoniedeparis/metascore-library/commit/047ba6f92a6eb8ce339be6b638e055b9dcc2ea84))
* auto-expand behaviors form ([46f3f7b](https://github.com/philharmoniedeparis/metascore-library/commit/46f3f7ba18691db463107fec72fc1fd825e94bcd))
* decrease opacity of disabled form groups ([538076d](https://github.com/philharmoniedeparis/metascore-library/commit/538076d34d253a9a948e553a224e181a6dc9a670)), closes [#352](https://github.com/philharmoniedeparis/metascore-library/issues/352)
* diabled Controller and BlockToggler buttons in edit mode ([884ecfc](https://github.com/philharmoniedeparis/metascore-library/commit/884ecfcf11896206ac053e5da0ae5d09501512ae))
* display messages when new media source duration differs from old one ([83f0ce1](https://github.com/philharmoniedeparis/metascore-library/commit/83f0ce11148e93d940d55d64233ba559490ce093))
* do not truncate active tab label ([befe9ae](https://github.com/philharmoniedeparis/metascore-library/commit/befe9aee02f58ce10960a6bc0ca0ed5e60f06329))
* fill some blockly inputs with generic values ([3e43af8](https://github.com/philharmoniedeparis/metascore-library/commit/3e43af83accffc37e7199c282ef2254c514d744f))
* implement "add page before/after" context menu items ([dc32b14](https://github.com/philharmoniedeparis/metascore-library/commit/dc32b140cd160fa486bee10c0bc2fa6b9616cc8d)), closes [#542](https://github.com/philharmoniedeparis/metascore-library/issues/542)
* implement component copy/cut/paste ([6f19c87](https://github.com/philharmoniedeparis/metascore-library/commit/6f19c87303a3cd6acd31394c579493c3a417453a)), closes [#528](https://github.com/philharmoniedeparis/metascore-library/issues/528)
* implement ctrl+d shortcut ([4591037](https://github.com/philharmoniedeparis/metascore-library/commit/4591037204a5cffaf8c18a94423962afc2cfaa11))
* implement links_click behavior options ([ce0ef55](https://github.com/philharmoniedeparis/metascore-library/commit/ce0ef5577bd82e157fbb34d68c6ce2859603cfdd))
* implement more component behavior blocks ([6c3b0d7](https://github.com/philharmoniedeparis/metascore-library/commit/6c3b0d76d83a697775f2ae19a21b951bba1c4327))
* implement player API ([51cd068](https://github.com/philharmoniedeparis/metascore-library/commit/51cd0685c3ceeea757f950a45711ffce0b00bbbb))
* implement the "page" component action ([23e7387](https://github.com/philharmoniedeparis/metascore-library/commit/23e7387251e88e9a08e579158ba5be8fed8d3fba))
* implement TimeControl button actions ([ac59592](https://github.com/philharmoniedeparis/metascore-library/commit/ac59592f78613237a35a5fa46eb8f3ec40c50634))
* improve Controller buttons styles ([95a10a1](https://github.com/philharmoniedeparis/metascore-library/commit/95a10a1e673c37beed2a67d99163d48d4374336f))
* improve label of components_get_block_page blockly block ([25bb142](https://github.com/philharmoniedeparis/metascore-library/commit/25bb142c4607d437603a555341d521f01200bf4b)), closes [#549](https://github.com/philharmoniedeparis/metascore-library/issues/549)
* improve text and keyframes editing indicators ([3c2a863](https://github.com/philharmoniedeparis/metascore-library/commit/3c2a863952835019d86f4bc154178d241627264a)), closes [#572](https://github.com/philharmoniedeparis/metascore-library/issues/572)
* improve the handling of component overrides ([16cd8ee](https://github.com/philharmoniedeparis/metascore-library/commit/16cd8eec826a88097709759b9473e5de0cfea645))
* limit BehaviorsForm max zoom ([9477e2f](https://github.com/philharmoniedeparis/metascore-library/commit/9477e2fca7a7d85d98673024d20cf3bec8146aa9))
* move i18n to a service ([fc26477](https://github.com/philharmoniedeparis/metascore-library/commit/fc264772997438ae90dbd0a7438f3be33b4b5199))
* move some data coercion to models ([949ddce](https://github.com/philharmoniedeparis/metascore-library/commit/949ddce8fcc8dce71310c0570a409d4ab6e14474))
* move time related blockly blocks to separate category ([e536ba4](https://github.com/philharmoniedeparis/metascore-library/commit/e536ba4becab72da938859d29e222e257bd39a93))
* only run behaviors in player and preview mode ([7ef50e2](https://github.com/philharmoniedeparis/metascore-library/commit/7ef50e2f41e8bdbe74a34dcb09905b34252552df))
* prefill id field for behavior trigger links ([a515ff9](https://github.com/philharmoniedeparis/metascore-library/commit/a515ff958b74129adecb1ce8f14d65d40fbdc108))
* prevent type dropdown from being truncated in CKEditor link plugin ([c1a302b](https://github.com/philharmoniedeparis/metascore-library/commit/c1a302b7a037cd2e74280a5c8f72fb1205184dab))
* remove CKEditor Style plugin ([fe41eb2](https://github.com/philharmoniedeparis/metascore-library/commit/fe41eb2fd67e0e026f39ee8975a923873e8b0dc8))
* remove text attribute from component behavior blocks ([37b9eee](https://github.com/philharmoniedeparis/metascore-library/commit/37b9eeef7a914928c823011d3c8f870d92d46c7a))
* reorganize behavior blocks ([e6493bc](https://github.com/philharmoniedeparis/metascore-library/commit/e6493bcc205f74bb9a31dea9d1f59dd566a76942))
* replace blockly mutator UI with +/- buttons ([8444ef7](https://github.com/philharmoniedeparis/metascore-library/commit/8444ef76c7ceaa1bfbbf0e64ba7c45ac7a28cd3c))
* replace components_click with links_click in BehaviorsForm preset ([c81c34a](https://github.com/philharmoniedeparis/metascore-library/commit/c81c34af6ea4eb0ead61e23ae929c80b1d7b381d))
* replace hooks with events for better scalability ([ac253da](https://github.com/philharmoniedeparis/metascore-library/commit/ac253dab03d362e94f8be60d32e704b6222f9bb3))
* replace specific behavior action blocks by presets ([d510b65](https://github.com/philharmoniedeparis/metascore-library/commit/d510b6535f864ace434eff24ceb08117dbf19b49))
* reset component toggles when exiting preview mode ([192cb73](https://github.com/philharmoniedeparis/metascore-library/commit/192cb73a2d33ca7dcd9a717bda7b2a7960ade523))
* set pointer cursor to components with click behavior ([dde7330](https://github.com/philharmoniedeparis/metascore-library/commit/dde7330a38f4c412e743e14d2c8f36751bb13ae2))
* setup auto-highlighting for play links ([32684b4](https://github.com/philharmoniedeparis/metascore-library/commit/32684b4debba02faa8b6b83878db07434ce5c379))
* show app after CSS has loaded ([0a711c2](https://github.com/philharmoniedeparis/metascore-library/commit/0a711c2942d75b2d2ca4c25a0983e4c752a05f49)), closes [#431](https://github.com/philharmoniedeparis/metascore-library/issues/431)
* start editing html on component double click ([3d91cfb](https://github.com/philharmoniedeparis/metascore-library/commit/3d91cfbc7dbb2b8bc61361750d71cf6626382e1c)), closes [#546](https://github.com/philharmoniedeparis/metascore-library/issues/546)
* start migrating custom ckeditor links plugin ([316902b](https://github.com/philharmoniedeparis/metascore-library/commit/316902b81030d905a1337127fa9b0fa2d0901138))
* transform ajax's load to an async function ([2b6778a](https://github.com/philharmoniedeparis/metascore-library/commit/2b6778aec72f91504fd5c2bdc02d67a8ea65fdd2))
* use timecode fields for blockly media time values ([ad31eee](https://github.com/philharmoniedeparis/metascore-library/commit/ad31eeebae400a362c91c966892c7e44c81a4a18))


### Bug Fixes

* adapt FieldEnhancedDropdown to changes in blockly 9.1.x ([5a83c40](https://github.com/philharmoniedeparis/metascore-library/commit/5a83c4042d5462d55e7d9e4ff6a2efdeffd05405))
* add "content-type" header to "restore" api call ([8641df1](https://github.com/philharmoniedeparis/metascore-library/commit/8641df10c7c78bfb5ea498559ddb6240feab8b06))
* add check to querySelector retrned value ([25d72fb](https://github.com/philharmoniedeparis/metascore-library/commit/25d72fb182c105ecd4723adfd56ef81e3ca7cd37))
* add highlight css to behavior-trigger selection ([0d8d6cc](https://github.com/philharmoniedeparis/metascore-library/commit/0d8d6ccaded0046f36ac2fb7b98636787411d58f))
* add HTML attributes to components for backward compatibility ([75c1ff1](https://github.com/philharmoniedeparis/metascore-library/commit/75c1ff185b908829b95a1afcce4b5483ed1a2857))
* add missing media_timecode blockly generator ([24103e9](https://github.com/philharmoniedeparis/metascore-library/commit/24103e90784d5436f74aeac1941a1c312ca5eacc))
* add setActiveScenario in AppRenderer ([c73e344](https://github.com/philharmoniedeparis/metascore-library/commit/c73e3440330900d27b35b3fcf4edb3a4e9f45a5a))
* add type attribute to non-submit buttons ([0bcdfa3](https://github.com/philharmoniedeparis/metascore-library/commit/0bcdfa321c6dce60d831174199cea8925332b853)), closes [#548](https://github.com/philharmoniedeparis/metascore-library/issues/548)
* adjust page times of a synched blocs when deleting a page ([3a27626](https://github.com/philharmoniedeparis/metascore-library/commit/3a2762691be0b77a4fd2772aa531f237f00a2fa1)), closes [#558](https://github.com/philharmoniedeparis/metascore-library/issues/558)
* adjust style of content links ([03d5aec](https://github.com/philharmoniedeparis/metascore-library/commit/03d5aece4679d99838a560e1c8d8c5664c428b40)), closes [#545](https://github.com/philharmoniedeparis/metascore-library/issues/545)
* allow 1x1 components ([284c525](https://github.com/philharmoniedeparis/metascore-library/commit/284c52588c4f0b44cf705ec1f29d9ec79917999b))
* allow editing ColorControl and BorderRadiusControl input values ([8696cb5](https://github.com/philharmoniedeparis/metascore-library/commit/8696cb51b9614c4c46b78c6907a0e835ee825c5e))
* allow entering fullscreen in preview mode ([6d682f9](https://github.com/philharmoniedeparis/metascore-library/commit/6d682f913fcea31ec5696634c65881a808aa50b7))
* allow intro-tour to call its beforeUnmount hook ([4767a4f](https://github.com/philharmoniedeparis/metascore-library/commit/4767a4f1aca48a0783bcb428041888c5f0200980))
* allow null values in blockly timecode field ([7e0bb71](https://github.com/philharmoniedeparis/metascore-library/commit/7e0bb7122fd76bcd2266620fa32b036a22897ee2))
* center app in player ([59b9e95](https://github.com/philharmoniedeparis/metascore-library/commit/59b9e957c456641cf0300be6d9dc72555acd6b03))
* clear auto-save timeout after saving ([d1b467b](https://github.com/philharmoniedeparis/metascore-library/commit/d1b467b26b75e1558e2b6a219ae9f9ca748a938f))
* close HtmlControl edit mode when switching to preview ([dfd7c8b](https://github.com/philharmoniedeparis/metascore-library/commit/dfd7c8b6e18bc325b347f3c1b8b1f8b66db29b56))
* correctly handle Animation w/ no color paths ([d8115a4](https://github.com/philharmoniedeparis/metascore-library/commit/d8115a483a357710a1490460bde747447bebd6cc))
* correctly handle BorderRadiusControl null values ([b2ad13b](https://github.com/philharmoniedeparis/metascore-library/commit/b2ad13b565938cac93550e3dcacece1894586cfe))
* correctly handle deleted components on denormalization ([365d290](https://github.com/philharmoniedeparis/metascore-library/commit/365d290bce78b1f95564487e87dd2e102b3ff274)), closes [#527](https://github.com/philharmoniedeparis/metascore-library/issues/527)
* correctly handle html control value updates ([b5194e5](https://github.com/philharmoniedeparis/metascore-library/commit/b5194e56308864c7ff86000953d8e0b2c7c9224b))
* correctly handle null values in play excerpt links ([bbe4a20](https://github.com/philharmoniedeparis/metascore-library/commit/bbe4a20579fd5c1b4464d647beda269c70bced38))
* correctly handle track resizing when end- or start-time is null ([f316d5c](https://github.com/philharmoniedeparis/metascore-library/commit/f316d5cbfdb9d4d5cc51973ce4a54ab1c348503b)), closes [#524](https://github.com/philharmoniedeparis/metascore-library/issues/524)
* correctly handle width and height changes ([7ad22fa](https://github.com/philharmoniedeparis/metascore-library/commit/7ad22fa979d01ff5fff69d5042d854ed00e09a20)), closes [#553](https://github.com/philharmoniedeparis/metascore-library/issues/553)
* disable BaseModel teleporting when target is not set ([568960c](https://github.com/philharmoniedeparis/metascore-library/commit/568960c896ff3d5e765aba5d7e2d28e702731df9))
* disable content links in editor mode ([373f0c4](https://github.com/philharmoniedeparis/metascore-library/commit/373f0c44c6eafc3b85f76e215de2e66f856f875b))
* don't allow null values for border-width ([b1e7168](https://github.com/philharmoniedeparis/metascore-library/commit/b1e716865b3b603354817d0c462c04346ed99b24)), closes [#552](https://github.com/philharmoniedeparis/metascore-library/issues/552)
* don't decode 204 ajax responses ([87afeb3](https://github.com/philharmoniedeparis/metascore-library/commit/87afeb399126fd25d76956d42892458dd1ed1ffb))
* don't open content links that don't have a url ([fe49085](https://github.com/philharmoniedeparis/metascore-library/commit/fe490856354238010f502e75061e3cebdb509cf7)), closes [#526](https://github.com/philharmoniedeparis/metascore-library/issues/526)
* don't round null value in TimeControl ([d6d21cb](https://github.com/philharmoniedeparis/metascore-library/commit/d6d21cb88f1aea2624128324e4b98d35e008d095))
* don't stop component click propagation in preview mode ([51b918e](https://github.com/philharmoniedeparis/metascore-library/commit/51b918ed5ddbe0f8a3b251410ec21c98054fda30))
* fix a typo ([e800935](https://github.com/philharmoniedeparis/metascore-library/commit/e800935fb220779122fd47148ba8e2d093baddbd))
* fix a typo in the media_play behavior block ([c21a16f](https://github.com/philharmoniedeparis/metascore-library/commit/c21a16f8b6ad72ab5b17cb888facb7438a54c851)), closes [#532](https://github.com/philharmoniedeparis/metascore-library/issues/532)
* fix assets disappearing on save ([fdec9c5](https://github.com/philharmoniedeparis/metascore-library/commit/fdec9c5dc7839cb9fb879419872c0654c332502f)), closes [#529](https://github.com/philharmoniedeparis/metascore-library/issues/529)
* fix behaviorTrigger CKEditor attribute conversion ([d724f4a](https://github.com/philharmoniedeparis/metascore-library/commit/d724f4a856a05fe2b22402b0430108eb4376d73e))
* fix block pager buttons style ([54ef5b9](https://github.com/philharmoniedeparis/metascore-library/commit/54ef5b9c110dfcc1e25b5d8938d68a661d173171))
* fix blockly timecode field styles ([a731bd8](https://github.com/philharmoniedeparis/metascore-library/commit/a731bd8d6754b70f4d0ca18f829606097488c877))
* fix BlockToggler blocs selection ([757a50d](https://github.com/philharmoniedeparis/metascore-library/commit/757a50d4136341314e6b0723a6d6d89e775ae5a8))
* fix bug in CKEditor link plugin's position update ([50ba880](https://github.com/philharmoniedeparis/metascore-library/commit/50ba88087bfbc6408b2a8c64c200772da71c1145))
* fix bug in component selection ([a50303b](https://github.com/philharmoniedeparis/metascore-library/commit/a50303bf677b1ba04b26e26c5e5665dbfc5618d0)), closes [#527](https://github.com/philharmoniedeparis/metascore-library/issues/527)
* fix bug when adding first child component ([fe4409a](https://github.com/philharmoniedeparis/metascore-library/commit/fe4409affd82e3f5252c5a91617e8c887200b622)), closes [#521](https://github.com/philharmoniedeparis/metascore-library/issues/521)
* fix bug when deleting block ([58421be](https://github.com/philharmoniedeparis/metascore-library/commit/58421be4e2546ffc4affb5eb81b916ccb67a8e10))
* fix compnent toggling ([6a2cc40](https://github.com/philharmoniedeparis/metascore-library/commit/6a2cc40d18d3d88918db3bea636cf26f4c3f7704))
* fix component drag and drop in Chrome ([e1ac062](https://github.com/philharmoniedeparis/metascore-library/commit/e1ac062507e613465f570add07542c535faba9a2))
* fix component rearrangement by contextmenu ([4f8f47b](https://github.com/philharmoniedeparis/metascore-library/commit/4f8f47b1ca6252f937238de2b25a3497ba921c5c)), closes [#531](https://github.com/philharmoniedeparis/metascore-library/issues/531)
* fix component update start- and end-time processing ([688e0d2](https://github.com/philharmoniedeparis/metascore-library/commit/688e0d23250235687d2d7cf528e40d8576f37034))
* fix ComponentForm colors field translation ([c77f90f](https://github.com/philharmoniedeparis/metascore-library/commit/c77f90f59846c9c48453c37cbc12c076d26e68b2))
* fix ComponentWrapper page "delete" context menu callback ([f0384f9](https://github.com/philharmoniedeparis/metascore-library/commit/f0384f956438b07eb2602c91ddbc4916729cab55))
* fix Controller timer zero padding ([36ed92d](https://github.com/philharmoniedeparis/metascore-library/commit/36ed92d93e1b25d9803e5684b9a5716aa16b6e0a))
* fix cuepoint onSeekout handling ([1eaa41a](https://github.com/philharmoniedeparis/metascore-library/commit/1eaa41a2dbb42cecbc39573af131806613c9f7da))
* fix Cursor component model schema ([6bb2663](https://github.com/philharmoniedeparis/metascore-library/commit/6bb2663a47c931ce43966c8246563057d7d342e6))
* fix CursorComponent canvas position ([9f59f9d](https://github.com/philharmoniedeparis/metascore-library/commit/9f59f9dca46e935e2964274d51b82597a6434ff8))
* fix data handling in modal forms ([a496c98](https://github.com/philharmoniedeparis/metascore-library/commit/a496c989b8f0cc8f451238eab5849e22ff35d68f))
* fix deprecated use of  blockly's Css.register ([d2102e1](https://github.com/philharmoniedeparis/metascore-library/commit/d2102e13d18035f9639326959705ad460e91182a))
* fix fullscreen toggling ([8a89921](https://github.com/philharmoniedeparis/metascore-library/commit/8a8992119834fb7784d5a12ff4795144d4fc6592))
* fix handling of pages' min and max values ([926ed66](https://github.com/philharmoniedeparis/metascore-library/commit/926ed665d2b58c1c2e68035977066fa976cc6aea))
* fix handling reactive variable values in blockly ([5dd28f6](https://github.com/philharmoniedeparis/metascore-library/commit/5dd28f6006ffa1c0a25c5cabfda70ff8b9848917))
* fix intro highlight repositioning ([3f6c049](https://github.com/philharmoniedeparis/metascore-library/commit/3f6c0493b626f88a5e752ff5c8abe973c3f6bd2c))
* fix intro tooltip arrow placement ([2fafd6c](https://github.com/philharmoniedeparis/metascore-library/commit/2fafd6cf66773f8469283314faf4c76ee77f6105))
* fix loading blockly workspace ([b592886](https://github.com/philharmoniedeparis/metascore-library/commit/b592886cfdae8e55ce3fe5bd6d50068059fec08c))
* fix minor CSS bugs ([c37471f](https://github.com/philharmoniedeparis/metascore-library/commit/c37471fda126f1f60c903b520504e3b8cb4bd6ad))
* fix rendering of selected option in behavior dropdowns ([cacbc59](https://github.com/philharmoniedeparis/metascore-library/commit/cacbc597c6ce6bbc59b8420be4e31e14bb738063))
* fix scenario cloning ([9e799b2](https://github.com/philharmoniedeparis/metascore-library/commit/9e799b2fa057e54f0840816a10e8334f433c0876))
* fix scenario deletion ([dfe7a02](https://github.com/philharmoniedeparis/metascore-library/commit/dfe7a0229c3e1e47431ebea500531ea1d71734d7))
* fix scenario link parsing ([53579d9](https://github.com/philharmoniedeparis/metascore-library/commit/53579d981a81c3d3e4a1de24b8e515854e5c9f36))
* fix some typos ([b3e802b](https://github.com/philharmoniedeparis/metascore-library/commit/b3e802b6ce86853cf6699fcf5a2b6f34ac886704))
* fix state handling of component behavior blocks ([99b51e0](https://github.com/philharmoniedeparis/metascore-library/commit/99b51e0c123361f4cb1a34e802e155b610ccdca2))
* fix SVG asset drag'n'drop from library ([de60134](https://github.com/philharmoniedeparis/metascore-library/commit/de60134516fc3ca716487c896996bb42d7e1e8a8)), closes [#561](https://github.com/philharmoniedeparis/metascore-library/issues/561)
* fix tab overflow ([51fb85e](https://github.com/philharmoniedeparis/metascore-library/commit/51fb85eb0df181f59ea7a1f484d7c4ae29509d03))
* fix timeline track sorting ([b1df0d1](https://github.com/philharmoniedeparis/metascore-library/commit/b1df0d109fa22f029dcd5aa6a15156b06f9c61fe)), closes [#525](https://github.com/philharmoniedeparis/metascore-library/issues/525)
* fix typo ([e35642d](https://github.com/philharmoniedeparis/metascore-library/commit/e35642dbf72eedb358db318c861dcb24f2845db2))
* force CKEditor to update element on destroy ([54f03a8](https://github.com/philharmoniedeparis/metascore-library/commit/54f03a87f3bc783fd948f58a1ac6a1888db52ea9))
* force focused timecode input buttons in CKEditor link plugin to show above other input buttons ([be592fa](https://github.com/philharmoniedeparis/metascore-library/commit/be592fafeef3c83e731e7c03e1c76a3acefcd457))
* force hex format for AudiowaveformForm colors ([20a58b8](https://github.com/philharmoniedeparis/metascore-library/commit/20a58b867b430fa3efcf1b7fee0cb5b867c80caa))
* group component resizing history ([804e8c2](https://github.com/philharmoniedeparis/metascore-library/commit/804e8c27b37f983a68a8a109834ec111de572fa6))
* group multi-component delete history ([c41d101](https://github.com/philharmoniedeparis/metascore-library/commit/c41d101dbcdb92a5b969e4e1f56685dd8e36c16d))
* hide Blockly dropdowns when clicking outside the BehaviorsForm ([b50522d](https://github.com/philharmoniedeparis/metascore-library/commit/b50522d9c2e465642155f19850d603e5835c72b9))
* hide libraries and forms panes in preview mode ([4be6611](https://github.com/philharmoniedeparis/metascore-library/commit/4be661135c9e893a4e47d25a3eb5d0fe7e4cd197))
* improve AssetsLibrary progress indicators ([14a104b](https://github.com/philharmoniedeparis/metascore-library/commit/14a104b4531a6ea96609aff45755e0353956d65c))
* improve CKEditor link plugin value updating ([a2fcc97](https://github.com/philharmoniedeparis/metascore-library/commit/a2fcc975ab6d3e929dfaa98e1639c45884381bad))
* improve component text source editing ([67f43e9](https://github.com/philharmoniedeparis/metascore-library/commit/67f43e96b6cc7a7b5789bd6a7209a2fa6beb6f30)), closes [#538](https://github.com/philharmoniedeparis/metascore-library/issues/538)
* improve component timeline track style ([510a6ed](https://github.com/philharmoniedeparis/metascore-library/commit/510a6edc2cf3323977681fc5d2416a624b6bd247))
* improve context menu styles ([4036f60](https://github.com/philharmoniedeparis/metascore-library/commit/4036f602b8f7c71152978c9778d5d2846fcbeb3a))
* improve default values in CKEditor link plugin ([9bb99f8](https://github.com/philharmoniedeparis/metascore-library/commit/9bb99f83a6ce1571f934ebb5e9c917acd0caddfb))
* improve link styles in editor ([42f6328](https://github.com/philharmoniedeparis/metascore-library/commit/42f63282624d8e77a8e1ff25414a23950667df3f))
* improve media_play_excerpt block auto-highlight tooltip ([dad0251](https://github.com/philharmoniedeparis/metascore-library/commit/dad025195e56b4fb7d6e652aba7bfb3a2729cc29))
* improve timecode input styles ([91b669c](https://github.com/philharmoniedeparis/metascore-library/commit/91b669c26ee55e96901d282fd6d3306fd98c9426))
* improve timeline loading ([839f15d](https://github.com/philharmoniedeparis/metascore-library/commit/839f15d299366d46819e6d1971180f46540df342))
* improve wording in click behavior blocks ([80bcdf2](https://github.com/philharmoniedeparis/metascore-library/commit/80bcdf2d3383cde3e46791de5b2c5d0392e717dc)), closes [#523](https://github.com/philharmoniedeparis/metascore-library/issues/523)
* instantiate errors when throwing ([8febdaa](https://github.com/philharmoniedeparis/metascore-library/commit/8febdaa97019c240de63ce8c4d1cb85a2703e294))
* make app_behavior component dropdowns dynamic ([11d5187](https://github.com/philharmoniedeparis/metascore-library/commit/11d5187b935afc035f5c6a9eddad8ee0f270631a))
* make assets upload indicator more visible ([2a494c8](https://github.com/philharmoniedeparis/metascore-library/commit/2a494c8b7d622587bda884e8b846ac16bc5e1648))
* make CKEditor work in Chrome by downgrading it to v.34 ([4fbae36](https://github.com/philharmoniedeparis/metascore-library/commit/4fbae361f1b3806e38dacef02296a15b94d8e2b4))
* make links in intro tooltips open in new window/tab ([678a91a](https://github.com/philharmoniedeparis/metascore-library/commit/678a91ae96a735db74a2a0f422225e6cf1158e49))
* mark some methods as async ([5a45b3a](https://github.com/philharmoniedeparis/metascore-library/commit/5a45b3ac2842634e5d7b7a0952b37730671c961f))
* move component id generation to model ([6205e95](https://github.com/philharmoniedeparis/metascore-library/commit/6205e951c8ccf7db54f7d0953c033b699a2059fb))
* move some component styles to model defaults ([5a3675d](https://github.com/philharmoniedeparis/metascore-library/commit/5a3675d1b663b2d916f33352cbbbd33491ef967d))
* only add target and rel attributes to links with href ([b929219](https://github.com/philharmoniedeparis/metascore-library/commit/b9292193ed5f8db9e453a5457b5e1a3fda9bc66a))
* only render currently active scenario ([1ee2933](https://github.com/philharmoniedeparis/metascore-library/commit/1ee2933ff1b80529fb97238ae7ad152ccb84393b))
* patch interact.js is.element to workaround an issue in Chrome ([81226b2](https://github.com/philharmoniedeparis/metascore-library/commit/81226b28aaec632229cd46e442ad89a356c817a3))
* persist behaviors workspace scroll and scale ([6927ee9](https://github.com/philharmoniedeparis/metascore-library/commit/6927ee93ed9577af023c4dba1198126e7e96ecb1))
* prevent behaviors pane from overflowing to the right ([12086ee](https://github.com/philharmoniedeparis/metascore-library/commit/12086ee12ef6f61d7d707fc52f1adeaa62b25290))
* prevent deleting used assets ([c2a1f16](https://github.com/philharmoniedeparis/metascore-library/commit/c2a1f1629ed1e28e7eb2bad535eadc421f09a114)), closes [#555](https://github.com/philharmoniedeparis/metascore-library/issues/555)
* prevent dragging & resizing locked components ([66083af](https://github.com/philharmoniedeparis/metascore-library/commit/66083af25007bb38499cdcf91ddf3c792044e24c)), closes [#547](https://github.com/philharmoniedeparis/metascore-library/issues/547)
* prevent editing text in preview mode ([614b6e7](https://github.com/philharmoniedeparis/metascore-library/commit/614b6e7761c81838e3d43af56ed553fa8d4642e6)), closes [#571](https://github.com/philharmoniedeparis/metascore-library/issues/571)
* prevent layout shifts in CKEditor editable area ([75efe63](https://github.com/philharmoniedeparis/metascore-library/commit/75efe63d1d903a46e83f6a4d0c1531dccef3c898))
* prevent repeatedly triggering some hotkeys ([54f6cf2](https://github.com/philharmoniedeparis/metascore-library/commit/54f6cf241748610f6a48f160166ebcc06158697a)), closes [#563](https://github.com/philharmoniedeparis/metascore-library/issues/563)
* prevent setting start- and end-time values of non-synched pages ([663f6cf](https://github.com/philharmoniedeparis/metascore-library/commit/663f6cf2e2e82fb8230d49c251ecbbc7d721a2b0)), closes [#534](https://github.com/philharmoniedeparis/metascore-library/issues/534)
* prevent SharedAssetsItem caption overflow ([5d4540a](https://github.com/philharmoniedeparis/metascore-library/commit/5d4540a155429c71dab1fd76e35cd744fe23b40a))
* prevent showing default context menu when blockly's menu is shown ([36932b0](https://github.com/philharmoniedeparis/metascore-library/commit/36932b0619af5346f0812c1fd6d261976012b3df))
* prevent submit handler altering model data in AudiowaveformForm and SpectrogramForm ([7f5ce00](https://github.com/philharmoniedeparis/metascore-library/commit/7f5ce00226a71757933a696a268a7afda77a46d9))
* prevent timeline tracks from appearing behind handles ([beff632](https://github.com/philharmoniedeparis/metascore-library/commit/beff6323539b813e492a8c21ba8509e1277d3ba8))
* readd dirty warning before unload ([58e8f43](https://github.com/philharmoniedeparis/metascore-library/commit/58e8f43fd404d27ff45d10421457602fa41548e0))
* reduce padding in behavior dropdowns search input ([3db8ab4](https://github.com/philharmoniedeparis/metascore-library/commit/3db8ab443093293e8d04bbceffa8bc5e4981e28e))
* remove app_behaviors dependency from app_renderer ([7ebb2ed](https://github.com/philharmoniedeparis/metascore-library/commit/7ebb2ed255662e86203aea76d162635196bf5b20))
* remove clear button in timecode input for seek links ([1d3b4fe](https://github.com/philharmoniedeparis/metascore-library/commit/1d3b4feae520ae74b09a305148825eb211ebe618))
* remove HtmlControl dblclick listener on unmount ([8e4b8cf](https://github.com/philharmoniedeparis/metascore-library/commit/8e4b8cf83a5990c3ee77bbd2cce4ff48e508dd86))
* remove improper uses of keep-alive ([70c0193](https://github.com/philharmoniedeparis/metascore-library/commit/70c019350bac0f7a42b0c20977846ed001ab6498))
* remove previous cuepoint before activating a new one ([2c80c24](https://github.com/philharmoniedeparis/metascore-library/commit/2c80c24dd59c522bb3b251971d1e1f5bafbd8098)), closes [#554](https://github.com/philharmoniedeparis/metascore-library/issues/554)
* remove redundant code scenario change on deletion ([94c32a4](https://github.com/philharmoniedeparis/metascore-library/commit/94c32a4974c023f728533dc5aad4503e0607d839))
* remove selection check for the addBehaviorTrigger command ([6052351](https://github.com/philharmoniedeparis/metascore-library/commit/6052351430a23778186c3d9d14144892671ecc0f))
* remove timeline track resize handles when n/a ([9f28dea](https://github.com/philharmoniedeparis/metascore-library/commit/9f28dea32e4babebea8a73b7ea2a814453a2f0a2))
* remove unused argument to CKEditor create ([66f4b9e](https://github.com/philharmoniedeparis/metascore-library/commit/66f4b9e7a16743f70ad6e0f0a19618501c6ec404))
* replace CKEditor font size presets by numeric values ([2c21b27](https://github.com/philharmoniedeparis/metascore-library/commit/2c21b27bc990779533163f1fa4ff4b148893e084))
* replace usage of deprecated ::v-deep by :deep ([747924a](https://github.com/philharmoniedeparis/metascore-library/commit/747924a694498a849b89028c0cf9f1a2aee655b9))
* replace use of non-standard CSS properties ([470591f](https://github.com/philharmoniedeparis/metascore-library/commit/470591fd268d80d53db352403f1d49cc5c1a72c5))
* restore snapping in ComponentTrack and AppPreview ([fcc869f](https://github.com/philharmoniedeparis/metascore-library/commit/fcc869fab4e041fcc5a55fff7b2da67c6d85ab7b)), closes [#556](https://github.com/philharmoniedeparis/metascore-library/issues/556)
* restrict component dragging ([ebdba9d](https://github.com/philharmoniedeparis/metascore-library/commit/ebdba9d971e2f60390bdf781ec6f1178a81f614c)), closes [#535](https://github.com/philharmoniedeparis/metascore-library/issues/535)
* reverse waveform zoom controls ([0cbd23f](https://github.com/philharmoniedeparis/metascore-library/commit/0cbd23fc409f6c21889bfb976c918e45476f2331)), closes [#544](https://github.com/philharmoniedeparis/metascore-library/issues/544)
* round all TimeControl value ([8a27cc5](https://github.com/philharmoniedeparis/metascore-library/commit/8a27cc5396f854d50366a04f364e6a4c19e6ee1e))
* round blockly media_timecode field values ([b3911fe](https://github.com/philharmoniedeparis/metascore-library/commit/b3911fe9089031ace05528e456c877fe407481b5))
* round component position values on resize ([f69360d](https://github.com/philharmoniedeparis/metascore-library/commit/f69360de4342bc67b960f77261b5fb66ef86aa42))
* round time control values ([690eb90](https://github.com/philharmoniedeparis/metascore-library/commit/690eb9064f766b4da9ac4738ddd94f77396ba002))
* seek media to clicked component in timeline ([6f102d5](https://github.com/philharmoniedeparis/metascore-library/commit/6f102d57f425b752222f2e244ae0d4994e02698f)), closes [#557](https://github.com/philharmoniedeparis/metascore-library/issues/557)
* set input label cursor to pointer ([8940649](https://github.com/philharmoniedeparis/metascore-library/commit/894064989643531659fd504aa1e842619e02fc6a))
* stop propagation of key events when editing text content ([10f8233](https://github.com/philharmoniedeparis/metascore-library/commit/10f823324fca0a8645e3221f4f869c132bb0f7ea))
* throw more meaningful errors ([16b4129](https://github.com/philharmoniedeparis/metascore-library/commit/16b41293d5b12155e5bc131056687e38bd01f426))
* translate ComponentForm pager-visibility options ([cadbe58](https://github.com/philharmoniedeparis/metascore-library/commit/cadbe58a3d3bbe7a17537d543d2bd1ffcc7bedca))
* truncate long labels in behavior dropdowns ([bb012ee](https://github.com/philharmoniedeparis/metascore-library/commit/bb012ee8ed8931b5786b213b1d12c626f8fbfb13))
* update contextmenu when directive binding updates ([1ab115b](https://github.com/philharmoniedeparis/metascore-library/commit/1ab115b1cbd069cf2efa546c7a4985579e7949e5))
* update start- and end-time of a dropped page ([5d4f8dc](https://github.com/philharmoniedeparis/metascore-library/commit/5d4f8dc97bb40691a5ebf1d40d5f19a75db04d03)), closes [#533](https://github.com/philharmoniedeparis/metascore-library/issues/533)
* update text of correct component when switching selection ([8832ddf](https://github.com/philharmoniedeparis/metascore-library/commit/8832ddfcf2fe271080e00a01bf6c4366d29c9574))
* use correct document when creating AppPreview style sheet ([9725d8d](https://github.com/philharmoniedeparis/metascore-library/commit/9725d8ddcc7d0fd563472390695529e92359a739))
* use normalized item when setting model relations ([516999e](https://github.com/philharmoniedeparis/metascore-library/commit/516999e0caea5d043f00a9a35c0c0043bbd33cce))
* work around a bug in interactjs when restricting drag ([63119c1](https://github.com/philharmoniedeparis/metascore-library/commit/63119c1cd9cace7242b5dd712e95e9a6fb35ac2f))
* work around Blockly language error in preview mode ([2db9593](https://github.com/philharmoniedeparis/metascore-library/commit/2db959329be883f8e4469bcbe25dae37e81654cf))
* workaround case changes in drag DataTransfer formats ([b5f9492](https://github.com/philharmoniedeparis/metascore-library/commit/b5f949240e1e88e4c37dca643a9d8eb73b3cb399))

## [3.0.0-alpha.1](https://github.com/philharmoniedeparis/metascore-library/compare/38eec29e6df0ab07a3e7811a3d1f9f3e9955df24...v3.0.0-alpha.1) (2022-06-30)


### Features

* add animated property keyframe contextmenu ([397f711](https://github.com/philharmoniedeparis/metascore-library/commit/397f711626304aad83423c3368a7a1f5abca4610))
* add auto-save data restore functionality ([b89925c](https://github.com/philharmoniedeparis/metascore-library/commit/b89925cffeb99b6f6f30de7bde7007301164b238))
* add autofocus to form controls ([649035e](https://github.com/philharmoniedeparis/metascore-library/commit/649035e47f5758271d1c579ab7abb6017f30d207))
* add component drag and resize snapping ([257a8b2](https://github.com/philharmoniedeparis/metascore-library/commit/257a8b2879815e2fe6260d066e5244d48f285dae))
* add component resize handles ([f6554a4](https://github.com/philharmoniedeparis/metascore-library/commit/f6554a4e2df6524ef736a4b182348176a275858e))
* add ComponentForm plural titles ([5cdedac](https://github.com/philharmoniedeparis/metascore-library/commit/5cdedac339c06cf9318f6ba7a56a4cb2f81ba41e))
* add loading indicator to SharedAssetsLibrary ([e79b786](https://github.com/philharmoniedeparis/metascore-library/commit/e79b7864433559a0f9e1daf195c5d585d06391b3))
* add player loading indicator ([7cab8b0](https://github.com/philharmoniedeparis/metascore-library/commit/7cab8b04c4adfecfe17146cbf5d9f263b6e7c1d9))
* add progresss indicator module ([45e5bc8](https://github.com/philharmoniedeparis/metascore-library/commit/45e5bc8a922b4dec026c2f4a5d39d0a976cd4d38))
* add revision restore confirmation dialog ([7c5f20f](https://github.com/philharmoniedeparis/metascore-library/commit/7c5f20f315884eebd8cdd763fe2d683addb8e6d4))
* add scenario manager contextmenu ([8bbf065](https://github.com/philharmoniedeparis/metascore-library/commit/8bbf065352e4cba3216ba836e4fec949967a3a7a))
* add support for extra fonts in CKEditor ([45271da](https://github.com/philharmoniedeparis/metascore-library/commit/45271da93632fdd210e0c680b42bcd7c878f9272))
* add timeline track resize snapping ([1db0396](https://github.com/philharmoniedeparis/metascore-library/commit/1db03967af34be1d1c8aaca0be8e2248ac79ba68))
* add waveform loading and error messages ([c50a675](https://github.com/philharmoniedeparis/metascore-library/commit/c50a6750a7987094a4f1447dfac3b661f5d7eb01))
* allow disabling modal teleporting ([259cd7b](https://github.com/philharmoniedeparis/metascore-library/commit/259cd7bae0059c469723bf4484ca2769f50d78a0))
* allow setting form control label via slot ([70675ac](https://github.com/philharmoniedeparis/metascore-library/commit/70675aca558bbac3b129b1c56d3afa6735910662))
* disable  component intteractions on text editing ([d83b6a8](https://github.com/philharmoniedeparis/metascore-library/commit/d83b6a88236f7e49ac184da04d8b28582b74535a))
* do not handle cursor component click if not selected ([e5b5d9a](https://github.com/philharmoniedeparis/metascore-library/commit/e5b5d9a87be24d21a0ef58d5c205f91c4ada8028))
* finish implementing hotkeys list ([4b78500](https://github.com/philharmoniedeparis/metascore-library/commit/4b78500511b9a0f930473eca5dd58819927798ca))
* group timeline track resize history ([351cf46](https://github.com/philharmoniedeparis/metascore-library/commit/351cf469639f861caad22918b658b7f1b02b51de))
* handle app orientation change ([6b0447d](https://github.com/philharmoniedeparis/metascore-library/commit/6b0447d600d32bc58e7f36fbdb3383913187ebb0))
* handle validation errors in schema forms ([aad2995](https://github.com/philharmoniedeparis/metascore-library/commit/aad29955b97c2b21e591d12a944399c2c02db6d6))
* implement animation colors ([85d1f57](https://github.com/philharmoniedeparis/metascore-library/commit/85d1f5712521777915bfe96e8f92e0df8ad3a54a))
* implement app internal links ([aec76be](https://github.com/philharmoniedeparis/metascore-library/commit/aec76be25c33994ba36f1c1e2264359f6ee86b81))
* implement background image selection ([9a5d872](https://github.com/philharmoniedeparis/metascore-library/commit/9a5d872485342c63d5f59f1ccc2ef29606f16b7b))
* implement BlockToggler blocks ([c1ca98d](https://github.com/philharmoniedeparis/metascore-library/commit/c1ca98d774e343e34c103a127693f7c57b88808b))
* implement revision restore ([c402f95](https://github.com/philharmoniedeparis/metascore-library/commit/c402f951b3eacc5354a18db3248f8f6699e5d8f8))
* implement save and auto-save functionality ([8db2ec9](https://github.com/philharmoniedeparis/metascore-library/commit/8db2ec970552e280d25153c3da7832ce1f4c3780))
* implement timeline track locking ([d8fb7bb](https://github.com/philharmoniedeparis/metascore-library/commit/d8fb7bb8d09658cd8bf7fda59c44dfa2692cee14))
* implement timeline track reordering ([215b6f8](https://github.com/philharmoniedeparis/metascore-library/commit/215b6f8f6423ee7a34dfa6434734835d91bf4195))
* improve AbstractModel ([709b73b](https://github.com/philharmoniedeparis/metascore-library/commit/709b73bb4b1ac699d8f7618aed782862f6b4d198))
* improve component form title ([64a7e4b](https://github.com/philharmoniedeparis/metascore-library/commit/64a7e4b61393c5e1c75eed4632dc9cff57e36368))
* improve form error styles ([649ee8b](https://github.com/philharmoniedeparis/metascore-library/commit/649ee8b3cd7b37a9042df2943389f6de92cec00e))
* improve module manager ([a3a5b69](https://github.com/philharmoniedeparis/metascore-library/commit/a3a5b69f51e64a17cad67c7d4af30101a0d43664))
* improve switching between scenarios ([14dd56b](https://github.com/philharmoniedeparis/metascore-library/commit/14dd56b37881a26beab61b75c98b383bff51e3bd))
* improve TabsItem component caching ([57c5ef4](https://github.com/philharmoniedeparis/metascore-library/commit/57c5ef4b92d3a7de5a476ea837cabaf90265f856))
* improve timeline track labels ([b68da87](https://github.com/philharmoniedeparis/metascore-library/commit/b68da87e1c4fbd9be6b16bdfc9a19f4a27cc795e))
* include player as editor component ([073e1cc](https://github.com/philharmoniedeparis/metascore-library/commit/073e1ccdd987e9045e83e6ba883c48bb320ea58d))
* inialize player within editor ([38eec29](https://github.com/philharmoniedeparis/metascore-library/commit/38eec29e6df0ab07a3e7811a3d1f9f3e9955df24))
* move player components to modules ([bdc78e2](https://github.com/philharmoniedeparis/metascore-library/commit/bdc78e29dac1b6cce2cc0ad4afc77bca22972480))
* move some store states from editor to app_preview ([a0a0fe8](https://github.com/philharmoniedeparis/metascore-library/commit/a0a0fe8aaeb722358719ea7ade74d755eac4caea))
* prevent direct access to module stores ([b93ee90](https://github.com/philharmoniedeparis/metascore-library/commit/b93ee90b24a4badb0d5420f5112e50168e67036d))
* remove "Element" from Component Library item labels ([5e77ba5](https://github.com/philharmoniedeparis/metascore-library/commit/5e77ba52f46d9c0903b43ebde077ce8b7b0f45b9))
* remove vuex-orm dependency ([83060dc](https://github.com/philharmoniedeparis/metascore-library/commit/83060dc5fb0b071d35cdb8d3df0c3e05ca0f1fc5))
* rename Content to Text ([b3364a9](https://github.com/philharmoniedeparis/metascore-library/commit/b3364a9d6be379ef26b449cb3a6f70ec3e22ba91))
* replace archived normalizr dependency with custom code ([2f7ef73](https://github.com/philharmoniedeparis/metascore-library/commit/2f7ef733fb1516adf984093568f562e69bd557b6))
* replace vuex by pinia ([217ea1d](https://github.com/philharmoniedeparis/metascore-library/commit/217ea1d10174c7475798a1be5f6bfd5cb0bdc7f7))
* return boolean for ajax "HEAD" requests ([b6377e7](https://github.com/philharmoniedeparis/metascore-library/commit/b6377e7b7ea3d044f1aeea849259ed4df120dfac))
* show Scenario tracks in timeline ([50f61d8](https://github.com/philharmoniedeparis/metascore-library/commit/50f61d839cf0f692561d0166bb42ca54162f8c57))
* store model instances in components store ([93e3aba](https://github.com/philharmoniedeparis/metascore-library/commit/93e3abadb09b0a10f31c9ea0584bfa38d1c6e278))
* translated schema form errors ([b1c5229](https://github.com/philharmoniedeparis/metascore-library/commit/b1c522967b3f313a5a524609bfcf33435bf7ff00))
* use classes for modules ([c282577](https://github.com/philharmoniedeparis/metascore-library/commit/c2825775aafc2fd9c70ae68c4057c3fd6116c49a))
* use styled-buttons in timecodeinput ([c5b1182](https://github.com/philharmoniedeparis/metascore-library/commit/c5b11827d4c1eb203289c0ee363d3882e12da416))


### Bug Fixes

* add app custom CSS into own document ([c439ea6](https://github.com/philharmoniedeparis/metascore-library/commit/c439ea64315eb65eec71ea47a53cad41c11841d6))
* add missing "off" method in event bus ([f65986b](https://github.com/philharmoniedeparis/metascore-library/commit/f65986b84258402e759616e3307c38083dafc8d3))
* add missing import in Page model ([aa40ded](https://github.com/philharmoniedeparis/metascore-library/commit/aa40ded36f3ee3eea2c83e65407dcf7928e6fde2))
* add patch for vuejs/core [#2513](https://github.com/philharmoniedeparis/metascore-library/issues/2513) ([788be82](https://github.com/philharmoniedeparis/metascore-library/commit/788be82c53991d77026d0c8694951b7eef3d4ce3))
* allow numeric values in Revision Selector props ([fb9d181](https://github.com/philharmoniedeparis/metascore-library/commit/fb9d181b54e215eb909790f53ac92c238978e961))
* assign Cursor "form" in component_library ([1cf5caf](https://github.com/philharmoniedeparis/metascore-library/commit/1cf5cafc8ec3a41c61c01feee8f534770fe805bb))
* correctly handle ajax ArrayBuffer responses ([9cf301e](https://github.com/philharmoniedeparis/metascore-library/commit/9cf301ed0238045cf209deecb73852e7796b725c))
* fix activation issue in useTime composable ([ea07613](https://github.com/philharmoniedeparis/metascore-library/commit/ea0761380eba8f424f9abe6acec93c0d78b82d7c))
* fix all ajax calls ([69f8752](https://github.com/philharmoniedeparis/metascore-library/commit/69f8752fd654cc7979b2def6edca41b45fc93bdf))
* fix app responsiveness issue ([d20d077](https://github.com/philharmoniedeparis/metascore-library/commit/d20d077b9d402dcb2d3c3d46a1109a41923ee53d))
* fix bug in AnimatedContraol value update ([f78a566](https://github.com/philharmoniedeparis/metascore-library/commit/f78a56620f5bd7a9ffe9b6bce9d53e19e74b65fa))
* fix bug in app_preview's store moveComponents ([5a5d456](https://github.com/philharmoniedeparis/metascore-library/commit/5a5d4566089581a561880404180ada52d32a3ad6))
* fix bug in deselectComponent and unlockComponent ([f0dbf28](https://github.com/philharmoniedeparis/metascore-library/commit/f0dbf286a9cc68442ce392f97df176d3af0ef1b8))
* fix bug in schema form ([cabdc11](https://github.com/philharmoniedeparis/metascore-library/commit/cabdc11d08ce43164e9beb3be0b13ae6faf1a0e5))
* fix bug in select control ([9824d37](https://github.com/philharmoniedeparis/metascore-library/commit/9824d370d466c67ec409c0ffe867c5d887891648))
* fix bug in select control ([7594ef7](https://github.com/philharmoniedeparis/metascore-library/commit/7594ef79694dbb0a502503c2b99470837bab4b38))
* fix bug in waveform data setting ([8f43b8e](https://github.com/philharmoniedeparis/metascore-library/commit/8f43b8e204429447ddc9a338424982b23967b2e7))
* fix component drag'n'drop in Chrome ([cd76677](https://github.com/philharmoniedeparis/metascore-library/commit/cd766772146b35d892875810b18937ecb290f636))
* fix component form overflow issue ([250b2e0](https://github.com/philharmoniedeparis/metascore-library/commit/250b2e08096ac46ba2e50d677beef3673757869f))
* fix components library separator ([bf96c7d](https://github.com/philharmoniedeparis/metascore-library/commit/bf96c7d1caed35df846f65214a514fe91b9a2591))
* fix contextmenu display ([b5d969b](https://github.com/philharmoniedeparis/metascore-library/commit/b5d969bba084db67eca6d3fd7052232c1cd7ceed))
* fix contextmenu in Chrome ([21d9bf5](https://github.com/philharmoniedeparis/metascore-library/commit/21d9bf5eae5045894455e618ecb8a5e7f6f2b1f4))
* fix draggable contexts ([2636a16](https://github.com/philharmoniedeparis/metascore-library/commit/2636a164b38913fd493ecb00f4e414afff890ff8))
* fix lottie animations display in shared assets ([d2cc9d4](https://github.com/philharmoniedeparis/metascore-library/commit/d2cc9d447a7a70593f42047b4ddcc8c0891ca030))
* fix main menu item arrangement ([91f3a8b](https://github.com/philharmoniedeparis/metascore-library/commit/91f3a8b3aa12263e6947d5328f4b06676520cbad))
* fix recursive reactivity updates ([975a0e6](https://github.com/philharmoniedeparis/metascore-library/commit/975a0e6789a7ad61aaa595c69cd520575f8d2274))
* fix tabs CSS bug ([e027050](https://github.com/philharmoniedeparis/metascore-library/commit/e027050f6ee613ecee948b15e904f595679e41a9))
* fix timecode_input interaction bugs ([ce84eef](https://github.com/philharmoniedeparis/metascore-library/commit/ce84eef5cfbba9bdd807eba258b21064b18c78a8))
* fix timeline playhead ([43142fc](https://github.com/philharmoniedeparis/metascore-library/commit/43142fcf442d46fed27f0894677d94e715f5c365))
* fix timeline playhead position when zoomed ([2d86ca8](https://github.com/philharmoniedeparis/metascore-library/commit/2d86ca8d104fb24cfd769653352b8aa59dbe0e9d))
* fix typo in assets_library module name ([15d3ca1](https://github.com/philharmoniedeparis/metascore-library/commit/15d3ca1c0c9acd7ef9568b4ae1e547808cb52b9d))
* fix typo in auto-save indicator ([cf03be6](https://github.com/philharmoniedeparis/metascore-library/commit/cf03be63e05b6a32f62b02d4e51f3b88cb7f23c7))
* fix updating adjacent page times on page update ([344386d](https://github.com/philharmoniedeparis/metascore-library/commit/344386db82dce70930829ac666832983719c9419))
* fix various shcema forms ([76972a4](https://github.com/philharmoniedeparis/metascore-library/commit/76972a4d7410cfd892469991e6405b02b1b774c2))
* fix vertical preview ruler labels ([874f8e7](https://github.com/philharmoniedeparis/metascore-library/commit/874f8e75362db17f11ac0fc1c99ddd64cbe17585))
* fix waveform zoom dragging ([740363e](https://github.com/philharmoniedeparis/metascore-library/commit/740363eae67e8ef8b7d40914bda24fc2c067bbfe))
* fix waveform zoom redraw on resize ([05261ac](https://github.com/philharmoniedeparis/metascore-library/commit/05261ac16eab171961b0f6647318dccb57b3d393))
* force updating components via store update action ([5ad97e2](https://github.com/philharmoniedeparis/metascore-library/commit/5ad97e24b939d08d726ff7af38f6b653b419144d))
* handle async undo/redo history actions ([e4a69e3](https://github.com/philharmoniedeparis/metascore-library/commit/e4a69e36924639b0c1f6f0843f8689144309656e))
* improve buffer indicator ranges ([57ed0b6](https://github.com/philharmoniedeparis/metascore-library/commit/57ed0b66df7a23a79c8af6243b564180c56db518))
* improve component composables performance ([22826b5](https://github.com/philharmoniedeparis/metascore-library/commit/22826b5515ac69b05f0f999557483a680f31f325))
* improve component model collections handling ([f003c0e](https://github.com/philharmoniedeparis/metascore-library/commit/f003c0e29ea072022b553fe52e3de82bc46501f1))
* improve context menu ([2fba638](https://github.com/philharmoniedeparis/metascore-library/commit/2fba63870235fc4d12a2583656efe759448f031c))
* improve cursor keyframe dragging ([c2fe1a4](https://github.com/philharmoniedeparis/metascore-library/commit/c2fe1a4f9bed499c48e687367c3ca85951d6064d))
* improve main menu style ([de72b37](https://github.com/philharmoniedeparis/metascore-library/commit/de72b379186960fe1dfa4305c45cef74df142e8e))
* improve model schema cachability ([0c898ae](https://github.com/philharmoniedeparis/metascore-library/commit/0c898ae94ebde47d380eeeac7c123845c620c5fd))
* improve player component styles ([a7eb86c](https://github.com/philharmoniedeparis/metascore-library/commit/a7eb86cbdae0f3b18e774117a2efd5fc12e419c2))
* improve SVG stroke-dasharray options ([409bd8e](https://github.com/philharmoniedeparis/metascore-library/commit/409bd8e817193a274296094d4fa46711fe2cbd2b))
* improve v-for loop keys ([cc014d1](https://github.com/philharmoniedeparis/metascore-library/commit/cc014d14c4bc964c7a04817e979397e3d4c52adb))
* mark properties as unanimated if last keyframe is deleted ([3cbc74b](https://github.com/philharmoniedeparis/metascore-library/commit/3cbc74b5aa23534f0b547f23a76395249c39a31a))
* mark schema form validator as raw ([f40c326](https://github.com/philharmoniedeparis/metascore-library/commit/f40c326a05cdec9fb4fcb8d26f45030aa1063bd3))
* move ajax helper outside of api package ([7a9c0c1](https://github.com/philharmoniedeparis/metascore-library/commit/7a9c0c173856e141dea1070f301cb0b4ee8afa25))
* move media management from component to store ([21ce3b6](https://github.com/philharmoniedeparis/metascore-library/commit/21ce3b6db6302ece079934eb185253a3658927ae))
* prevent timeline track drag from toggles ([f148545](https://github.com/philharmoniedeparis/metascore-library/commit/f148545f9fa0da59e37690a0bd7abd4d345addec))
* remove 2 remaining module store getters ([10dc5ab](https://github.com/philharmoniedeparis/metascore-library/commit/10dc5abf329d79d27d4006d65a51964c2aaa85f0))
* remove color overly hide delay ([f96be40](https://github.com/philharmoniedeparis/metascore-library/commit/f96be4015999d4521f002cd2e845defd255b4ab4))
* remove CursorKeyframesControl unused props ([0b73033](https://github.com/philharmoniedeparis/metascore-library/commit/0b73033c95b1990dd723df4b9588c8d1c53b8e8c))
* remove debug console logs ([cb085f5](https://github.com/philharmoniedeparis/metascore-library/commit/cb085f58ba2a0064809bb7ff65a0c5cfa1e14db6))
* remove unused router and eventbus ([ffa506a](https://github.com/philharmoniedeparis/metascore-library/commit/ffa506a8b882410d34e526fbb99bc5b329397e77))
* reorder component library items ([1a4a904](https://github.com/philharmoniedeparis/metascore-library/commit/1a4a9049360086fac0aed6579e392c111d85f476))
* replace usage of removed AbstractComponent 'name' property by 'type' property ([2e369f2](https://github.com/philharmoniedeparis/metascore-library/commit/2e369f24815dab60bd532e0c3e5fa709bfbb7c52))
* return selectedComponents as ref in app_preview ([fd3e763](https://github.com/philharmoniedeparis/metascore-library/commit/fd3e763cb4cc081ca144748dd6fc770a30bd92d8))
* show native context menu with ctrl key ([9b279bb](https://github.com/philharmoniedeparis/metascore-library/commit/9b279bb1899805c36ad9d876f8f495acabf99f67))
* simplify AbstractModel create method ([b1d7047](https://github.com/philharmoniedeparis/metascore-library/commit/b1d7047c005ed8db35b81d13fa5b28dcaac47d49))
* update [@vue](https://github.com/vue) patches ([139fc39](https://github.com/philharmoniedeparis/metascore-library/commit/139fc390b1b0b48b55dc4753a1958df00c0fd409))
* update sibling pages on page time update ([e1c2101](https://github.com/philharmoniedeparis/metascore-library/commit/e1c21012364f0ce082ea9ff3d929cf3109d6f9f0))
* use defined swatches in svg and animations color fields ([115aa85](https://github.com/philharmoniedeparis/metascore-library/commit/115aa8515a8a7d5c13aa8883dceaccca7dbceac9))
