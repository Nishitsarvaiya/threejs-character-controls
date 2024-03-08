import State from "./State";

export default class BackState extends State {
	constructor(parent) {
		super(parent);
	}

	get Name() {
		return "Back";
	}

	Enter(prevState) {
		const curAction = this._parent._proxy._animations["Back"].action;
		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action;

			curAction.enabled = true;

			if (prevState.Name == "Running") {
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
		if (input._keys.forward || input._keys.backward) {
			if (input._keys.shift) {
				this._parent.SetState("Running");
			}
			return;
		}

		this._parent.SetState("Idle");
	}
}
