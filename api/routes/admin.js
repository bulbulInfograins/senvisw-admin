const express = require('express');
const router = express.Router();


const {
   
    adminSignup,
    adminlogin,
    send_message,
    replytomessage,
    contactList,
    change_password,
    CountContacts,
    mail
   
}
=require('../controller/admin');
router.post("/signup",adminSignup);
router.post("/login",adminlogin);
router.post("/send_message",send_message);
router.post("/replytomessage",replytomessage);
router.get("/contactList",contactList);
router.post("/change_password",change_password);
router.get("/CountContacts",CountContacts);
router.post("/mail",mail)


const http = require("https");

router.post("/smartContract", async (request, res)=>{
    const options = {
        "method": "POST",
        "hostname": "api-us-west1.tatum.io",
        "port": null,
        "path": "/v3/polygon/smartcontract",
        "headers": {
            "content-type": "application/json",
            "x-api-key": "2527a5e1-0c06-48a6-abcc-74fdbc9c7ce4"
        }
    };

    const req = http.request(options, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
    });
    });

    req.write(JSON.stringify({
  "contractAddress": "0xcf82d5661c1f127eb21db9b37d7613d29bbd06e3",
  "methodName": "mint",
  "methodABI": {
		"inputs": [
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_uri",
				"type": "string"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
  "params": [
    "0xC261434F01f2C28C8DBB8Dc80870ADFaA7A1F64E",
		"11",
		"https://ipfs.io/ipfs/bafyreigzx2dbyzlfeje473ujwrg3fkdrrfalqvl2k72rmpzqbxt2yxjovy/metadata.json"
  ],
  "fromPrivateKey": "44755d79b8672240fae5fae1ffa1cfebd33f10bee5425617c73c4c32728aefc2"
}));
    req.end();

})


module.exports = router;