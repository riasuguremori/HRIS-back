import { Schema, model } from 'mongoose'

const schema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'users',
	},
	leaveType: {
		type: String,
		enum: ['特休', '病假', '事假', '補休'],
	},
	date: {
		type: Date,
	},
	startTime: {
		type: Date,
	},
	endTime: {
		type: Date,
	},
	totalHours: {
		type: Number,
	},
	attachment: {
		type: String,
	},
	status: {
		type: String,
		enum: ['待審核', '已同意', '已駁回', '已撤銷'],
	},
	approver: {
		type: Schema.Types.ObjectId,
		ref: 'users',
	},
	comment: {
		type: String,
	},
})

export default model('leaveRequests', schema)
