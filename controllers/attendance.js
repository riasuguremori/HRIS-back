import Attendance from '../models/attendance.js'
import { StatusCodes } from 'http-status-codes'

export const checkIn = async (req, res) => {
	try {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		// 檢查今天是否已打卡
		const attendance = await Attendance.findOne({
			user: req.user._id,
			date: { $gte: today, $lt: tomorrow },
		})

		if (attendance) {
			return res.status(StatusCodes.BAD_REQUEST).json({ message: '今天已打卡' })
		}

		// 比較打卡時間與設定的上班時間
		const now = new Date()
		const currentHHMM = now.toLocaleTimeString('en-US', {
			timeZone: 'Asia/Taipei',
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
		})

		const workStartTime = req.user.work?.workStartTime || '09:00'

		let status = '正常'
		if (currentHHMM > '12:00') {
			status = '曠職 / 缺勤'
		} else if (currentHHMM > workStartTime) {
			status = '遲到'
		}

		const result = await Attendance.create({
			user: req.user._id,
			date: today,
			checkIn: now,
			status,
		})

		res.status(StatusCodes.OK).json({ result })
	} catch (error) {
		console.log(error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '伺服器錯誤' })
	}
}

export const checkOut = async (req, res) => {
	try {
		const now = new Date()
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		const workEndTime = req.user.work?.workEndTime || '18:00'

		const currentHHMM = now.toLocaleTimeString('en-US', {
			timeZone: 'Asia/Taipei',
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
		})

		// 尋找今天的紀錄且尚未下班
		const attendance = await Attendance.findOne({
			user: req.user._id,
			date: { $gte: today, $lt: tomorrow },
			checkOut: { $exists: false }, // 查詢 Field 是否存在
		})

		if (!attendance) {
			return res.status(StatusCodes.NOT_FOUND).json({ message: '找不到打卡紀錄或已下班' })
		}

		if (currentHHMM < workEndTime) {
			if (attendance.status === '正常' || attendance.status === '遲到') {
				attendance.status = '早退'
			}
		}

		attendance.checkOut = now
		await attendance.save()

		res.status(StatusCodes.OK).json({ result: attendance })
	} catch (error) {
		console.log(error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '伺服器錯誤' })
	}
}

export const getAttendance = async (req, res) => {
	try {
		const result = await Attendance.find({ user: req.user._id }).sort({ date: -1 })
		res.status(StatusCodes.OK).json({ result })
	} catch (error) {
		console.log(error)
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '伺服器錯誤' })
	}
}
