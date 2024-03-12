import State from "./State";

export default class WalkingState extends State {
	constructor(parent) {
		super(parent);
	}

	get Name() {
		return "Walking";
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations["Walking"].action;
		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action;

			curAction.enabled = true;

			if (prevState.Name == "Running") {
				const ratio = curAction.getClip().duration / prevAction.getClip().duration;
				curAction.time = prevAction.time * ratio;
			} else {
				curAction.time = 0.0;
				curAction.setEffectiveTimeScale(1.0);
				curAction.setEffectiveWeight(1.0);
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
			if (input._keys.shift) {
				this._parent.SetState("Running");
			} else if (input._keys.space) {
				this._parent.SetState("Jump");
			}
			return;
		}

		this._parent.SetState("Idle");
	}
}
