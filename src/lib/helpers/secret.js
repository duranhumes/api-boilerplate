import crypto from 'crypto';
import uuid from 'uuid/v4';

export const createSecret = length => {
    const privateKey = uuid();

    const publicKey = crypto
        .createHmac('sha256', privateKey)
        .update('authorization')
        .digest('hex');

    let nonce = '';
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        nonce += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    console.log('Nonce: ', nonce);
    console.log('Pub Key: ', publicKey);
    return `${nonce}${publicKey}`;
};

createSecret(5);

export const verifySecret = (publicKey, privateKey, token) => {
    console.log(publicKey);
    console.log(privateKey);
    console.log(token);
    return true;
};
