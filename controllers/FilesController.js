const dbClient = require('../controllers/db');
const redisClient = require('../controllers/redis');

const userscollection = () => {
    try {
        const db = dbClient.client.db(dbClient.dbName);
        const usersCollection = db.collection('users');
        return usersCollection
    } catch (err) {
        throw new Error('collection error')
    }
};

const postUpload = async (req, res) => {
    const usersCollection = userscollection();
    const token = req.headers['x-token'];
    try {
	var getUserId = await redisClient.get(`auth_${token}`);
    } catch (err) {
	throw new Error(err);
    }
    
    try {
	var getUser = await usersCollection.findOne({_id: getUserId});
    } catch (err) {
	throw new Error(err);
    }

    if (!getUser) res.status(401).json({'Error': 'unauthorized'});
}
