const mongoose = require('mongoose');
const placeSchema = new mongoose.Schema({
    owner:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    title:String,
    address: String,
    photos:[String],
    description: String,
    perks: [String],
    extrainfo: String,
    checkIn: Number,
    checkOut:Number,cd 
    maxGuests:Number,
});

const PlaceModel = mongoose.model('Place',placeSchema);
module.exports = PlaceModel