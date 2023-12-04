import { MongoClient } from 'mongodb';


class DBClient {
    constructor() {
        const {
            DB_HOST = 'localhost',
            DB_PORT = 27017,
            DB_DATABASE = 'files_manager'
        } = process.env;
        this.dbName = DB_DATABASE;
        this.url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`
        this.client = new MongoClient(this.url, { useUnifiedTopology: true })
        this.client.connect();
    }



    isAlive() {
        return this.client.isConnected();
    }

    async nbUsers() {
        this.db = this.client.db();
        this.collection = this.db.collection('users');
        try {
            const numberOfUsers = await this.collection.countDocuments();
            return numberOfUsers;
        } catch (err) {
            console.log(err);
        }
    }

  async nbFiles() {
      this.db = this.client.db();
      this.collection = this.db.collection('files');
        try {
            const numberOfFiles = await this.collection.countDocuments();
            return numberOfFiles;
        } catch (err) {
            console.log(err);
        }
    }
}

const dbClient = new DBClient();
module.exports = dbClient;
