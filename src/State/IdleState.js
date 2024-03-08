import State from "./State";

export default class IdleState extends State {
	constructor(parent) {
		super(parent);
	}

	get Name() {
		return "Idle";
	}

	Enter(prevState) {
		const idleAction = this._parent._proxy._animations["Idle"].action;
		if (prevState) {
			const prevAction = this._parent._proxy._animations[prevState.Name].action;
			idleAction.time = 0.0;
			idleAction.enabled = true;
			idleAction.setEffectiveTimeScale(1.0);
			idleAction.setEffectiveWeight(1.0);
			idleAction.crossFadeFrom(prevAction, 0.5, true);
			idleAction.play();
		} else {
			idleAction.play();
		}
	}

	Exit() {}

	Update(_, input) {
		if (input._keys.forward) {
			this._parent.SetState("Walking");
		} else if (input._keys.backward) {
			this._parent.SetState("Back");
		} else if (input._keys.space) {
			this._parent.SetState("Jump");
		} else if (input._keys.q) {
			this._parent.SetState("Kick");
		} else if (input._keys.e) {
			this._parent.SetState("Punch");
		}
	}
}
