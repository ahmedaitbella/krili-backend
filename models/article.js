import mongoose from "mongoose";
import { Schema } from "mongoose";

const articleSchema = new Schema({
    title: { type: String, required: true },
    body:String,
    nubresOfLikes: { type: Number, default: 0 },
    dateCreated: { type: Date, default: Date.now }
});

const Article = mongoose.model('Article', articleSchema);

export default Article;