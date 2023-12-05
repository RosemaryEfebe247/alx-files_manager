const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { createHash } = require('crypto');
const { ObjectId } = require('mongodb');


const hashPassword = (password) => {
    const sha1Hash = createHash('sha1');
    sha1Hash.update(password);
    return sha1Hash.digest('hex');
}

const userscollection = () => {
    try {
	const db = dbClient.client.db(dbClient.dbName);
	const usersCollection = db.collection('users');
	return usersCollection
    } catch (err) {
	throw new Error('collection error')
    }
};

const postNew = async (req, res) => {
    const usersCollection = userscollection()
    
    if (!req.body.email) {
	res.status(400).json('Missing email');
	return;
    }

    if (!req.body.password) {
	res.status(400).json('Missing password');
	return;
    }

    const email = req.body.email;
    const password = req.body.password;
    const findEmail = {email: email}
   
    try {
	var emailAlreadyExist = await usersCollection.findOne(findEmail);
    } catch (err) {
	throw new Error(err)
    }
    if (emailAlreadyExist) {
	res.status(400).json({email: 'Already exist'});
    }
   
    const hashedPassword = hashPassword(password);
    const user = {
	email: email,
	password: hashedPassword
    }

    try {
	var storeUser = await usersCollection.insertOne(user);
    } catch (err) {
	throw new Error(err)
    }
    try {
	var userId = await usersCollection.findOne(findEmail);
    } catch (err) {
	throw new Error(err);
    }
    
    res.status(200).json({email:email, id: userId._id});
}

const getMe = async (req, res) => {
    const usersCollection = userscollection();
    const token = req.headers['x-token'];
    try {
	var getUserId = await redisClient.get(`auth_${token}`);
    } catch (err) {
	throw new Error(err)
    }

    try {
	var getUser = await usersCollection.findOne({ _id: ObjectId(getUserId)});
    } catch (err) {
	throw new Error(err)
    }
    console.log(getUser);
    if (!getUser) {
	res.status(401).json({'Error': 'unauthorized'});
	return;
    }
    res.status(200).json({id: getUser._id, 'email': getUser.email});
}

export { postNew, getMe };
