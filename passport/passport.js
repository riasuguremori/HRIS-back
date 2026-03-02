import passport from 'passport'
import passportLocal from 'passport-local'
import passportJWT from 'passport-jwt'
import bcrypt from 'bcrypt'
import User from '../models/user.js'

passport.use(
	'login',
	new passportLocal.Strategy(
		{
			usernameField: 'account',
			passwordField: 'password',
		},
		async (account, password, done) => {
			try {
				const user = await User.findOne({ account }).orFail(new Error('帳號不存在'))
				const match = await bcrypt.compare(password, user.password)

				if (!match) {
					throw new Error('密碼錯誤')
				}
				done(null, user)
			} catch (error) {
				done(error)
			}
		},
	),
)

passport.use(
	'jwt',
	new passportJWT.Strategy(
		{
			jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET,
			passReqToCallback: true,
			ignoreExpiration: true,
		},
		async (req, payload, done) => {
			try {
				const token = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()(req)
				const expired = payload.exp * 1000 < Date.now()
				const url = req.baseUrl + req.path

				if (expired && url !== '/user/refresh' && url !== '/user/logout') {
					throw new Error('Token 已過期')
				}

				const user = await User.findOne({ _id: payload._id, tokens: token }).orFail(new Error('USER_NOT_FOUND'))

				done(null, { user, token })
			} catch (error) {
				done(error)
			}
		},
	),
)
