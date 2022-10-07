const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AnswerSchema = new Schema(
    {
        text: {type: String, required: true},
        ans_by: {type: String, required: true},
        ans_date_time: {type: Date, default: Date.now},
        comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
        upvoteUserList: [{type: Schema.Types.ObjectId, ref:'User'}],
        downvoteUserList: [{type: Schema.Types.ObjectId, ref:'User'}]
    }
);

AnswerSchema.virtual('url').get(function () {
    return 'posts/answer/' + this._id
});

module.exports = mongoose.model('Answer', AnswerSchema);