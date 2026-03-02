import { Router } from 'express'
import * as user from '../controllers/user.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', auth.token, auth.admin, user.create)
router.post('/login', auth.login, user.login)
router.get('/profile', auth.token, user.profile)
router.get('/getUser', auth.token, auth.admin, user.getUser)
router.patch('/refresh', auth.token, user.refresh)
router.patch('/updateUser/:id', auth.token, auth.admin, user.updateUser)
router.delete('/logout', auth.token, user.logout)

export default router
