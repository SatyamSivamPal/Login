import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import  dotenv from "dotenv"

dotenv.config()

// let nodeConfig = {
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: ENV.EMAIL, // generated ethereal user
//       pass: ENV.PASSWORD, // generated ethereal password
//     }
// }

// let transporter = nodemailer.createTransport(nodeConfig);

// let MailGenerator = new Mailgen ({
//     theme:"default",
//     product:{
//         name:"Mailgen",
//         link:"https://mailgen.js/"
//     }
// })

// export const registerMail = async(req,res) => {
//     const {username , userEmail , text , subjext} = req.body;

//     // body of email

//     var emailBody = MailGenerator.generate(email);

//     let message = {
//         from:ENV.EMAIL,
//         to:userEmail,
//         subject:subjext || "Signup successfully",
//         html: emailBody
//     }

//     //send mail
//     transporter.sendMail(message)
//         .then(() => {
//             return res.status(200).send({msg:"You should receive an email from us."})
//         })
//         .catch(error => res.status(500).send({error}))
// }

let config = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
};
let transporter = nodemailer.createTransport(config);

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
  },
});

export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  var email = {
    body: {
      name: username,
      intro:
        text ||
        "Welcome to the Doddle! We are very excited to have you on board.",
      outro:
        "Need help, or have question? Just reply to this email, we'd love to help.",
    },
  };

  var emailBody = MailGenerator.generate(email);

  let message = {
    from:process.env.EMAIL,
    to:userEmail,
    subject:subject || "Signup Sucessfully",
    html:emailBody
  }

  transporter.sendMail(message)
    .then(()=>{
        return res.status(200).send({msg:"You should receive an email from us"})
    })
    .catch(error => res.status(500).send({error}))
};
