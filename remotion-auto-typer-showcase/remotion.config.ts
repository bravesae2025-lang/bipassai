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
// Rendered at 1.5x (2880x1620) so the ~1300px-wide card stays sharp on 2x displays.
Config.setScale(1.5);
