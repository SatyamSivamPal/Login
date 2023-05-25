import UserModel from "../model/User.model.js"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import otpGenerator from 'otp-generator'

dotenv.config()

// middle ware for verify user
export async function verifyUser (req,res,next){
    try {
        const {username} = req.method == "GET" ? req.query : req.body;

        //check user existence
        let exist = await UserModel.findOne({username});
        if(!exist) return res.status(404).send({error:"Can't find User!"});
        next();

    } catch (error) {
        return res.status(404).send({error:"Authentication error"})
    }
}

// POST register
export async function register(req , res) {
    try {
        const {username , password , profile , email } = req.body;

        // check the existing user
        const existUsername = new Promise ((resolve ,reject) => {
            UserModel.findOne({username} , function (err , user) {
                if(err) reject (new Error(err))
                if(user) reject ({error : "Please use unique username"});

                resolve();
            })
        })

        // check the existing email
        const existEmail = new Promise ((resolve ,reject) => {
            UserModel.findOne({email} , function (err , email) {
                if(err) reject (new Error(err))
                if(email) reject ({error : "Please use unique email"});

                resolve();
            })
        })

        Promise.all([existUsername , existEmail])
        .then(()=> {
            if(password){
                bcrypt.hash(password , 10)
                    .then(hashedPassword => {
                        const user = new UserModel ( {
                            username,
                            password:hashedPassword,
                            profile:profile || '',
                            email
                        })

                        //return save result as response
                        user.save()
                            .then(result => res.status(201).send({msg:"User register sucessfully"}))
                            .catch(error => res.status(500).send({error}))

                    }).catch(error => {
                        return res.status(500).send({
                            error:"Enable to hashed password"
                        })
                    })
            }
        }).catch(error => {
            return res.status(500).send({ error })
        })

    } catch (error) {
        return res.status(501).send({error});
    }
}

//POST login
export async function login(req , res) {
    const {username , password} = req.body;

    try {
        UserModel.findOne({username})
        .then(user => {
            bcrypt.compare(password , user.password)
                .then(passwordCheck => {
                    if(!passwordCheck) return res.status(400).send({error : "Don't have password"})

                    //create jwt token 
                   const token =  jwt.sign({
                                userId : user._id,
                                username:user.username
                            }, process.env.JWT_SECRET , {expiresIn : "24h"})
                    return res.status(200).send({
                        msg:"Login successfully...!",
                        username:user.username,
                        token
                    });
                })
                .catch(error => {
                    return res.status(404).send({error:"Password does not Match"})
                })
        })
        .catch( error => {
            return res.status(404).send({error:"Username not found"})
        })
    } catch (error) {
        return res.status(500).send({error});
    }
}

//GET user
export async function getUser(req , res) {
    const { username } = req.params;

    try {
        if(!username) return res.status(404).send({error:"Invalid Username"})

        UserModel.findOne({username} , function(err , user){
            if(err) return res.status(500).send({err})
            if(!user) return res.status(501).send({error:"Couldn't find the user"})

            //remove password from user
            //mongoose return unnecessary data with object so convert it into JSON

            const {password , ...rest } = Object.assign({} , user.toJSON());

            return res.status(201).send(rest)
        })
    } catch (error) {
        return res.status(404).send({error:"Cannot Find user data"})
    }
}

//update user (PUT)
export async function updateUser(req , res) {
    try {
        // const id  = req.query.id;
        const { userId } = req.user;
        if(userId)
        {
            const body = req.body;

            //update the data
            UserModel.updateOne({_id : userId } , body , function(err , data){
                if(err) throw err;

                return res.status(201).send({msg:"Record Updated..!"})
            })
        }else{
            return res.status(401).send({error:"User not found..!"})
        }
    } catch (error) {
        res.status(401).send({error})
    }
}


// generate otp (GET)
export async function generateOTP(req , res) {
    req.app.locals.OTP = await otpGenerator.generate(6 , {lowerCaseAlphabets:false , upperCaseAlphabets:false , specialChars:false})
    res.status(201).send({code:req.app.locals.OTP})
}


//verify otp (get)
export async function verifyOTP(req , res) {
    const {code} = req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null;  // reset the OTP value
        req.app.locals.resetSession = true //start session for reset password
        return res.status(201).send({msg:"Verify Successfully"})
    }
    return res.status(400).send({error:"Invalid OTP"})
}

//sucessfully redirect user when OTP is valid (GET)
export async function createResetSession(req,res) {
    if(req.app.locals.resetSession){
         //allow access to this roue only once
        return res.status(201).send({flag : req.app.locals.resetSession})
    }
    return res.status(440).send({error:"Session expired"})
}


//reset password (PUT)
export async function resetPassword(req,res) {
    try {
        if(!req.app.locals.resetSession) return res.status(440).send({error:"Session expired"})
        const {username , password} = req.body;

        try {
            UserModel.findOne({username})
                .then(user => {
                    bcrypt.hash(password , 10)
                        .then(hashedPassword => {
                            UserModel.updateOne({username:user.username} , 
                            {password:hashedPassword} ,function(err , data){
                                if(err) throw err;
                                req.app.locals.resetSession = false;
                                return res.status(201).send({msg:"Record Updated...!"})
                            })
                        })
                        .catch(e => {
                            return res.status(500).send({error:"Enable to hashed password"})
                        })
                })
                .catch(error => {
                    return res.status(404).send({error:"USername not found"})
                })
        } catch (error) {
            return res.status(500).send({error})
        }
    } catch (error) {
        return res.status(401).send({error})
    }
}