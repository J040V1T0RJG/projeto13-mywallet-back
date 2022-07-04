import Joi from "joi";
import { stripHtml } from "string-strip-html";
import Trim from "trim";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

import {db} from "../dbStrategy/mongo.js"

async function loginUser (request, response) {
    const { email, password } = request.body;
    let newToken = uuid()
    const now = Date.now()
    console.log("request: ", request.body)
    console.log("request.email: ", email)
    console.log("token1: ", newToken)
  try {
    const checkEmail = await db.collection("users").findOne({email: email});
    console.log("check: ", checkEmail)

    if (!checkEmail || !bcrypt.compareSync(password, checkEmail.password) ) {
        response.status(404).send("E-mail e/ou senha incorreto(s)");
        return;
    };
    console.log("check checkEmail._id", checkEmail._id)

    let session = {
        token: newToken,
        userId: checkEmail._id,
        lastTime: now
    }

    console.log("chech1", checkEmail._id)
    let teste = await db.collection("sessions").findOne({userId: checkEmail._id})

    if (!teste) {
        await db.collection("sessions").insertOne(session)
    };
    console.log("teste", teste)

    console.log("antes da variavel ValidToken")
    const validToken = now >= teste?.lastTime + (3600 * 1000);
    console.log("validtoken", validToken);

    if (validToken) {
        await db.collection("sessions").updateOne({userId: checkEmail._id}, {$set: session});
    } else {
        const { token } = await db.collection("sessions").findOne({userId: checkEmail._id});
        console.log("tojekkk: ", token)
        newToken = token;
    };
    response.status(200).send({
        user:{
            id: checkEmail._id,
            userName: checkEmail.name,
            email: checkEmail.email
        },
        token: newToken,
    });

  } catch (error) {
    response.status(500).send(error)
  }
};

async function createUser (request, response) {
    let dataSignup = {
        name: Trim(stripHtml(request.body.name).result),
        email: Trim(stripHtml(request.body.email).result),
        password: request.body.password,
        confirmPassword: request.body.confirmPassword
    };

    const signupSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        confirmPassword: Joi.string().valid(request.body.password).required()
    });
    const { error } = signupSchema.validate(dataSignup, { abortEarly: false});

    if (error) {
        response.status(422).send("Dados invalidos, tente novamente");
        return;
    };

    let encryptedPassword = bcrypt.hashSync(dataSignup.password, 10);
    dataSignup = {
                    name: dataSignup.name,
                    email: dataSignup.email,
                    password: encryptedPassword
    };
    try {
        const checkEmail = await db.collection("users").findOne({email: dataSignup.email});
        if (checkEmail) {
            response.status(409).send("E-mail já cadastrado, cadastre outro ou faça login");
            return;
        };

        await db.collection("users").insertOne(dataSignup);
        response.status(200).send("Usuario cadastrado com sucesso");
    } catch (error) {
        response.status(500).send(error);
    };
};

export { loginUser, createUser };