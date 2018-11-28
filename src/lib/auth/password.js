import * as argon2 from 'argon2'

import { promisify } from '../utils'

export async function hashPassword(password) {
    if (!password) {
        throw new Error('Password must be supplied.')
    }

    const options = {
        timeCost: 4,
        memoryCost: 2 ** 13,
        parallelism: 2,
        type: argon2.argon2id,
    }

    const [hash, hashErr] = await promisify(argon2.hash(password, options))
    if (hashErr) {
        throw new Error(hashErr)
    }

    return hash
}

export async function verifyPassword(hash, password) {
    if (!hash || !password) {
        throw new Error(
            'Both the original hash and password to be compared with must be provided.'
        )
    }

    const [verified, verifiedErr] = await promisify(
        argon2.verify(hash, password)
    )
    if (verifiedErr) {
        return false
    }

    return verified
}
