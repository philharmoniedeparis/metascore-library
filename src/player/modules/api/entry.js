import { round } from 'lodash'
import { v4 as uuid } from 'uuid'

/**
 * The value of the targetOrigin parameter sent with each postMessage
 * See https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 *
 * @property target_origin
 * @private
 * @type String
 */
const target_origin = '*'

/**
 * A regular expression used to test incoming messages origin
 *
 * @property source_origin_regex
 * @private
 * @type RegExp
 */
const source_origin_regex = /^http[s]?:\/\/(.*[.-])?metascore.philharmoniedeparis.fr/

/**
 * The player API class.
 *
 * HTML links that follow the following format are automatically parsed:
 *
 *         <a href="#{action(s)}" rel="metascore" data-guide="{player's iframe id}">{link text}</a>
 *
 * An action can take arguments in the form of action=arg1,arg2,.. <br/>
 * Multiple actions can be specified seperated by &
 *
 * Examples:
 *
 *         <a href="#play" rel="metascore" data-guide="guide-93">PLAY</a>
 *         <a href="#play=20,500,scenario-2" rel="metascore" data-guide="guide-93">PLAY EXTRACT</a>
 *         <a href="#pause" rel="metascore" data-guide="guide-93">PAUSE</a>
 *         <a href="#stop" rel="metascore" data-guide="guide-93">PAUSE</a>
 *         <a href="#seek=1.5" rel="metascore" data-guide="guide-93">SEEk TO 1.5 SECONDS</a>
 *         <a href="#page=permanentText,3" rel="metascore" data-guide="guide-93">GOT TO PAGE 3 OF THE PERMANENTTEXT BLOCK</a>
 *         <a href="#scenario=scenario-2" rel="metascore" data-guide="guide-93">SET THE SCENARIO TO scenario-2</a>
 *         <a href="#showBlock=block1" rel="metascore" data-guide="guide-93">SHOW BLOCK 1</a>
 *         <a href="#hideBlock=block1" rel="metascore" data-guide="guide-93">HIDE BLOCK 1</a>
 *         <a href="#toggleBlock=block1" rel="metascore" data-guide="guide-93">TOGGLE BLOCK 1</a>
 *         <a href="#enterFullscreen" rel="metascore" data-guide="guide-93">ENTER FULLSCREEN</a>
 *         <a href="#exitFullscreen" rel="metascore" data-guide="guide-93">EXIT FULLSCREEN</a>
 *         <a href="#toggleFullscreen" rel="metascore" data-guide="guide-93">TOGGLE FULLSCREEN</a>
 *         <a href="#page=permanentText,3&scenario=2&seek=1.5" rel="metascore" data-guide="guide-93">GOT TO PAGE 3 OF THE PERMANENTTEXT BLOCK AND SET THE SCENARIO TO 2 AND SEEK TO 1.5 SECONDS</a>
 */
export class API {
  /**
   * Instantiate
   *
   * @param {HTMLIFrameElement} target The player's iframe to control
   * @param {Function} callback A callback called once the API is ready
   * @param {API} callback.api The API instance
   */
  constructor(target, callback) {
    /**
     * The target player
     * @type {String|Element}
     */
    this.target = typeof target === 'string' ? document.getElementById(target) : target

    /**
     * The list of added callbacks
     * @type {Object}
     */
    this.callbacks = {}

    this.target.addEventListener('load', this.onLoad.bind(this, callback), false)

    window.addEventListener('message', this.onMessage.bind(this), false)
  }

  /**
   * Send a message to the player to invoke a desired method
   *
   * @param {String} method The API method to invoke
   * @param {Mixed} params The parameter(s) to send along
   * @return {this}
   */
  postMessage(method, params) {
    if (!this.target.contentWindow.postMessage) {
      return false
    }

    const data = JSON.stringify({
      method: method,
      params: params,
    })

    this.target.contentWindow.postMessage(data, target_origin)

    return this
  }

