import redisClient from '../utils/redis';
import dbClient from '../utils/db';
const { createHash } = require('crypto');
const { v4: uuidv4 } = require('uuid');


const hashPassword = (password) => {
    const sha1Hash = createHash('sha1');
    sha1Hash.update(password);
    return sha1Hash.digest('hex');
}

const getConnect = async (req, res) => {
    const getAuthorization = req.headers.authorization;
    const getBase64encoding = getAuthorization.split(' ')[1];
    const decodeString = Buffer.from(getBase64encoding, 'base64')
	  .toString('utf-8');
    const [email, password] = decodeString.split(':')
    const db = dbClient.client.db(dbClient.dbName);
    const usersCollection = db.collection('users');
    const findUser = {
	email,
    }
    try {
	var getUser = await usersCollection.findOne(findUser)
    } catch (err) {
	throw new Error(err);
    }

    if (!getUser) res.status(401).json({'Error': 'user does not exist'});
    const hashedpassword = hashPassword(password)
    if (getUser.password !== hashedpassword) {
	res.status(401).json({'Error': 'unauthorized'});
	return;
    }
    const token = uuidv4();
    redisClient.set(`auth_${token}`, getUser._id, 86400);
    res.status(200).json({token});
}

const getDisconnect = async (req, res) => {
    const token = req.headers['x-token']
    try {
	var getUserId = await redisClient.get(`auth_${token}`);
    } catch (err) {
	throw new Error(err);
    }
    
    if (!getUserId) {
	res.status(401).json({'Error': 'unauthorized'});
	return;
    }
    try {
	await redisClient.del(`auth_${token}`);
    } catch (err) {
	throw new Error(err);
    }
    
    res.status(200).json({});
}

export {getConnect, getDisconnect};
