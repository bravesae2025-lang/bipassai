/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
// The film is screen content: crisp UI text and hairline rules. JPEG frame
// capture softens those before the encoder ever sees them, so capture PNG and
// spend the bitrate on a low CRF with a slow x264 preset instead.
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(17);
Config.setX264Preset("slow");
Config.setMuted(true);
// Keep default renders at their authored resolution. The website guide uses
// an explicit 0.75 scale in the render command to produce a decoder-friendly
// 1920×1080 master instead of the previous 3840×2160 / 120fps file.
Config.setScale(1);
