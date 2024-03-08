import { LoopOnce } from "three";
import State from "./State";

export default class KickState extends State {
	constructor(parent) {
		super(parent);

		this._FinishedCallback = () => {
			this._Finished();
		};
	}

	get Name() {
		return "Kick";
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations["Kick"].action;
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
		const action = this._parent._proxy._animations["Kick"].action;

		action.getMixer().removeEventListener("finished", this._CleanupCallback);
	}

	Exit() {
		this._Cleanup();
	}

	Update(_) {}
}
