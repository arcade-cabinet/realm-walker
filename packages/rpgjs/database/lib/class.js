import { merge } from './common';
export var ClassHooks;
(function (ClassHooks) {
    ClassHooks["onSet"] = "onSet";
    ClassHooks["canEquip"] = "canEquip";
})(ClassHooks || (ClassHooks = {}));
export function Class(options) {
    return merge(options, 'class');
}
//# sourceMappingURL=class.js.map