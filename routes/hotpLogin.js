var express = require('express');
var router = express.Router();
const fs = require('fs')
const path = require('path')
const speakeasy = require("speakeasy");
const QRCode = require('qrcode')

const fake_data_hotp_path = path.join(__dirname,'..', 'fake-data-hotp.json')

/** login for totp */
router.get('/', function (req, res, next) {
    res.render('login', { title: 'login', is_one_auth: true, target: '/hotp/login' });
});

router.post('/', function (req, res, next) {

    fs.readFile(fake_data_hotp_path, (err, data) => {
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
            let counter = json_data['two_factor_auth']['counter'] + 1
            console.log(counter)
            const token = speakeasy.hotp({
                secret: base32secret,
                counter: counter,
                encoding: 'base32'
            })
            console.log(token)
            const verified = speakeasy.hotp.verify({ 
                secret: base32secret,
                encoding: 'base32',
                window: 10,
                counter: counter,
                token: two_facetor_code });

                if(verified){
                    json_data['two_factor_auth']['two_factor_auth_secret_temp'] = null
                json_data['two_factor_auth']['two_factor_auth_secret'] = base32secret
                json_data['two_factor_auth']['is_enable'] = true
                json_data['two_factor_auth']['counter'] = counter
                fs.writeFile(fake_data_hotp_path, JSON.stringify(json_data), (err) => {
                    if(err){
                        throw err
                    }
                    
                    req.session.hotp = {
                        name: "xang",
                        auth: true
                    }
    
                    res.redirect('/hotp')
    
                })
                }else {
                    res.send("Fail! check your token code")
                }

        }else {
            if(json_data['auth']['uname'] === uname && json_data['auth']['passwd'] === passwd) {

                if(json_data['two_factor_auth']['is_enable']) {
                    return res.render('login', { title: 'login', is_two_auth: true, is_enable_2fa: true, target: '/hotp/login'  })
                }else {
                    const secret = speakeasy.generateSecret({
                        name: "xangnam two-factor"
                    });

                    json_data['two_factor_auth']['counter'] = 0
                    json_data['two_factor_auth']['two_factor_auth_secret_temp'] = secret.base32
                    fs.writeFile(fake_data_hotp_path, JSON.stringify(json_data), (err) => {
                        if(err){
                            throw err
                        }
                        const otpauth_url = speakeasy.otpauthURL({
                            secret: secret.base32,
                            label: "vte-camp",
                            type: 'hotp',
                            counter: 0,
                            issuer: 'xangnam',
                            encoding: 'base32'
                        })
                        QRCode.toDataURL(otpauth_url, function (err, data_url) {
                            if(err) {
                                throw err
                            }
                            return res.render('login', { title: 'login', img: data_url, is_two_auth: true, is_enable_2fa: false, target: '/hotp/login'  })
                        });

                    })
                }
    
            }else {
                // auth fail
                return res.render('login', { errMsg: "User or Password fail!", title: 'login', is_one_auth: true, target: '/hotp/login'  })
            }
        }

    })

});

module.exports = router;
