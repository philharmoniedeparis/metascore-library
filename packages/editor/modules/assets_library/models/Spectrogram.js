import { merge } from "lodash";
import AbstractModel from "@metascore-library/core/models/AbstractModel";
import {
  createIntegerField,
  createEnumField,
  createBooleanField,
  createTimeField,
  createNumberField,
} from "@metascore-library/core/utils/schema";

export default class Spectrogram extends AbstractModel {
  static get schema() {
    const ajv = this.ajv;

    return Object.freeze(
      merge(super.schema, {
        properties: {
          width: createIntegerField({
            default: 400,
            minimum: 1,
          }),
          height: createEnumField({
            enum: ["16", "32", "64", "128", "256", "512", "1024", "2048"],
            default: "256",
          }),
          mode: createEnumField({
            enum: ["combined", "separate"],
            default: "combined",
          }),
          legend: createBooleanField({
            default: true,
          }),
          start_time: createTimeField({
            ajv,
          }),
          end_time: createTimeField({
            ajv,
          }),
          scale: createEnumField({
            enum: ["lin", "sqrt", "cbrt", "log", "4thrt", "5thrt"],
            default: "log",
          }),
          start: createIntegerField({
            default: 0,
            minimum: 0,
          }),
          stop: createIntegerField({
            default: 0,
            minimum: 0,
          }),
          color: createEnumField({
            enum: [
              "channel",
              "intensity",
              "rainbow",
              "moreland",
              "nebulae",
              "fire",
              "fiery",
              "fruit",
              "cool",
              "magma",
              "green",
              "viridis",
              "plasma",
              "cividis",
              "terrain",
            ],
            default: "intensity",
          }),
          gain: createIntegerField({
            default: 1,
          }),
          saturation: createNumberField({
            default: 1,
            minimum: -10,
            maximun: 10,
            multipleOf: 0.1,
          }),
          rotation: createNumberField({
            default: 0,
            minimum: -1,
            maximun: 1,
            multipleOf: 0.1,
          }),
          win_func: createEnumField({
            enum: [
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
            default: "hann",
          }),
        },
        required: [
          "width",
          "height",
          "mode",
          "scale",
          "start",
          "stop",
          "color",
          "gain",
          "saturation",
          "rotation",
          "win_func",
        ],
      })
    );
  }
}
