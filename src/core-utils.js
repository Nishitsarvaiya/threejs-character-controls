import { PerspectiveCamera, WebGLRenderer } from "three";
import { EffectComposer, RenderPass } from "three/examples/jsm/Addons";

/**
 * This creates the renderer, by default calls renderer's setPixelRatio and setSize methods
 * further reading on color management: See https://www.donmccurdy.com/2020/06/17/color-management-in-threejs/
 * @param {object} rendererProps props fed to WebGlRenderer constructor
 * @param {function} configureRenderer custom function for consumer to tune the renderer, takes renderer as the only parameter
 * @returns created renderer
 */
export const createRenderer = (rendererProps = {}, configureRenderer = (renderer) => {}) => {
	const renderer = new WebGLRenderer(rendererProps);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	// more configurations to the renderer from the consumer
	configureRenderer(renderer);

	return renderer;
};

/**
 * This function creates the EffectComposer object for post processing
 * @param {object} renderer The threejs renderer
 * @param {object} scene The threejs scene
 * @param {object} camera The threejs camera
 * @param {function} extraPasses custom function that takes takes composer as the only parameter, for the consumer to add custom passes
 * @returns The created composer object used for post processing
 */
export const createComposer = (renderer, scene, camera, extraPasses) => {
	const renderScene = new RenderPass(scene, camera);

	let composer = new EffectComposer(renderer);
	composer.addPass(renderScene);

	// custom passes that the consumer wants to add
	extraPasses(composer);

	return composer;
};

/**
 * This function creates the PerspectiveCamera camera
 * @param {number} fov Field of view, def = 45
 * @param {number} near nearest distance of camera render range
 * @param {number} far furthest distance of camera render range
 * @param {object} camPos {x,y,z} of camera position
 * @param {object} camLookAt {x,y,z} where camera's looking at
 * @param {number} aspect Aspect ratio of camera, def = screen aspect
 * @returns the created camera object
 */
export const createCamera = (
	fov = 45,
	near = 0.1,
	far = 100,
	camPos = { x: 0, y: 0, z: 5 },
	camLookAt = { x: 0, y: 0, z: 0 },
	aspect = window.innerWidth / window.innerHeight
) => {
	const camera = new PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(camPos.x, camPos.y, camPos.z);
	camera.lookAt(camLookAt.x, camLookAt.y, camLookAt.z); // this only works when there's no OrbitControls
	camera.updateProjectionMatrix();
	return camera;
};
