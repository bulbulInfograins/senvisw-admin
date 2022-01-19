const express = require('express');
const router = express.Router();


const {
   
    adminSignup,
    adminlogin,
    send_message,
    replytomessage,
    contactList,
    change_password,
    CountContacts
   
}
=require('../controller/admin');
router.post("/signup",adminSignup);
router.post("/login",adminlogin);
router.post("/send_message",send_message);
router.post("/replytomessage",replytomessage);
router.get("/contactList",contactList);
router.post("/change_password",change_password);
router.get("/CountContacts",CountContacts);


module.exports = router;