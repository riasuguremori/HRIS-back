import LeaveRequest from '../models/leaveRequest.js'
import User from '../models/user.js'
import { StatusCodes } from 'http-status-codes'

export const create = async (req, res) => {
	try {
		const result = await LeaveRequest.create({
			...req.body,
			user: req.user._id,
			status: '待審核',
			attachment: req.file?.path || '',
		})
		res.status(StatusCodes.OK).json({ result })
	} catch (error) {
		console.log(error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '伺服器錯誤' })
	}
}

export const getAllLeaveRequest = async (req, res) => {
	try {
		const result = await LeaveRequest.find().populate('user', 'name').sort({ startTime: -1 })
		res.status(StatusCodes.OK).json({ result })
	} catch (error) {
		console.log(error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '伺服器錯誤' })
	}
}

export const getMyLeaveRequest = async (req, res) => {
	try {
		const result = await LeaveRequest.find({ user: req.user._id }).populate('user', 'name').sort({ startTime: -1 })
		res.status(StatusCodes.OK).json({ result })
	} catch (error) {
		console.log(error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '伺服器錯誤' })
	}
}

export const updateStatus = async (req, res) => {
	try {
		// 先找出原本資料
		const result = await LeaveRequest.findById(req.params.id)
		if (!result) {
			return res.status(StatusCodes.NOT_FOUND).json({ message: '找不到請假申請' })
		}

		const oldStatus = result.status
		const newStatus = req.body.status

		if (result.leaveType === '補休' && oldStatus !== newStatus) {
			const user = await User.findById(result.user)
			if (user) {
				const hours = result.totalHours || 0
				const days = hours / 8

				if (oldStatus !== '已同意' && newStatus === '已同意') {
					user.leaveQuota.compLeave -= days
				} else if (oldStatus === '已同意' && newStatus !== '已同意') {
					user.leaveQuota.compLeave += days
				}
				await user.save()
			}
		}

		result.status = newStatus
		result.approver = req.user._id
		result.comment = req.body.comment || result.comment
		await result.save()

		console.log('LeaveRequest status updated successfully')
		res.status(StatusCodes.OK).json({ result: result })
	} catch (error) {
		console.error('UpdateStatus Error:', error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '伺服器錯誤: ' + error.message })
	}
}
