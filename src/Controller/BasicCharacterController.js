import * as THREE from "three";
import BasicCharacterControllerInput from "./BasicCharacterControllerInput";
import BasicCharacterControllerProxy from "./BasicCharacterControllerProxy";
import { FBXLoader, GLTFLoader } from "three/examples/jsm/Addons";
import { CharacterFSM } from "../State/FiniteState";

export default class BasicCharacterController {
	constructor(params) {
		this._Init(params);
	}

	get Position() {
		return this._position;
	}

	get Rotation() {
		if (!this._target) {
			return new THREE.Quaternion();
		}
		return this._target.quaternion;
	}

	_Init(params) {
		this._params = params;
		this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
		this._acceleration = new THREE.Vector3(1, 0.25, 75.0);
		this._velocity = new THREE.Vector3(0, 0, 0);
		this._position = new THREE.Vector3();

		this._animations = {};
		this._input = new BasicCharacterControllerInput();
		this._stateMachine = new CharacterFSM(new BasicCharacterControllerProxy(this._animations));

		this._LoadModels();
	}

	_LoadModels() {
		const loader = new FBXLoader();
		loader.setPath("/models/");
		loader.load("ninja.fbx", (fbx) => {
			fbx.traverse((c) => {
				c.castShadow = true;
			});

			this._target = fbx;
			this._params.scene.add(this._target);

			this._mixer = new THREE.AnimationMixer(this._target);

			this._manager = new THREE.LoadingManager();
			this._manager.onLoad = () => {
				this._stateMachine.SetState("Idle");
			};

			const _OnLoad = (animName, anim) => {
				const clip = anim.animations[0];
				const action = this._mixer.clipAction(clip);

				this._animations[animName] = {
					clip: clip,
					action: action,
				};
			};

			const loader = new FBXLoader(this._manager);
			loader.setPath("/animations/");
			loader.load("Walking.fbx", (a) => {
				_OnLoad("Walking", a);
			});
			loader.load("Running.fbx", (a) => {
				_OnLoad("Running", a);
			});
			loader.load("Idle.fbx", (a) => {
				_OnLoad("Idle", a);
			});
			loader.load("Back.fbx", (a) => {
				_OnLoad("Back", a);
			});
			loader.load("Kick.fbx", (a) => {
				_OnLoad("Kick", a);
			});
			loader.load("Punch.fbx", (a) => {
				_OnLoad("Punch", a);
			});
			loader.load("Jump.fbx", (a) => {
				_OnLoad("Jump", a);
			});
			loader.load("Roll.fbx", (a) => {
				_OnLoad("Roll", a);
			});
		});
	}

	Update(timeInSeconds) {
		if (!this._target) {
			return;
		}

		this._stateMachine.Update(timeInSeconds, this._input);

		const velocity = this._velocity;
		const frameDecceleration = new THREE.Vector3(
			velocity.x * this._decceleration.x,
			velocity.y * this._decceleration.y,
			velocity.z * this._decceleration.z
		);
		frameDecceleration.multiplyScalar(timeInSeconds);
		frameDecceleration.z =
			Math.sign(frameDecceleration.z) * Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

		velocity.add(frameDecceleration);

		const controlObject = this._target;
		const _Q = new THREE.Quaternion();
		const _A = new THREE.Vector3();
		const _R = controlObject.quaternion.clone();

		const acc = this._acceleration.clone();
		if (this._input._keys.shift) {
			acc.multiplyScalar(2.5);
		}

		if (this._stateMachine._currentState && this._stateMachine._currentState.Name == "Roll") {
			acc.multiplyScalar(1.25);
		}

		if (this._input._keys.forward) {
			velocity.z += acc.z * timeInSeconds;
		}

		if (this._input._keys.backward) {
			velocity.z -= acc.z * timeInSeconds;
		}
		if (this._input._keys.left) {
			_A.set(0, 1, 0);
			_Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
			_R.multiply(_Q);
		}
		if (this._input._keys.right) {
			_A.set(0, 1, 0);
			_Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
			_R.multiply(_Q);
		}

		controlObject.quaternion.copy(_R);

		const oldPosition = new THREE.Vector3();
		oldPosition.copy(controlObject.position);

		const forward = new THREE.Vector3(0, 0, 1);
		forward.applyQuaternion(controlObject.quaternion);
		forward.normalize();

		const sideways = new THREE.Vector3(1, 0, 0);
		sideways.applyQuaternion(controlObject.quaternion);
		sideways.normalize();

		sideways.multiplyScalar(velocity.x * timeInSeconds);
		forward.multiplyScalar(velocity.z * timeInSeconds);

		controlObject.position.add(forward);
		controlObject.position.add(sideways);

		this._position.copy(controlObject.position);

		if (this._mixer) {
			this._mixer.update(timeInSeconds);
		}
	}
}
