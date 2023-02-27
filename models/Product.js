const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'UserId'
    },
    name: String,
    category: [String],
    images: [String],
    price: Number,
    description: String,
    highlights: [String],
})

const ProductModel = mongoose.model('product', ProductSchema);

module.exports = ProductModel;