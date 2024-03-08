import { LoopOnce } from "three";
import State from "./State";

export default class JumpState extends State {
	constructor(parent) {
		super(parent);

		this._FinishedCallback = (prevState) => {
			this._Finished(prevState);
		};
	}

	get Name() {
		return "Jump";
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations["Jump"].action;
		const mixer = curAction.getMixer();
		mixer.addEventListener("finished", () => this._FinishedCallback(prevState));

		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action;

			curAction.reset();
			curAction.setLoop(LoopOnce, 1);
			curAction.clampWhenFinished = true;
			curAction.crossFadeFrom(prevAction, 0.2, true);
			curAction.play();
		} else {
			curAction.play();
		}
	}

	_Finished(prevState) {
		this._Cleanup();
		this._parent.SetState(prevState.Name);
	}

	_Cleanup() {
		const action = this._parent._proxy._animations["Jump"].action;

		action.getMixer().removeEventListener("finished", this._CleanupCallback);
	}

	Exit() {
		this._Cleanup();
	}

	Update(_) {}
}
