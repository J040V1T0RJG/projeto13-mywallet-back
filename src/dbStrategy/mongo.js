import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv"

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db(process.env.MONGO_DATABASE_NAME);
}).catch(() => {
    console.log("Deu pau ao entrar no banco de dados!!!")
});

//const objectId = ObjectId;

export { db, ObjectId };