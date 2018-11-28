import mongoose from 'mongoose'
import uuid from 'uuid/v4'

import { hashPassword } from '../../lib/auth/password.js'

export const OAUTH_PROVIDERS = ['FACEBOOK']

const Schema = mongoose.Schema
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
        userName: {
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
            min: [8, 'Your password must be atleast 8 characters long'],
            max: [15, 'Your password must be less than 15 characters long'],
            validate: {
                validator: function(password) {
                    const passwordRegex = new RegExp(
                        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/,
                        'i'
                    )

                    // Skip password validation if password is already hashed and hasn't changed
                    if (password.startsWith('$argon2d')) {
                        return true
                    }

                    return passwordRegex.test(password)
                },
                message:
                    'A valid password consists of atleast 1 uppercase letter, 1 special character, 1 number, and is between 8 - 15 characters long.',
            },
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
    { timestamps: true }
)

UserSchema.pre('save', async function(next) {
    // DEFAULT_OAUTH_PASSWORD is default password for oauth
    // want to keep it plain text until user creates the password
    if (this.password !== String(process.env.DEFAULT_OAUTH_PASSWORD)) {
        const hashedPassword = await hashPassword(this.password)
        this.password = hashedPassword
    }

    this.email = this.email.toLowerCase()
    this.id = this._id

    next()
})

export const model = mongoose.model('user', UserSchema)
