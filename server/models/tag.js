const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TagSchema = new Schema(
    {
        name: {type: String, required: true},
        creator: {type: Schema.Types.ObjectId, ref: 'User'}
    }
);

TagSchema.virtual('url').get(function () {
    return 'posts/tag/'  + this._id
});

module.exports = mongoose.model('Tag', TagSchema);