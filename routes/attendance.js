import { Router } from 'express'
import * as attendance from '../controllers/attendance.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/checkIn', auth.token, attendance.checkIn)
router.get('/attendance', auth.token, attendance.getAttendance)
router.patch('/checkOut', auth.token, attendance.checkOut)

export default router
