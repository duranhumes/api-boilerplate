import { reject } from '../../lib/helpers/reject';
import { pick } from '../../lib/helpers/pick';

/**
 *
 * @param {Mongoose Model} user
 * @param {array} fields
 *
 * @returns An object with all user
 * properties except fields specified
 */
export function filteredUser(user, fields) {
    if (!user) {
        throw new Error('User param must be supplied.');
    }

    let fieldsToExclude = ['password', '_id', '__v', '$__', '$init', 'isNew'];
    if (fields) {
        if (!Array.isArray(fields)) {
            throw new Error('Fields parameter must be an array.');
        }

        fieldsToExclude = [...fieldsToExclude, ...fields];
    }

    /**
     * If user param is an array of users loop through
     * and return the new array.
     */
    if (Array.isArray(user)) {
        return user.map(u => {
            u = u.toObject();
            // Filter out fields for oauthProviders array
            if (u.oauthProviders) {
                if (u.oauthProviders.length > 0) {
                    return {
                        oauthProviders: [
                            ...u.oauthProviders.map(provider =>
                                pick(provider, ['id', 'type']),
                            ),
                        ],
                        ...reject(u, [...fieldsToExclude, 'oauthProviders']),
                    };
                }
            }

            return {
                ...reject(u, fieldsToExclude),
            };
        });
    }

    if (typeof user === 'object') {
        user = user.toObject();
        // Filter out fields for oauthProviders array
        if (user.oauthProviders) {
            if (user.oauthProviders.length > 0) {
                return {
                    oauthProviders: [
                        ...user.oauthProviders.map(provider =>
                            pick(provider, ['id', 'type']),
                        ),
                    ],
                    ...reject(user, [...fieldsToExclude, 'oauthProviders']),
                };
            }
        }

        return reject(user, fieldsToExclude);
    } else {
        throw new Error('User data must be an object');
    }
}
