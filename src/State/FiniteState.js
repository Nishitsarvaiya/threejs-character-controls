import IdleState from "./IdleState";
import RunningState from "./RunningState";
import WalkingState from "./WalkingState";

export class FiniteStateMachine {
	constructor() {
		this._states = {};
		this._currentState = null;
	}

	_AddState(name, type) {
		this._states[name] = type;
	}

	SetState(name) {
		const prevState = this._currentState;

		if (prevState) {
			if (prevState.Name == name) {
				return;
			}
			prevState.Exit();
		}

		const state = new this._states[name](this);

		this._currentState = state;
		state.Enter(prevState);
	}

	Update(timeElapsed, input) {
		if (this._currentState) {
			this._currentState.Update(timeElapsed, input);
		}
	}
}

export class CharacterFSM extends FiniteStateMachine {
	constructor(proxy) {
		super();
		this._proxy = proxy;
		this._Init();
	}

	_Init() {
		this._AddState("Idle", IdleState);
		this._AddState("Walking", WalkingState);
		this._AddState("Running", RunningState);
	}
}
