import mongoose from 'mongoose';
import uuid from 'uuid/v4';
import { hashPassword } from '../../lib/auth/password.js';

const OAUTH_PROVIDERS = ['GOOGLE', 'FACEBOOK'];

const Schema = mongoose.Schema;
const UserSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            default: uuid(),
        },
        firstName: {
            type: String,
            default: null,
        },
        lastName: {
            type: String,
            default: null,
        },
        username: {
            type: String,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            min: [6, 'Your password must be atleast 6 characters'],
            max: 32,
        },
        profilePhoto: {
            type: String,
            default: null,
        },
        oauthProviders: [
            {
                id: {
                    type: String,
                    required: true,
                },
                type: {
                    type: String,
                    required: true,
                    enum: OAUTH_PROVIDERS,
                },
            },
        ],
    },
    { timestamps: true },
);

UserSchema.pre('save', async function(next) {
    // DEFAULT_OAUTH_PASSWORD is default password for oauth
    // want to keep it plain text until user creates the password
    if (this.password !== String(process.env.DEFAULT_OAUTH_PASSWORD)) {
        const hashedPassword = await hashPassword(this.password);
        this.password = hashedPassword;
    }

    this.email = this.email.toLowerCase();
    this.id = uuid();

    next();
});

export default mongoose.model('User', UserSchema);
