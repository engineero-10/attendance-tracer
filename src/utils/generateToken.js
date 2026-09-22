import jwt from 'jsonwebtoken';

async function generateToken(payload){
    return jwt.sign(payload,process.env.JWT_SECRET_KEY,{expiresIn:"5m"})
}

export default generateToken;