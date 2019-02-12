const express = require('express');
const router = express.Router();
const path = require('path')
const https = require('https')
const CryptoJS = require('crypto-js')

var key = CryptoJS.enc.Utf8.parse("versa2019212");
/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.resolve(__dirname, './login.html'))
});

router.post('/login', function(req, res, next) {
    let {j_username, j_password} = req.body
    let encryptedHexStr  = CryptoJS.enc.Hex.parse(j_password);
    let encryptedBase64Str  = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decryptedData  = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    j_password = decryptedData.toString(CryptoJS.enc.Utf8);
    let data = `j_username=${j_username}&j_password=${j_password}`
    const options = {
        hostname: '223.71.110.76',
        port: 8443,
        path: `/versa/j_spring_security_check?${data}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        rejectUnauthorized: false
    };

    const request = https.request(options, (response) => {
        console.log('状态码:', response.statusCode)
        console.log('请求头:', response.headers)
        let result = response.headers.location.split('?')[1]
        if (result == undefined) {
            let cookies = response.headers['set-cookie']
            res.setHeader('Set-Cookie', cookies)
            res.json({
                code: 200,
                path: `https://223.71.110.76:8443${response.headers.location}`
            })
        } else {
            res.json({
                code: 400,
                msg: '账号密码错误'
            })
        }
    });

    request.on('error', (e) => {
        console.error(e);
    });
    request.end();
})

router.get('/getKey', function(req, res, next) {
    res.json({
        code: 200,
        data: key
    })
})
module.exports = router;
