const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const newgame= new Schema({
    Matrix:{
        type:Array
    },
    palyertoken:{
        type:String
    },
    cplayer:{
        type:Boolean
    },
    Winner:{
        type:String
    },
    moves:{
        type:Array
    }
    
})
module.exports = game = mongoose.model('game',newgame);