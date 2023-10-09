const jwt = require('jsonwebtoken');

const generateJWT = (login) => {
    return jwt.sign(login.toObject(), 'apikey');
}

const verifyJWT = (req,res,next) => {

    const token = req.headers;
    const decoded = jwt.verify(token['authorization'],'apikey');
 req.user = decoded;
    next()
}

module.exports = {generateJWT,verifyJWT}