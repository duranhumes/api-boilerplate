import jsonwebtoken from 'jsonwebtoken';

/**
 * @param {string} userId
 * @returns a JWT token from userId
 */
export const sign = userId => {
    if (!userId) {
        throw new Error('A Users ID is required to sign a JWT token.');
    }

    const timestamp = new Date().getTime();
    return jsonwebtoken.sign(
        {
            sub: userId,
            iat: timestamp,
        },
        String(process.env.JWT_SECRET),
        {
            expiresIn: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 * 1000, // One week
            issuer: String(process.env.JWT_ISSUER),
        },
    );
};

export const verify = token =>
    jsonwebtoken.verify(token, String(process.env.JWT_SECRET), {
        issuer: String(process.env.JWT_ISSUER),
    });
