import {
	ACESFilmicToneMapping,
	AmbientLight,
	AxesHelper,
	Color,
	DirectionalLight,
	PCFSoftShadowMap,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	WebGLRenderer,
} from "three";
import { FBXLoader, OrbitControls } from "three/examples/jsm/Addons";
import { loadModel } from "../helpers";

export default class World {
	constructor() {
		this._initWorld();
	}

	_initWorld() {
		this._viewport = {
			width: window.innerWidth,
			height: window.innerHeight,
		};

		this._renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
		this._renderer.outputColorSpace = SRGBColorSpace;
		this._renderer.toneMapping = ACESFilmicToneMapping;
		this._renderer.shadowMap.enabled = true;
		this._renderer.shadowMap.type = PCFSoftShadowMap;
		this._renderer.setPixelRatio(Math.min(Math.max(1, window.devicePixelRatio), 2));
		this._renderer.setSize(this._viewport.width, this._viewport.height);
		this._canvas = this._renderer.domElement;
		document.getElementById("gl").appendChild(this._canvas);

		this._camera = new PerspectiveCamera(60, this._viewport.width / this._viewport.height, 0.1, 1000);
		this._camera.position.set(0, 2, 6);

		this._scene = new Scene();
		this._scene.background = new Color(0xfcfcfc);

		this._controls = new OrbitControls(this._camera, this._canvas);
		this._controls.enableDamping = true;
		this._controls.update();

		this._loadMiles();

		const light = new DirectionalLight("#ffffff", 3);
		light.position.set(0, 2, 10);
		this._scene.add(light);

		this._scene.add(new AxesHelper());

		window.addEventListener(
			"resize",
			() => {
				this._resize();
			},
			false
		);
		this._resize();

		this._raf = window.requestAnimationFrame(() => this._update());
	}

	async _loadMiles() {
		const loader = new FBXLoader();
		loader.load("/models/miles.fbx", (data) => {});
	}

	_update = () => {
		this._raf = window.requestAnimationFrame(this._update);
		this._render();
	};

	_resize() {
		this._viewport.width = window.innerWidth;
		this._viewport.height = window.innerHeight;

		this._renderer.setSize(this._viewport.width, this._viewport.height);
		this._camera.aspect = this._viewport.width / this._viewport.height;
		this._camera.updateProjectionMatrix();
	}

	_render() {
		this._renderer.render(this._scene, this._camera);
		this._controls.update();
	}
}
