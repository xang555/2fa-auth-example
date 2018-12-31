var express = require('express');
var router = express.Router();
const fs = require('fs')
const path = require('path')
const speakeasy = require("speakeasy");
const QRCode = require('qrcode')

const fake_data_path = path.join(__dirname,'..', 'fake-data.json')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', { title: 'login', is_one_auth: true });
});

router.post('/', function (req, res, next) {

    fs.readFile(fake_data_path, (err, data) => {
        if(err){
            throw err
        }

        const json_data = JSON.parse(data)
        
        const {
            uname,
            passwd,
            two_facetor_code,
        } = req.body

        if(typeof two_facetor_code !== 'undefined') {

            const base32secret = json_data['two_factor_auth']['is_enable'] ? json_data['two_factor_auth']['two_factor_auth_secret']:json_data['two_factor_auth']['two_factor_auth_secret_temp'];
            const verified = speakeasy.totp.verify({ 
                secret: base32secret,
                encoding: 'base32',
                window: 1,
                token: two_facetor_code });
            if(verified){
                json_data['two_factor_auth']['two_factor_auth_secret_temp'] = null
            json_data['two_factor_auth']['two_factor_auth_secret'] = base32secret
            json_data['two_factor_auth']['is_enable'] = true
            fs.writeFile(fake_data_path, JSON.stringify(json_data), (err) => {
                if(err){
                    throw err
                }
                
                req.session.user = {
                    name: "xang",
                    auth: true
                }

                res.redirect('/')

            })
            }else {
                res.send("Fail! check your token code")
            }

        }else {
            if(json_data['auth']['uname'] === uname && json_data['auth']['passwd'] === passwd) {

                if(json_data['two_factor_auth']['is_enable']) {
                    return res.render('login', { title: 'login', is_two_auth: true, is_enable_2fa: true  })
                }else {
                    const secret = speakeasy.generateSecret({
                        name: "xangnam two-factor"
                    });
                    console.log(secret.base32)
                    json_data['two_factor_auth']['two_factor_auth_secret_temp'] = secret.base32
                    fs.writeFile(fake_data_path, JSON.stringify(json_data), (err) => {
                        if(err){
                            throw err
                        }
                        // const otpauth_url = speakeasy.otpauthURL({
                        //     secret: secret.base32,
                        //     label: "vte-camp",
                        //     type: 'hotp',
                        //     counter: 0,
                        //     issuer: 'xangnam',
                        //     encoding: 'base32'
                        // })
                        QRCode.toDataURL(secret.otpauth_url, function (err, data_url) {
                            if(err) {
                                throw err
                            }
                            return res.render('login', { title: 'login', img: data_url, is_two_auth: true, is_enable_2fa: false  })
                        });

                    })
                }
    
            }else {
                // auth fail
                return res.render('login', { errMsg: "User or Password fail!", title: 'login', is_one_auth: true  })
            }
        }

    })

});

module.exports = router;
