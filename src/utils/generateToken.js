import jwt from 'jsonwebtoken';

async function generateToken(payload){
    return jwt.sign(payload,process.env.JWT_SECRET_KEY,{expiresIn:"60m"})
}

export default generateToken;