const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const QuestionSchema = new Schema(
    {
        title: {type: String, required: true, maxLength: 50},
        summary: {type: String, required: true, maxLength: 140},
        text: {type: String, required: true},
        tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}],
        answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}],
        comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
        asked_by: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        ask_date_time: {type: Date, default: Date.now},
        views: {type: Number, default: 0},
        upvoteUserList: [{type: Schema.Types.ObjectId, ref:'User'}],
        downvoteUserList: [{type: Schema.Types.ObjectId, ref:'User'}]
    }
);

QuestionSchema.virtual('url').get(function () {
    return 'posts/question/' + this._id
});

module.exports = mongoose.model('Question', QuestionSchema);