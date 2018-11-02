import * as argon2 from 'argon2';

export const hashPassword = async password => {
    const options = {
        timeCost: 4,
        memoryCost: 2 ** 13,
        parallelism: 2,
        type: argon2.argon2d,
    };

    let hash = null;
    try {
        hash = await argon2.hash(password, options);
    } catch (error) {
        console.log(error);

        return null;
    }

    return hash;
};

export const verifyPassword = async (hash, password) => {
    let verified = false;
    try {
        verified = await argon2.verify(hash, password);
    } catch (error) {
        console.log(error);

        return false;
    }

    return verified;
};
