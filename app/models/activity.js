const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
   info : {
       id : {
           type : mongoose.Schema.Types.ObjectId,
           ref : "book",
       },
       title : String,
   },
   
    category : String,
    
    time : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "issue",
        },
        returnDate : Date,
        issueDate : Date,
    },
    
    user_id : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user",
        },
        reg_no: String,
    },
    
    fine : {
        amount : Number,
        date : Date,
    },
    
    entryTime : {
        type : Date,
        default : Date.now(),
    }
});

module.exports =  mongoose.model("activity", activitySchema);