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
            title: "Width",
            default: 400,
            minimum: 0,
          }),
          height: createEnumField({
            title: "Height",
            enum: ["16", "32", "64", "128", "256", "512", "1024", "2048"],
            default: "256",
          }),
          mode: createEnumField({
            title: "Mode",
            enum: ["combined", "separate"],
            default: "combined",
          }),
          legend: createBooleanField({
            title: "Legend",
            default: true,
          }),
          start_time: createTimeField({
            ajv,
            title: "Start time",
          }),
          end_time: createTimeField({
            ajv,
            title: "End time",
          }),
          scale: createEnumField({
            title: "Scale",
            enum: ["lin", "sqrt", "cbrt", "log", "4thrt", "5thrt"],
            default: "log",
          }),
          start: createIntegerField({
            title: "Start",
            default: 0,
            minimum: 0,
          }),
          stop: createIntegerField({
            title: "Stop",
            default: 0,
            minimum: 0,
          }),
          color: createEnumField({
            title: "Color",
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
            title: "Gain",
            default: 1,
          }),
          saturation: createNumberField({
            title: "Saturation",
            default: 1,
            minimum: -10,
            maximun: 10,
            multipleOf: 0.1,
          }),
          rotation: createNumberField({
            title: "Saturation",
            default: 0,
            minimum: -1,
            maximun: 1,
            multipleOf: 0.1,
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
        ],
      })
    );
  }
}
