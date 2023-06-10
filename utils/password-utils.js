const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { error } = require('console');


const pathToPrivKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const pathToPubKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');
const PUB_KEY = fs.readFileSync(pathToPubKey, 'utf8');


module.exports.generatePassword = (password) => {


    //32bytes to hex becomes 64 characters
    var salt = crypto.randomBytes(32).toString('hex');

    //512 bits is 128 hex characters.
    var hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return {
        salt: salt,
        hash: hash
    };
};

module.exports.validatePassword = (password, hash, salt) => {

    var calculatedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return hash === calculatedHash;

};


module.exports.issueJwt = (user) => {
    const _id = user.id;
    const username = user.username;
    const expiresIn = '1d';
    const payload = {
        sub: _id,
        username: username,
        iat: Date.now()
    };
    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });
    return {
        token: signedToken,
        expires: expiresIn
    }
}

module.exports.verifyJwt = (token) => {

    const payload = jsonwebtoken.verify(token, PUB_KEY, { algorithms: ['RS256'] });
    console.log("Now:", Date.now());
    console.log("EXP:", payload.exp);
    if (Date.now() > payload.exp) {
        throw error("expired token!");
    }



    return payload;


}




