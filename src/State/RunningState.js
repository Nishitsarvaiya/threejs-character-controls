import State from "./State";

export default class RunningState extends State {
	constructor(parent) {
		super(parent);
	}

	get Name() {
		return "Running";
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations["Running"].action;
		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action;

			curAction.enabled = true;

			if (prevState.Name == "Walking") {
				const ratio = curAction.getClip().duration / prevAction.getClip().duration;
				curAction.time = prevAction.time * ratio;
			} else {
				curAction.time = 0.0;
				curAction.setEffectiveTimeScale(1.0);
				curAction.setEffectiveWeight(2.0);
			}

			curAction.crossFadeFrom(prevAction, 0.2, true);
			curAction.play();
		} else {
			curAction.play();
		}
	}

	Exit() {}

	Update(timeElapsed, input) {
		if (input._keys.forward) {
			if (!input._keys.shift) {
				this._parent.SetState("Walking");
			}
			if (input._keys.space) {
				this._parent.SetState("Roll");
			}
			return;
		}

		this._parent.SetState("Idle");
	}
}
