import "react-native-gesture-handler";
import "react-native-reanimated";
import { registerRootComponent } from "expo";

import App from "./src/App";

// Startup performance marker
// Use Date.now() for a reliable numeric log in RN
(global as any).__appLaunch = Date.now();

registerRootComponent(App);
