import { Schema, model } from 'mongoose'

const schema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'users',
	},
	date: {
		type: Date,
	},
	checkIn: {
		type: Date,
	},
	checkOut: {
		type: Date,
	},
	status: {
		type: String,
		enum: ['正常', '遲到', '早退', '曠職 / 缺勤'],
	},
},
{
	versionKey: false,
	timestamps: true,
})

export default model('attendances', schema)
