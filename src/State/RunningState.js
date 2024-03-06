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
				curAction.setEffectiveWeight(1.0);
			}

			curAction.crossFadeFrom(prevAction, 0.5, true);
			curAction.play();
		} else {
			curAction.play();
		}
	}

	Exit() {}

	Update(timeElapsed, input) {
		if (input._keys.forward || input._keys.backward) {
			if (!input._keys.shift) {
				this._parent.SetState("Walking");
			}
			return;
		}

		this._parent.SetState("Idle");
	}
}
