import { Router } from 'express'
import { create, getAllLeaveRequest, getMyLeaveRequest, updateStatus } from '../controllers/leaveRequest.js'
import * as auth from '../middlewares/auth.js'
import { uploadAttachment } from '../middlewares/upload.js'

const router = Router()

router.post('/', auth.token, uploadAttachment, create)
router.get('/all', auth.token, auth.atLeastManager, getAllLeaveRequest)
router.get('/my', auth.token, getMyLeaveRequest)
router.patch('/:id', auth.token, updateStatus)

export default router
