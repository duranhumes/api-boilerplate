import { reject } from '../lib/helpers/reject';
import { isEmpty } from '../lib/helpers/isEmpty';

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
        throw new Error('Model param must be supplied.');
    }

    let fieldsToExclude = ['password', '_id', '__v', '$__', '$init', 'isNew'];
    if (fields) {
        if (!Array.isArray(fields)) {
            throw new Error('Fields parameter must be an array.');
        }

        fieldsToExclude = [...fieldsToExclude, ...fields];
    }

    /**
     * If model param is an array of models loop through
     * and return the new array.
     */
    if (Array.isArray(model)) {
        return model.map(m => reject(m, fieldsToExclude));
    }

    const modelObj = model.toObject();

    return reject(modelObj, fieldsToExclude);
}
