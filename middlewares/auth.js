import passport from 'passport'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

export const login = (req, res, next) => {
	passport.authenticate('login', { session: false }, (error, user, info) => {
		if (error || !user) {
			if (error?.message === '帳號不存在' || error?.message === '密碼錯誤' || info?.message === 'Missing credentials') {
				res.status(StatusCodes.UNAUTHORIZED).json({
					message: '帳號或密碼錯誤',
				})
			} else {
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					message: '伺服器錯誤',
				})
			}
		} else {
			req.user = user
			next()
		}
	})(req, res, next)
}

export const token = (req, res, next) => {
	passport.authenticate('jwt', { session: false }, (error, data, info) => {
		if (error || !data) {
			if (info instanceof jwt.JsonWebTokenError || error?.message === 'EXP' || error?.message === 'USER_NOT_FOUND') {
				res.status(StatusCodes.UNAUTHORIZED).json({
					message: '身分驗證失敗',
				})
			} else {
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					message: '伺服器錯誤',
				})
			}
		} else {
			req.user = data.user
			req.token = data.token
			next()
		}
	})(req, res, next)
}

export const admin = (req, res, next) => {
	if (req.user.role !== 'admin') {
		res.status(StatusCodes.FORBIDDEN).json({
			message: '無權限',
		})
	} else {
		next()
	}
}

export const atLeastManager = (req, res, next) => {
	if (req.user.role !== 'admin' && req.user.role !== 'manager') {
		res.status(StatusCodes.FORBIDDEN).json({
			message: '無權限',
		})
	} else {
		next()
	}
}
