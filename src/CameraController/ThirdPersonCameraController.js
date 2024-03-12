import * as THREE from "three";

export default class ThirdPersonCameraController {
	constructor(params) {
		this._params = params;
		this._camera = params.camera;
		this._currentCameraPosition = new THREE.Vector3();
		this._currentCameraLookat = new THREE.Vector3();
	}

	_calculateIdealOffset() {
		const idealOffset = new THREE.Vector3(-6, 26, -35);
		idealOffset.applyQuaternion(this._params.target.Rotation);
		idealOffset.add(this._params.target.Position);
		return idealOffset;
	}

	_calculateIdealLookat() {
		const idealLookat = new THREE.Vector3(0, 10, 50);
		idealLookat.applyQuaternion(this._params.target.Rotation);
		idealLookat.add(this._params.target.Position);
		return idealLookat;
	}

	_update(timeElapsed) {
		const idealOffset = this._calculateIdealOffset();
		const idealLookat = this._calculateIdealLookat();

		// const t = 0.05;
		// const t = 4.0 * timeElapsed;
		const t = 1.0 - Math.pow(0.001, timeElapsed);

		this._currentCameraPosition.lerp(idealOffset, t);
		this._currentCameraLookat.lerp(idealLookat, t);

		this._camera.position.copy(this._currentCameraPosition);
		this._camera.lookAt(this._currentCameraLookat);
	}
}
