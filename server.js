import {connectToMongo} from "./src/config/databaseConfig.js"
import http from "http"
import env from 'dotenv'
import { app } from "./src/index.js";

env.config();

const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL || 4000;
const server = http.createServer(app);

await connectToMongo(MONGO_URL).catch((error)=>{
   console.log("Unexpected Error : ", error);
   process.exit(1);
})

server.listen(PORT,()=>{
   console.log("Server Runnig On Port : ",PORT);
   
})