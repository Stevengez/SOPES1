const { Schema, model } = require('mongoose');

const operationSchema = new Schema({
    left: { type: Number },
    operator: { type: String },
    right: { type: Number }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('Operation', operationSchema);