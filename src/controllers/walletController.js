import { stripHtml } from "string-strip-html";
import Trim from "trim";
import dayjs from "dayjs"

import {db} from "../dbStrategy/mongo.js"

async function addDataToWallet (request, response) {
    const today = dayjs().format("DD/MM")
    
    let dataEntry = {
        value: Trim(stripHtml(request.body.value).result),
        description: Trim(stripHtml(request.body.description).result),
        type: request.body.type,
        time: today,
        userId: request.body.id
    };
    console.log("dataEntry", dataEntry)


    try {
        await db.collection("wallet").insertOne(dataEntry);
        response.sendStatus(200);
    } catch (error) {
        response.status(500).send(error)
    };
};

async function returnWalletData (request, response) {
    const { authorization, id } = request.headers;
    const token = Trim(authorization?.replace("Bearer", ""))
    console.log("request autori: ", token)
    try {
        const tokenExist = await db.collection("sessions").find({token: token});
        if (!tokenExist) {
            response.status(404).send("token invalido e/ou não existente");
        }

        const dataList = await db.collection("wallet").find({userId: id}).toArray();
        //console.log("dataList", dataList)


        response.send(dataList)
    } catch (error) {
        response.status(500).send(error)
    };
};

export { addDataToWallet, returnWalletData };