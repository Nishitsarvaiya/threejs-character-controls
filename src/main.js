import "../style.css";

import WebGL from "three/addons/capabilities/WebGL.js";
import World from "./World/World";

if (WebGL.isWebGLAvailable()) {
	new World();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById("app").appendChild(warning);
}
