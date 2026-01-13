import { merge } from './common';
export function Skill(options) {
    if (!options.coefficient)
        options.coefficient = {
            'int': 1
        };
    return merge(options, 'skill');
}
//# sourceMappingURL=skill.js.map