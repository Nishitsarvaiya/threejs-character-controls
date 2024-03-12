import {
	ACESFilmicToneMapping,
	AmbientLight,
	AxesHelper,
	Color,
	DirectionalLight,
	DirectionalLightHelper,
	HemisphereLight,
	LoadingManager,
	Mesh,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	SRGBColorSpace,
	Scene,
	WebGLRenderer,
} from "three";
import { FBXLoader, OrbitControls } from "three/examples/jsm/Addons";
import { loadHDRI, loadModel, loadTexture } from "../helpers";
import BasicCharacterController from "../Controller/BasicCharacterController";
import ThirdPersonCameraController from "../CameraController/ThirdPersonCameraController";

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
		this._renderer.setClearColor(0xffffff);
		this._renderer.outputColorSpace = SRGBColorSpace;
		this._renderer.toneMapping = ACESFilmicToneMapping;
		this._renderer.shadowMap.enabled = true;
		this._renderer.shadowMap.type = PCFSoftShadowMap;
		this._renderer.setPixelRatio(Math.min(Math.max(1, window.devicePixelRatio), 2));
		this._renderer.setSize(this._viewport.width, this._viewport.height);
		this._canvas = this._renderer.domElement;
		document.getElementById("gl").appendChild(this._canvas);

		this._camera = new PerspectiveCamera(60, this._viewport.width / this._viewport.height, 0.1, 1000);
		this._camera.position.set(-10, 20, 40);

		this._scene = new Scene();

		this._loadingManager = new LoadingManager();
		this._loadingManager.onLoad = this._onSceneLoad;

		loadHDRI("/textures/venice_sunset_2k.hdr").then((hdri) => {
			this._scene.environment = hdri;
			this._scene.background = hdri;
			hdri.wrapS = RepeatWrapping;
			hdri.wrapT = RepeatWrapping;
		});

		// this._controls = new OrbitControls(this._camera, this._canvas);
		// this._controls.target.set(0, 1, 0);
		// this._controls.enableDamping = true;
		// this._controls.update();

		let light = new DirectionalLight(0xffffff, 2.0);
		light.position.set(100, 100, 80);
		light.rotation.set(0, 0, 20);
		light.target.position.set(0, 0, 0);
		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.width = 4096;
		light.shadow.mapSize.height = 4096;
		light.shadow.camera.near = 0.1;
		light.shadow.camera.far = 1000.0;
		light.shadow.camera.left = 500;
		light.shadow.camera.right = -500;
		light.shadow.camera.top = 500;
		light.shadow.camera.bottom = -500;
		this._scene.add(light);
		this._light = light;

		light = new AmbientLight(0xffffff, 0.25);
		this._scene.add(light);

		// this._scene.add(new AxesHelper());

		this._ground = new Mesh(
			new PlaneGeometry(350, 350, 10, 10),
			new MeshStandardMaterial({
				color: 0xcccccc,
			})
		);
		this._ground.castShadow = false;
		this._ground.receiveShadow = true;
		this._ground.rotation.x = -Math.PI / 2;

		this._loadGroundTextures();

		this._scene.add(this._ground);

		this._mixers = [];
		this._previousRAF = null;

		window.addEventListener(
			"resize",
			() => {
				this._resize();
			},
			false
		);
		this._resize();
		this._loadAnimatedModel();

		this._raf = window.requestAnimationFrame(() => this._update());
	}

	async _loadGroundTextures() {
		let colorTexture = await loadTexture("/textures/floor/rubber_tiles_diff_1k.jpg");
		colorTexture.wrapS = RepeatWrapping;
		colorTexture.wrapT = RepeatWrapping;
		colorTexture.repeat.set(20, 20);
		this._ground.material.map = colorTexture;

		let dispTexture = await loadTexture("/textures/floor/rubber_tiles_disp_1k.jpg");
		this._ground.material.displacementMap = dispTexture;

		let armTexture = await loadTexture("/textures/floor/rubber_tiles_arm_1k.jpg");
		this._ground.material.aoMap = armTexture;
		this._ground.material.roughnessMap = armTexture;
		this._ground.material.metalnessMap = armTexture;

		let normalTexture = await loadTexture("/textures/floor/rubber_tiles_nor_gl_1k.jpg");
		this._ground.material.normalMap = normalTexture;
		this._ground.material.needsUpdate = true;
	}

	_loadAnimatedModel() {
		const params = {
			camera: this._camera,
			scene: this._scene,
		};
		this._controls = new BasicCharacterController(params);

		this._thirdPersonCamera = new ThirdPersonCameraController({
			camera: this._camera,
			target: this._controls,
			light: this._light,
		});
	}

	_loadAnimatedModelAndPlay(path, modelFile, animFile, offset) {
		const loader = new FBXLoader();
		loader.setPath(path);
		loader.load(modelFile, (fbx) => {
			fbx.scale.setScalar(0.1);
			fbx.traverse((c) => {
				c.castShadow = true;
			});
			fbx.position.copy(offset);

			const anim = new FBXLoader();
			anim.setPath(path);
			anim.load(animFile, (anim) => {
				const m = new AnimationMixer(fbx);
				this._mixers.push(m);
				const idle = m.clipAction(anim.animations[0]);
				idle.play();
			});
			this._scene.add(fbx);
		});
	}

	_loadModel() {
		const loader = new GLTFLoader();
		loader.load("/models/character.glb", (gltf) => {
			gltf.scene.traverse((c) => {
				c.castShadow = true;
			});
			this._scene.add(gltf.scene);
		});
	}

	_update = () => {
		requestAnimationFrame((t) => {
			if (this._previousRAF === null) {
				this._previousRAF = t;
			}

			this._update();

			this._renderer.render(this._scene, this._camera);
			this._step(t - this._previousRAF);
			this._previousRAF = t;
		});
	};

	_step(timeElapsed) {
		const timeElapsedS = timeElapsed * 0.001;
		if (this._mixers) {
			this._mixers.map((m) => m.update(timeElapsedS));
		}

		if (this._controls) {
			this._controls.Update(timeElapsedS);
		}

		this._thirdPersonCamera._update(timeElapsedS);
	}

	_resize() {
		this._viewport.width = window.innerWidth;
		this._viewport.height = window.innerHeight;

		this._renderer.setSize(this._viewport.width, this._viewport.height);
		this._camera.aspect = this._viewport.width / this._viewport.height;
		this._camera.updateProjectionMatrix();
	}

	_onSceneLoad() {
		console.log("loaded");
	}
}
