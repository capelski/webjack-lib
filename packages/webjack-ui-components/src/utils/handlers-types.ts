// We use classes instead of interfaces because of the Vue props type doesn't admit interfaces

export class PlayerActionsHandlers {
    constructor(public double: Function, public hit: Function, public stand: Function, public split: Function) {}
}

export class ActionsBarHandlers extends PlayerActionsHandlers {
    constructor(public exitTable: Function, public startRound: Function, double: Function, hit: Function, stand: Function, split: Function) {
        super(double, hit, stand, split);
    }
}
