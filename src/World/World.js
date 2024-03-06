import {
	ACESFilmicToneMapping,
	AmbientLight,
	AxesHelper,
	Color,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	SRGBColorSpace,
	Scene,
	WebGLRenderer,
} from "three";
import { FBXLoader, OrbitControls } from "three/examples/jsm/Addons";
import { loadModel } from "../helpers";
import BasicCharacterController from "../Controller/BasicCharacterController";

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
		this._camera.position.set(25, 40, 80);

		this._scene = new Scene();
		this._scene.background = new Color(0xfcfcfc);

		this._controls = new OrbitControls(this._camera, this._canvas);
		this._controls.target.set(0, 1, 0);
		this._controls.enableDamping = true;
		this._controls.update();

		let light = new DirectionalLight(0xffffff, 1.0);
		light.position.set(-100, 100, 100);
		light.target.position.set(0, 0, 0);
		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.width = 4096;
		light.shadow.mapSize.height = 4096;
		light.shadow.camera.near = 0.1;
		light.shadow.camera.far = 500.0;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 500.0;
		light.shadow.camera.left = 50;
		light.shadow.camera.right = -50;
		light.shadow.camera.top = 50;
		light.shadow.camera.bottom = -50;
		this._scene.add(light);

		light = new AmbientLight(0xffffff, 0.25);
		this._scene.add(light);

		// this._scene.add(new AxesHelper());
		const plane = new Mesh(
			new PlaneGeometry(200, 200, 10, 10),
			new MeshStandardMaterial({
				color: 0x4d4d4d,
			})
		);
		plane.castShadow = false;
		plane.receiveShadow = true;
		plane.rotation.x = -Math.PI / 2;
		this._scene.add(plane);

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

	_loadAnimatedModel() {
		const params = {
			camera: this._camera,
			scene: this._scene,
		};
		this._controls = new BasicCharacterController(params);
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
	}

	_resize() {
		this._viewport.width = window.innerWidth;
		this._viewport.height = window.innerHeight;

		this._renderer.setSize(this._viewport.width, this._viewport.height);
		this._camera.aspect = this._viewport.width / this._viewport.height;
		this._camera.updateProjectionMatrix();
	}
}
