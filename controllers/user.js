import User from '../models/user.js'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import validator from 'validator'

export const create = async (req, res) => {
	try {
		const result = new User(req.body)
		await result.save()
		res.status(StatusCodes.CREATED).json({
			result: {
				account: result.account,
				role: result.role,
			},
		})
	} catch (error) {
		if (error.name === 'ValidationError') {
			const key = Object.keys(error.errors)[0]
			const message = error.errors[key].message
			res.status(StatusCodes.BAD_REQUEST).json({
				message,
			})
		} else if (error.name === 'MongoServerError' && error.code === 11000) {
			res.status(StatusCodes.CONFLICT).json({
				message: '帳號重複',
			})
		} else {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: '伺服器錯誤',
			})
		}
	}
}

export const login = async (req, res) => {
	try {
		const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, {
			expiresIn: '1 days',
		})
		req.user.tokens.push(token)
		await req.user.save()
		res.status(StatusCodes.OK).json({
			result: {
				_id: req.user._id,
				account: req.user.account,
				role: req.user.role,
				name: req.user.name,
				email: req.user.email,
				department: req.user.department,
				onboardDate: req.user.onboardDate,
				work: req.user.work,
				leaveQuota: req.user.leaveQuota,
				token,
			},
		})
	} catch (error) {
		console.log(error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: '伺服器錯誤',
		})
	}
}

export const profile = async (req, res) => {
	res.status(StatusCodes.OK).json({
		result: {
			_id: req.user._id,
			account: req.user.account,
			role: req.user.role,
			name: req.user.name,
			email: req.user.email,
			department: req.user.department,
			onboardDate: req.user.onboardDate,
			work: req.user.work,
			leaveQuota: req.user.leaveQuota,
		},
	})
}

export const refresh = async (req, res) => {
	try {
		const i = req.user.tokens.indexOf(req.token)
		const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, {
			expiresIn: '1 days',
		})
		req.user.tokens[i] = token
		await req.user.save()
		res.status(StatusCodes.OK).json({
			result: {
				token,
			},
		})
	} catch (error) {
		console.log(error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: '伺服器錯誤',
		})
	}
}

export const logout = async (req, res) => {
	try {
		const i = req.user.tokens.indexOf(req.token)
		req.user.tokens.splice(i, 1)
		await req.user.save()
		res.status(StatusCodes.OK).json({
			result: {},
		})
	} catch (error) {
		console.log(error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: '伺服器錯誤',
		})
	}
}

export const getUser = async (req, res) => {
	try {
		const result = await User.find().sort({ createdAt: -1 })
		res.status(StatusCodes.OK).json({
			result,
		})
	} catch (error) {
		console.log(error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '伺服器錯誤' })
	}
}

export const updateUser = async (req, res) => {
	try {
		if (!validator.isMongoId(req.params.id)) {
			throw new Error('ID')
		}

		const result = await User.findById(req.params.id).orFail(new Error('ID'))
		result.name = req.body.name || result.name
		result.email = req.body.email || result.email
		result.role = req.body.role || result.role
		result.department = req.body.department || result.department
		result.onboardDate = req.body.onboardDate || result.onboardDate
		if (req.body.work) {
			result.work.workStartTime = req.body.work.workStartTime || result.work.workStartTime
			result.work.workEndTime = req.body.work.workEndTime || result.work.workEndTime
		}
		if (req.body.leaveQuota) {
			result.leaveQuota.compLeave = req.body.leaveQuota.compLeave ?? result.leaveQuota.compLeave
		}
		await result.save()
		res.status(StatusCodes.OK).json({
			result,
		})
	} catch (error) {
		console.log(error)
		if (error.message === 'ID') {
			res.status(StatusCodes.NOT_FOUND).json({
				message: '找不到 ID',
			})
		} else {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '伺服器錯誤' })
		}
	}
}
