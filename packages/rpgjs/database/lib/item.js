import { merge } from './common';
export function Item(options) {
    return merge(options, 'item', {
        price: options.price
    });
}
//# sourceMappingURL=item.js.map