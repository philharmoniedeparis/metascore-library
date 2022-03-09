<i18n>
{
  "fr": {
    "title": "Générer une image de spectrogramme",
    "image_fieldset": "Image",
    "apply_button": "Générer",
    "cancel_button": "Annuler",
  },
  "en": {
    "title": "Generate an audio spectrogram image",
    "image_fieldset": "Image",
    "apply_button": "Generate",
    "cancel_button": "Cancel",
  },
}
</i18n>

<template>
  <modal-form
    class="assets-library--spectrogram-form"
    :title="$t('title')"
    :fields="fields"
    @submit="onSubmit"
    @close="onCancel"
  >
    <template #actions="props">
      <styled-button :form="props.form" role="primary">
        {{ $t("apply_button") }}
      </styled-button>

      <styled-button
        type="button"
        :form="props.form"
        role="secondary"
        @click="onCancel"
      >
        {{ $t("cancel_button") }}
      </styled-button>
    </template>
  </modal-form>
</template>

<script>
export default {
  emits: ["submit", "close"],
  computed: {
    fields() {
      return Object.freeze({
        image: {
          type: "fieldset",
          label: this.$t("image_fieldset"),
          fields: {
            width: {
              type: "number",
              label: this.$t("width_label"),
              default: 400,
              min: 0,
              required: true,
            },
            height: {
              type: "select",
              label: this.$t("height_label"),
              default: 256,
              options: [16, 32, 64, 128, 256, 512, 1024, 2048],
              required: true,
            },
            mode: {
              type: "select",
              label: this.$t("mode_label"),
              default: "combined",
              options: {
                combined: this.$t("mode_combined"),
                separate: this.$t("mode_separate"),
              },
              required: true,
            },
            legend: {
              type: "checkbox",
              label: this.$t("legend_label"),
              default: true,
            },
          },
        },
        time: {
          type: "fieldset",
          label: this.$t("time_fieldset"),
          fields: {
            start_time: {
              type: "timecode",
              label: this.$t("start_time_label"),
            },
            end_time: {
              type: "timecode",
              label: this.$t("end_time_label"),
            },
          },
        },
        scale: {
          type: "fieldset",
          label: this.$t("time_fieldset"),
          fields: {
            scale: {
              type: "select",
              label: this.$t("scale_label"),
              default: "log",
              options: {
                lin: this.$t("scale_linear"),
                sqrt: this.$t("scale_square_root"),
                cbrt: this.$t("scale_cubic_root"),
                log: this.$t("scale_logarithmic"),
                "4thrt": this.$t("scale_4th_root"),
                "5thrt": this.$t("scale_5th_root"),
              },
              required: true,
            },
            start: {
              type: "number",
              label: this.$t("start_label"),
              default: 0,
              min: 0,
              required: true,
            },
            stop: {
              type: "number",
              label: this.$t("stop_label"),
              default: 0,
              min: 0,
              required: true,
            },
          },
        },
        color: {
          type: "fieldset",
          label: this.$t("time_fieldset"),
          fields: {
            color: {
              type: "select",
              label: this.$t("color_label"),
              default: "intensity",
              options: {
                channel: this.$t("color_Channel"),
                intensity: this.$t("color_intensity"),
                rainbow: this.$t("color_rainbow"),
                moreland: this.$t("color_moreland"),
                nebulae: this.$t("color_nebulae"),
                fire: this.$t("color_fire"),
                fiery: this.$t("color_fiery"),
                fruit: this.$t("color_fruit"),
                cool: this.$t("color_cool"),
                magma: this.$t("color_magma"),
                green: this.$t("color_green"),
                viridis: this.$t("color_viridis"),
                plasma: this.$t("color_plasma"),
                cividis: this.$t("color_cividis"),
                terrain: this.$t("color_terrain"),
              },
              required: true,
            },
            gain: {
              type: "number",
              label: this.$t("gain_label"),
              default: 1,
              required: true,
            },
            saturation: {
              type: "number",
              label: this.$t("saturation_label"),
              default: 1,
              min: -10,
              max: 10,
              step: 0.1,
              required: true,
            },
            rotation: {
              type: "number",
              label: this.$t("saturation_label"),
              default: 0,
              min: -1,
              max: 1,
              step: 0.1,
              required: true,
            },
          },
        },
        algorithm: {
          type: "fieldset",
          label: this.$t("time_fieldset"),
          fields: {
            win_func: {
              type: "select",
              label: this.$t("color_label"),
              default: "hann",
              options: [
                "rect",
                "bartlett",
                "hann",
                "hanning",
                "hamming",
                "blackman",
                "welch",
                "flattop",
                "bharris",
                "bnuttall",
                "bhann",
                "sine",
                "nuttall",
                "lanczos",
                "gauss",
                "tukey",
                "dolph",
                "cauchy",
                "parzen",
                "poisson",
                "bohman",
              ],
              required: true,
            },
          },
        },
      });
    },
  },
  methods: {
    onCancel() {
      this.$emit("close");
    },
  },
};
</script>
