import { unref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useModule } from "@core/services/module-manager";
import useStore from "../../../../store";

/**
 * Parse data received from postMessage.
 *
 * @param {*} data The data received.
 * @return {object} The parsed data
 */
function parseMessageData(data) {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.warn(error);
      return;
    }
  }

  return data;
}

/**
 * Process a received message.
 *
 * @param {MessageEvent} evt The event object
 */
export function processMessage(evt) {
  const data = parseMessageData(evt.data);

  if (!data || !("method" in data)) {
    return;
  }

  const source = evt.source;
  const origin = evt.origin;

  const { method, params = {} } = data;

  switch (method) {
    case "play":
      {
        const { setGlobalCuepoint, removeCuepoint } =
          useModule("core:media_cuepoints");
        const { play, pause, seekTo } = useModule("core:media_player");
        const { getComponentsByType, activeScenario, setActiveScenario } =
          useModule("core:app_components");

        // @todo: refactor with AppRenderer's onComponentAction
        if ("inTime" in params || "outTime" in params) {
          const {
            inTime = null,
            outTime = null,
            scenario: scenario_slug = null,
          } = params;
          const cuepoint_config = {
            startTime: inTime,
            endTime: outTime,
            onStop: () => {
              pause();
            },
            onSeekout: ({ cuepoint }) => {
              removeCuepoint(cuepoint);
            },
          };

          if (scenario_slug !== null) {
            const scenario = getComponentsByType("Scenario").find(
              (c) => c.slug === scenario_slug
            );
            const current_scenario = unref(activeScenario);
            if (scenario && scenario.id !== current_scenario) {
              cuepoint_config.onSeekout = ({ cuepoint }) => {
                setActiveScenario(current_scenario);
                removeCuepoint(cuepoint);
              };
              setActiveScenario(scenario.id);
            }
          }

          setGlobalCuepoint(cuepoint_config);

          if (inTime !== null) {
            seekTo(inTime);
          }
        }
        play();
      }
      break;

    case "pause":
      {
        const { pause } = useModule("core:media_player");
        pause();
      }
      break;

    case "stop":
      {
        const { stop } = useModule("core:media_player");
        stop();
      }
      break;

    case "seek":
      {
        const { seekTo } = useModule("core:media_player");
        seekTo(params?.seconds || 0);
      }
      break;

    case "page":
      if ("block" in params && "index" in params) {
        const { getComponentsByType, setBlockActivePage } =
          useModule("core:app_components");
        const block = getComponentsByType("Block").find(
          (c) => c.name === params.block
        );
        if (block) {
          setBlockActivePage(block, params.index);
        }
      }
      break;

    case "toggleBlock":
      if ("name" in params) {
        const {
          getComponentsByType,
          showComponent,
          hideComponent,
          toggleComponent,
        } = useModule("core:app_components");
        const block = getComponentsByType("Block").find(
          (c) => c.name === params.name
        );
        if (block) {
          if (params.value === "toggle") toggleComponent(block);
          else if (params.value === "hide") hideComponent(block);
          else showComponent(block);
        }
      }
      break;

    case "scenario":
      if ("value" in params) {
        const { getComponentsByType, setActiveScenario } =
          useModule("core:app_components");
        const scenario = getComponentsByType("Scenario").find(
          (c) => c.slug === params.value
        );
        if (scenario) setActiveScenario(scenario.id);
      }
      break;

    case "responsiveness":
      {
        const { adaptSize, allowUpscaling } = params;
        const { setResponsiveness } = useModule("core:app_renderer");
        setResponsiveness(adaptSize, allowUpscaling);
      }
      break;

    case "playing":
      {
        const { playing } = useModule("core:media_player");
        source.postMessage(
          JSON.stringify({
            callback: params.callback,
            params: unref(playing),
          }),
          origin
        );
      }
      break;

    case "time":
      {
        const { time } = useModule("core:media_player");
        source.postMessage(
          JSON.stringify({
            callback: params.callback,
            params: unref(time),
          }),
          origin
        );
      }
      break;

    case "addEventListener":
      switch (params.type) {
        case "ready":
          {
            const store = useStore();
            const { ready } = storeToRefs(store);

            let unwatch = watch(
              ready,
              (value) => {
                if (!value) return;

                if (unwatch) {
                  unwatch();
                  unwatch = null;
                }

                source.postMessage(
                  JSON.stringify({
                    callback: params.callback,
                  }),
                  origin
                );
              },
              { immediate: true }
            );
          }
          break;

        case "timeupdate":
          {
            const { time } = useModule("core:media_player");
            watch(time, (value) => {
              source.postMessage(
                JSON.stringify({
                  callback: params.callback,
                  params: value,
                }),
                origin
              );
            });
          }
          break;

        case "scenariochange":
          {
            const { activeScenario } = useModule("core:app_components");
            watch(activeScenario, (value) => {
              source.postMessage(
                JSON.stringify({
                  callback: params.callback,
                  params: value,
                }),
                origin
              );
            });
          }
          break;
      }
      break;

    case "removeEventListener":
      /**
       * @todo add support
       */
      break;

    case "fullscreenchange":
      document.body.classList.toggle("fullscreen", params.value);
      break;
  }
}
