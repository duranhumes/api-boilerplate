import mongoose from 'mongoose'
import uuid from 'uuid/v4'

import { hashPassword } from '../../lib/auth/password.js'

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
            min: [8, 'Your password must be atleast 8 characters'],
            max: 15,
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

    next()
})

export default mongoose.model('user', UserSchema)
