const dbClient = require('../utils/db.js');
const { createHash } = require('crypto');


const hashPassword = (password) => {
    const sha1Hash = createHash('sha1');
    sha1Hash.update(password);
    return sha1Hash.digest('hex');
}

const postNew = async (req, res) => {
    try {
	var db = dbClient.client.db(dbClient.dbName);
	var usersCollection = db.collection('users')
    } catch (err) {
	throw new Error('collection error')
    }
    
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

module.exports = postNew;
