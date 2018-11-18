import { reject, isEmpty } from '../lib/utils'

/**
 *
 * @param {Mongoose Model} model
 * @param {array} fields
 *
 * @returns An object with all model
 * properties except fields specified
 */
export function filteredModel(model, fields) {
    if (!model || isEmpty(model)) {
        throw new Error('Model param must be supplied.')
    }

    let fieldsToExclude = ['password', '_id', '__v', '$__', '$init', 'isNew']
    if (fields) {
        if (!Array.isArray(fields)) {
            throw new Error('Fields parameter must be an array.')
        }

        fieldsToExclude = [...fieldsToExclude, ...fields]
    }

    /**
     * If model param is an array of models loop through
     * and return the new array.
     */
    if (Array.isArray(model)) {
        return model.map(m =>
            isPlainObject(m)
                ? reject(m, fieldsToExclude)
                : reject(m.toObject(), fieldsToExclude)
        )
    }

    return reject(model.toObject(), fieldsToExclude)
}

/**
 * Check if object is plain or has extra properties
 * like a mongoose model.
 *
 * @param {object} obj
 *
 * @returns {boolean}
 */
function isPlainObject(obj) {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        obj.constructor === Object &&
        Object.prototype.toString.call(obj) === '[object Object]'
    )
}
