import { merge } from './common';
export function Weapon(options) {
    return merge(options, 'weapon', {
        price: options.price
    });
}
//# sourceMappingURL=weapon.js.map