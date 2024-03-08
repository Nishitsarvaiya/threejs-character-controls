import { LoopOnce } from "three";
import State from "./State";

export default class PunchState extends State {
	constructor(parent) {
		super(parent);

		this._FinishedCallback = () => {
			this._Finished();
		};
	}

	get Name() {
		return "Punch";
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations["Punch"].action;
		const mixer = curAction.getMixer();
		mixer.addEventListener("finished", this._FinishedCallback);

		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action;

			curAction.reset();
			curAction.setLoop(LoopOnce, 1);
			curAction.clampWhenFinished = true;
			curAction.crossFadeFrom(prevAction, 0.1, true);
			curAction.play();
		} else {
			curAction.play();
		}
	}

	_Finished() {
		this._Cleanup();
		this._parent.SetState("Idle");
	}

	_Cleanup() {
		const action = this._parent._proxy._animations["Punch"].action;

		action.getMixer().removeEventListener("finished", this._CleanupCallback);
	}

	Exit() {
		this._Cleanup();
	}

	Update(_) {}
}
