export var MoveClientMode;
(function (MoveClientMode) {
    MoveClientMode[MoveClientMode["Disabled"] = 0] = "Disabled";
    MoveClientMode[MoveClientMode["ByDirection"] = 1] = "ByDirection";
    MoveClientMode[MoveClientMode["Drag"] = 2] = "Drag";
})(MoveClientMode || (MoveClientMode = {}));
export var Behavior;
(function (Behavior) {
    Behavior[Behavior["Direction"] = 0] = "Direction";
    Behavior[Behavior["Target"] = 1] = "Target";
})(Behavior || (Behavior = {}));
export var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Down"] = 3] = "Down";
    Direction[Direction["Left"] = 4] = "Left";
    Direction[Direction["Right"] = 2] = "Right";
    Direction[Direction["UpRight"] = 1.5] = "UpRight";
    Direction[Direction["DownRight"] = 2.5] = "DownRight";
    Direction[Direction["DownLeft"] = 3.5] = "DownLeft";
    Direction[Direction["UpLeft"] = 2.5] = "UpLeft";
})(Direction || (Direction = {}));
export var PlayerType;
(function (PlayerType) {
    PlayerType["Player"] = "player";
    PlayerType["Event"] = "event";
    PlayerType["Shape"] = "shape";
})(PlayerType || (PlayerType = {}));
//# sourceMappingURL=Player.js.map