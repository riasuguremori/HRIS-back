import multer from 'multer'
import cloudinary from '../cloudinary/cloudinary.js'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { StatusCodes } from 'http-status-codes'

const upload = multer({
	storage: new CloudinaryStorage({
		cloudinary,
		params: {
			resource_type: 'auto',
		},
	}),
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
	fileFilter: (req, file, callback) => {
		if (
			[
				'image/png',
				'image/jpg',
				'image/jpeg',
				'application/pdf',
				'application/msword',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			].includes(file.mimetype)
		) {
			callback(null, true)
		} else {
			callback(new Error('不支援的文件格式'), false)
		}
	},
})

const attachment = upload.single('attachment')

export const uploadAttachment = (req, res, next) => {
	attachment(req, res, (error) => {
		if (error) {
			if (error instanceof multer.MulterError) {
				let message = ''
				if (error.code === 'LIMIT_FILE_SIZE') {
					message = '檔案太大 (限制 1MB)'
				} else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
					message = '檔案欄位錯誤或是數量過多'
				}
				return res.status(StatusCodes.BAD_REQUEST).json({
					message,
					error: error.code,
				})
			}
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: '上傳失敗',
				error: error.message,
			})
		}
		next()
	})
}
