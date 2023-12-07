const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const getStatus = (req, res) => {
    res.status(200).send({"redis": redisClient.isAlive(), "db": dbClient.isAlive()});
}

const getStats = async (req, res) => {
    res.status(200).send({
	"users": await dbClient.nbUsers(),
	"files": await dbClient.nbFiles()
    });
}

export {getStatus, getStats};
