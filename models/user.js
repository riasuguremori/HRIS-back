import { Schema, Error, model } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

const schema = new Schema(
	{
		account: {
			type: String,
			required: [true, '帳號必填'],
			minlength: [4, '最少 4 個字'],
			maxlength: [20, '最多 20 個字'],
			unique: true,
			trim: true,
			validate: {
				validator(value) {
					return validator.isAlphanumeric(value)
				},
				message: '帳號只能是英數字',
			},
		},
		password: {
			type: String,
			required: [true, '密碼必填'],
		},
		role: {
			type: String,
			enum: ['admin', 'manager', 'employee'],
			default: 'employee',
		},
		tokens: {
			type: [String],
		},
		name: {
			type: String,
		},
		email: {
			type: String,
		},
		department: {
			type: String,
		},
		onboardDate: {
			type: Date,
		},
		leaveQuota: {
			compLeave: { type: Number, default: 0 },
		},
		work: {
			workStartTime: {
				type: String,
				default: '09:00',
			},
			workEndTime: {
				type: String,
				default: '18:00',
			},
		},
	},
	{
		versionKey: false,
		timestamps: true,
	},
)

schema.pre('save', async function () {
	const user = this

	if (user.isModified('password')) {
		let message = ''
		if (user.password.length < 4) {
			message = '最少 4 個字'
		} else if (user.password.length > 20) {
			message = '最多 20 個字'
		} else if (!validator.isAscii(user.password)) {
			message = '密碼只能是英、數字、特殊符號'
		}

		if (message !== '') {
			const error = new Error.ValidationError()
			error.addError('password', new Error.ValidatorError({ message, path: 'password' }))
			throw error
		}

		user.password = bcrypt.hashSync(user.password, 10)
	}

	if (user.isModified('tokens') && user.tokens.length > 5) {
		user.tokens.shift()
	}
})

export default model('users', schema)
