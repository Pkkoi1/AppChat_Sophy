import { ZegoExpressEngine } from 'zego-express-engine-reactnative';

let zegoEngine = null;

export const createZegoEngine = (appID, appSign) => {
  console.log("createZegoEngine called with appID:", appID, "appSign:", appSign); // Add console log
  if (!zegoEngine) {
    try {
      zegoEngine = new ZegoExpressEngine(appID, appSign);
      console.log('ZegoExpressEngine created');
    } catch (error) {
      console.error("Error creating ZegoExpressEngine:", error); // Log any errors during engine creation
      zegoEngine = null; // Ensure zegoEngine is null if creation fails
    }
  } else {
    console.log('ZegoExpressEngine already exists');
  }
};

export const destroyZegoEngine = () => {
  if (zegoEngine) {
    zegoEngine.destroy();
    zegoEngine = null;
    console.log('ZegoExpressEngine destroyed');
  } else {
    console.log('ZegoExpressEngine does not exist');
  }
};

export const getZegoEngine = () => {
  return zegoEngine;
};