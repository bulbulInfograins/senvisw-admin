const Admin = require('../model/admin');
const Contact = require('../model/contactus')

var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
// const localstorage = require('node-localstorage').LocalStorage;



var express = require("express");
var app = express();

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))


async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}
async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.adminSignup = async (req, res) => {
    try {
        const {
            user_name,
            email,
            password,
            confirm_password
        } = req.body
        const hashedPassword = await hashPassword(password);
        const newUser = new Admin({
            user_name: user_name,
            email: email,
            password: hashedPassword,
            confirm_password: confirm_password
        });

        var adminData = await Admin.find({ email: req.body.email })
        if (adminData.length > 0) {
            return res.json({ statusCode: 400, message: "Email alerady exist" })
        }
        let response = new Admin(newUser)
        response.save()
        .then((result) => {
            return res.json({ statusCode: "200", statusMsj: "Successfuly Register", data: result })
        }).catch((err) => {
            console.log(err)
            return res.send(err)
        })
    } catch (error) {
        console.log(error)
        return res.send(error)
    }
}

exports.adminlogin = async (req, res, next) => {
    try {
        var email = req.body.email;
        var password = req.body.password;
        const admin = await Admin.findOne({ email: email });

        if (!admin) {
            return res.json({ statusCode: 401, statusMsj: "Enter valid Email" })
        }
        else {
            const validPassword = await validatePassword(password, admin.password);
            if (!validPassword) {
                return res.json({ statusCode: 402, statusMsj: "Password mismatch" })
            }
            else {
                const accessToken = jwt.sign({
                    adminId: admin._id
                }, 'bulbul', {
                        expiresIn: "1d"
                    });
                await Admin.findByIdAndUpdate(admin._id, {
                    accessToken
                })
                console.log(accessToken)
                return res.json({ statusCode: 200, statusMsj: "login sussessfully", access: accessToken })
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({ statusCode: 400, message: "login failed" })
    }
}

exports.send_message = async (req, res, next) => {
    var userData = {       
        Name: req.body.name,
        email: req.body.email,
        phone:  req.body.phone,
        subject: req.body.subject,
        message: req.body.message
    }
    console.log("userData",userData)
   
    let transporter = nodemailer.createTransport(
        {
            service: "gmail",
            secure: false, 
            auth: {
                user: "bulbul.infograins@gmail.com", 
                pass: "BulBul@123" 
               
            },
            tls: { rejectUnauthorized: false }
        }
    );
    
    let mailOptions = {
        from: userData.email,
        to: "vipin.infograins@gmail.com", 
        cc:"hr.infograins@gmail.com",
        // to: "bulbulbagwan918@gmail.com",
        subject: userData.subject, 
        html: "Name -"+ userData.Name+"<br>"+"Email - "+userData.email+"<br>"+ "Phone Number - "+userData.phone + "<br>"+ "Message - " +userData.message 
    };
    
    transporter.sendMail(mailOptions, function (error, success) {
        if (error) {
            console.log(error);
            return res.send(error);
        }
        else {
            console.log("Server is ready to take our messages");
            const newUser = new Contact({
                name: userData.Name,
                email: userData.email,
                phone:  userData.phone,
                subject: userData.subject,
                message: userData.message
            });
            let response = new Contact(newUser)
            response.save()
            .then((result) => {
                return res.json({ statusCode: "200", statusMsj: "Successfuly send message", data: result })
            }).catch((err) => {
                console.log(err)
                return res.send(err)
            })

        }
    });
};


exports.contactList = async(req,res)=>{
    var contactlist = await Contact.find({is_delete:false})
    return res.json({statusCode:200, message:"contact list", data:contactlist})
}

exports.replytomessage = async(req, res)=>{
    var toEmail = req.body.toEmail
    var fromEmail = req.body.fromEmail
    var message = req.body.message
    var subject = req.body.subject

    let transporter = nodemailer.createTransport(
        {
            service: "gmail",
            secure: false, 
            auth: {
                user: "bulbul.infograins@gmail.com", 
                pass: "BulBul@123" 
            },
            tls: { rejectUnauthorized: false }
        }
    );
    
    let mailOptions = {
        from: fromEmail,
        to: toEmail, 
        // to: "bulbul.infograins@gmail.com",
        subject: subject, 
        html: "Message - " +message 
    };

    console.log("mailOptions",mailOptions)

    transporter.sendMail(mailOptions, function (error, success) {
        if (error) {
            console.log(error);
            return res.send(error);
        }
        else {
            console.log("Server is ready to take our messages");
           return res.send("message send")
        }
    });

}

exports.change_password = async (req, res) => {
    var email = req.body.email
    var oldPassword = req.body.oldPassword
    var new_password = req.body.new_password
    var confirm_password = req.body.confirm_password

    var admin_Data = await Admin.findOne({ email: email })

    if (!admin_Data) {
        return res.json({ statusCode: 400, statusMsj: "Email not exist" })
    }
    var hash = admin_Data.password

    bcrypt.compare(oldPassword, hash, async (error, isMatch) => {
        if (error) {
            throw error
        } else if (!isMatch) {
            return res.json({ statusCode: 401, message: "Password Not matched" });
        } else {
            if (new_password == confirm_password) {
                const hash_new_passwoed = await hashPassword(new_password);
                Admin.updateOne({ password: hash }, { $set: { password: hash_new_passwoed, confirm_password:confirm_password} })
                    .then(result => {
                        return res.json({ statusCode: 200, statusMsj: "Successfuly Update", data: result })
                        // return res.redirect('http://127.0.0.1:5500/frontend/page-login.html')
                    }).catch(err => {
                        console.log(err)
                        return res.send(err)
                        // return res.redirect("index.html")
                    })
            } else {
                return res.json({ statusCode: 402, statusMsj: "Password Mismatch" })
            }
        }
    })
}
exports.CountContacts = async(req, res)=>{
    var total_contacts = await Contact.count()
    return res.json({statusCode:200, total_contacts:total_contacts})
}


const sendmail = require('sendmail')();
exports.mail = async(req,res)=>{
    console.log("api calling")
    var userData = {       
        Name: req.body.name,
        email: req.body.email,
        phone:  req.body.phone,
        subject: req.body.subject,
        message: req.body.message
    }
    var EMAILS_DETAILS = {
        HOST_NAME: 'smtp.gmail.com',
        SECURE_CONNECTION: false,
        PORT: 587,
        USER: 'bulbul.infograins@gmail.com',
        PASSWORD: 'BulBul@123',   
    };
    var smtpTransport = nodemailer.createTransport({
        host : EMAILS_DETAILS.HOST_NAME,
        secureConnection : EMAILS_DETAILS.SECURE_CONNECTION,
        port: EMAILS_DETAILS.PORT,
        auth : {
            user : EMAILS_DETAILS.USER,
            pass : EMAILS_DETAILS.PASSWORD    
        }
    });
    var mailOptionsNoAttachment={
        from: EMAILS_DETAILS.USER,
        to : req.body.email,
        subject : "Testing email" ,
        text : req.body.message
    }
    smtpTransport.sendMail(mailOptionsNoAttachment, function(error, response){
    if(error){
        console.log(error);
        res.json("Email not sent.");
    }
    else{
        res.json({
            "status": 1,
            "message": "Email sent Successfully."
        });
    }
    });

    // console.log("still calling")
    // var transporter = nodemailer.createTransport({
    //     host: 'smtp.gmail.com',
    //     port: 25, //port 
    //     use_authentication: false, //not authenticate 
    //     tls: {
    //         rejectUnauthorized: false //do not fail on invalid certs
    //     }
    // });
    // console.log("still calling222222")

    // var mailOptions = {
    //     from: req.body.email, 
    //     to: 'bulbul.infograins@gmail.com',   
    //     subject: req.body.subject,  
    //     text: req.body.message,
    // };
    // console.log("mailOptions",mailOptions)
    // transporter.sendMail( mailOptions, function( error, info ){
    //     if( error ){
    //         console.log("error", error)
    //         return res.json(error);
    //     } else {
    //         console.log('Message sent: ' + info.response);
    //         return res.json("mail send")
    //     }
    //  });
    
    
    // sendmail({
    //     from:req.body.email ,
    //     to: 'bulbul.infograins@gmail.com',
    //     subject: req.body.subject,
    //     html: req.body.message
    //   }, function (err, reply) {
    //     // console.log("errrrrr",err && err.stack)
    //     console.dir("reply",reply)
    //     let response = new Contact(userData)
    //     response.save()
    //     .then((result) => {
    //         console.log("result",result)
    //     }).catch((err) => {
    //         console.log(err)
    //     })

    //     return res.send("hhhhh")
    //   })
}