  /**
   * Callback called when the player finished loading
   *
   * @private
   * @param {Function} callback A callback called once the player finished loading
   * @param {API} callback.api The API instance
   */
  onLoad(callback) {
    this.on('ready', () => {
      this.target.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this))

      callback(this)
    })
  }

  /**
   * Callback called when a message is received from the player
   * If the received message contains a callback id, it will be invoked with any passed parameters
   *
   * @private
   * @param {MessageEvent} evt The event object containing the message details
   */
  onMessage(evt) {
    if (!source_origin_regex.test(evt.origin)) {
      return
    }

    try {
      const data = JSON.parse(evt.data)

      if ('callback' in data && data.callback in this.callbacks) {
        const callback = this.callbacks[data.callback]
        const params = 'params' in data ? data.params : null

        callback(params)
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * Callback called when the player iframe switches into or out of full-screen mode
   *
   * @private
   */
  onFullscreenChange() {
    this.postMessage('fullscreenchange', {
      value: document.fullscreenElement === this.target,
    })
  }

  /**
   * Add a listener for player messages
   *
   * @param {String} type The type of message to listen to
   * @param {Function} callback A callback to invoke when a matched message is received
   * @return {this}
   */
  on(type, callback) {
    const callback_id = uuid()
    this.callbacks[callback_id] = callback
    this.postMessage('addEventListener', { type: type, callback: callback_id })
    return this
  }

  /**
   * Sends a 'play' message to the player
   * Used to start playing the player's media, or play a specific extract
   *
   * @param {String} [inTime] The time at which the player should start playing
   * @param {String} [outTime] The time at which the player should stop playing
   * @param {String} [scenario] A scenario to go to while playing
   * @return {this}
   */
  play(inTime, outTime, scenario) {
    if (!isNaN(scenario)) {
      // This is likely a v1 call, alter the parameters for backward compatibility.
      this.postMessage('play', {
        inTime: round(inTime / 100, 2),
        outTime: round(outTime / 100, 2),
        scenario: `scenario-${scenario}`,
      })
      return this
    }

    this.postMessage('play', {
      inTime: inTime,
      outTime: outTime,
      scenario: scenario,
    })

    return this
  }

  /**
   * Sends a 'pause' message to the player
   * Used to pause the player's media playback
   *
   * @return {this}
   */
  pause() {
    this.postMessage('pause')
    return this
  }

  /**
   * Sends a 'stop' message to the player
   * Used to stop the player's media playback
   *
   * @return {this}
   */
  stop() {
    this.postMessage('stop')
    return this
  }

  /**
   * Sends a 'seek' message to the player
   * Used to seek the player's media to a specific time
   *
   * @param {Number} seconds The time in seconds to seek to
   * @return {this}
   */
  seek(seconds) {
    this.postMessage('seek', { seconds: parseFloat(seconds) })
    return this
  }

  /**
   * Sends a 'page' message to the player
   * Used to set a block's active page
   *
   * @param {String} block The page's block name
   * @param {Integer} index The page's index
   * @return {this}
   */
  page(block, index) {
    this.postMessage('page', { block: block, index: parseInt(index, 10) - 1 })
    return this
  }

  /**
   * Sends a 'hideBlock' message to the player
   * Used to hide a given block in the player with the value = false
   *
   * @param {String} name The block's name
   * @return {this}
   */
  hideBlock(name) {
    this.postMessage('toggleBlock', { name: name, value: false })
    return this
  }

  /**
   * Sends a 'toggleBlock' message to the player with the value = true
   * Used to hide a given block in the player
   *
   * @param {String} name The block's name
   * @return {this}
   */
  showBlock(name) {
    this.postMessage('toggleBlock', { name: name, value: true })
    return this
  }

  /**
   * Sends a 'toggleBlock' message to the player
   * Used to toggle the visibility of a block in the player
   *
   * @param {String} name The block's name
   * @return {this}
   */
  toggleBlock(name) {
    this.postMessage('toggleBlock', { name: name })
    return this
  }

  /**
   * Sends a 'scenario' message to the player
   * Used to set the scenario of the player
   *
   * @param {String} value The scenario to set
   * @return {this}
   */
  scenario(value) {
    this.postMessage('scenario', { value: value })
    return this
  }

  /**
   * Old rindex method for backward compatibility
   *
   * @param {String} index The scenario to set
   * @return {this}
   */
  rindex(index) {
    this.postMessage('scenario', { value: `scenario-${index}` })
    return this
  }

  /**
   * Sends a 'responsiveness' message to the player
   * Used to set whether the app can adapt its size to fit its container
   *
   * @param {Boolean} adaptSize Whether to make the renderer responsive
   * @param {Boolean} allowUpscaling Whether to allow or disallow upscaling
   * @returns {this}
   */
  responsive(adaptSize, allowUpscaling) {
    this.postMessage('responsiveness', { adaptSize, allowUpscaling })
    return this
  }

  /**
   * Enter fullscreen mode
   *
   * @return {this}
   */
  enterFullscreen() {
    return this.toggleFullscreen(true)
  }

  /**
   * Exit fullscreen mode
   *
   * @return {this}
   */
  exitFullscreen() {
    return this.toggleFullscreen(false)
  }

  /**
   * Enter or exit fullscreen mode
   * This cannot be done with postMessage due to browser security issues.
   *
   * @return {this}
   */
  toggleFullscreen(value) {
    const enter_fullscreen = typeof value !== 'undefined' ? value : !document.fullscreenElement
    if (enter_fullscreen) {
      this.target.requestFullscreen()
    } else {
      this.target.exitFullscreen()
    }

    return this
  }

  /**
   * Sends a 'playing' message to the player
   * Used to check the state of the player
   *
   * @param {Function} callback The callback called when the response is received
   * @param {Boolean} callback.value The state of the player (true if playing, false otherwise)
   * @return {this}
   */
  playing(callback) {
    const callback_id = uuid()
    this.callbacks[callback_id] = callback
    this.postMessage('playing', { callback: callback_id })
    return this
  }

  /**
   * Sends a 'time' message to the player
   * Used to get the current time of the player's media
   *
   * @param {Function} callback The callback called when the response is received
   * @param {Number} callback.value The current time of the media in seconds
   * @return {this}
   */
  time(callback) {
    const callback_id = uuid()
    this.callbacks[callback_id] = callback
    this.postMessage('time', { callback: callback_id })
    return this
  }
}

/**
 * Automatically process API links in the current HTML document
 */
document.addEventListener('DOMContentLoaded', () => {
  const ids = new Set()

  document
    .querySelectorAll('a[rel="metascore"][data-guide]:not(.metascore-api-processed)')
    .forEach((link) => {
      ids.add(link.dataset.guide)

      // Prevent the link from being processed multiple times.
      link.classList.add('metascore-api-processed')
    })

  if (ids.size > 0) {
    const callback = (api) => {
      const cleanArg = (arg) => {
        return decodeURIComponent(arg)
      }

      const handler = (evt) => {
        const link = evt.target.closest('a')
        const actions = link.hash.replace(/^#/, '').split('&')

        for (let i = 0, length = actions.length; i < length; i++) {
          const action = actions[i].split('=')
          const fn = action[0]

          if (fn in api) {
            const args = action.length > 1 ? action[1].split(',').map(cleanArg) : []
            api[fn](...args)
            evt.preventDefault()
          }
        }
      }

      document
        .querySelectorAll(`a[rel="metascore"][data-guide="${api.target.id}"]`)
        .forEach((link) => {
          link.addEventListener('click', handler)
        })
    }

    document.querySelectorAll(`iframe#${Array.from(ids).join(',iframe#')}`).forEach((iframe) => {
      new API(iframe, callback)
    })
  }
})
