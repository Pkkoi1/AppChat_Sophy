/**
 * ZegoCloud Configuration
 * 
 * This file contains configurations for ZegoCloud SDK integration.
 * You need to replace placeholder values with your actual ZegoCloud credentials.
 */

// Replace these with your ZegoCloud App credentials from ZegoCloud Console
export const ZEGO_APP_ID = 0; // Your ZegoCloud App ID (number)
export const ZEGO_APP_SIGN = ''; // Your ZegoCloud App Sign (string)

// Optional configuration
export const ZEGO_CONFIG = {
  appID: ZEGO_APP_ID,
  appSign: ZEGO_APP_SIGN,
  isTestEnv: true, // Set to false in production
  scenario: {
    mode: 1, // Communication mode (optimized for calls)
  }
};
