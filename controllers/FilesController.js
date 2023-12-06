const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const userscollection = () => {
    try {
        const db = dbClient.client.db(dbClient.dbName);
        const usersCollection = db.collection('users');
        return usersCollection
    } catch (err) {
        throw new Error('collection error')
    }
};

const filescollection = () => {
    try {
        const db = dbClient.client.db(dbClient.dbName);
        const filesCollection = db.collection('files');
        return filesCollection
    } catch (err) {
        throw new Error('collection error')
    }
};

const postUpload = async (req, res) => {
    const filesCollection = filescollection();
    const usersCollection = userscollection();
    const token = req.headers['x-token'];
    const {FOLDER_PATH = '/tmp/files_manager'} = process.env;
    const UUID = uuidv4();
    
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
    
    const { name = null,
	    type = null ,
	    parentId,
	    isPublic = false,
	    data = null
	  } = req.body;
    if (!name) res.status(400).json({"Error": "Missing name"});
    if (!type) res.status(400).json({"Error": "Missing type"});
    if (!data && type != 'folder') res.status(400).json({"Error": "Missing data"});
    if (parentId) {
	try {
	    var file = filesCollection.findOne({ parentId });
	} catch (err) {
	    throw new Error(err)
	}

	if(!file) res.status.status(400).json({"Error": "Parent not found"});
	if(file && file.type !== 'folder') res.status.status(400).json({"Error": "Parent is not folder"});
    }
    const owner = '';

    try {
	var userId = await redisClient.get(`auth_${token}`);
    } catch (err) {
	throw new Error(err);
    }

    if (!fs.existsSync(FOLDER_PATH)) {
	fs.mkdirSync(FOLDER_PATH, { recursive: true });
    }

    if (type !== 'folder') {
	fs.writeFile(`${FOLDER_PATH}/${UUID}`, '', (err) => {
	    if (err) {
		console.log(err);
	    } 
	});
	
	const absolutePath = path.resolve(process.cwd(), UUID);
	filesCollection.insertOne({
	    userId,
	    name,
	    type,
	    parentId,
	    isPublic,
	    localpath: type === 'file' || 'image' ? absolutePath : null
	});
	return;
    } else {
	filesCollection.insertOne({
	    userId,
	    name,
	    type,
	    parentId,
	    isPublic,
	    data 
    });
    }

    res.status(201).json({'success': 'file added'});
}

static async getIndex(request, response) {
    const { userId } = await userUtils.getUserIdAndKey(request);

    const user = await userUtils.getUser({
      _id: ObjectId(userId),
    });

    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    let parentId = request.query.parentId || '0';

    if (parentId === '0') parentId = 0;

    let page = Number(request.query.page) || 0;

    if (Number.isNaN(page)) page = 0;

    if (parentId !== 0 && parentId !== '0') {
      if (!basicUtils.isValidId(parentId)) { return response.status(401).send({ error: 'Unauthorized' }); }

      parentId = ObjectId(parentId);

      const folder = await fileUtils.getFile({
        _id: ObjectId(parentId),
      });

      if (!folder || folder.type !== 'folder') { return response.status(200).send([]); }
    }

    const pipeline = [
      { $match: { parentId } },
      { $skip: page * 20 },
      {
        $limit: 20,
      },
    ];

    const fileCursor = await fileUtils.getFilesOfParentId(pipeline);

    const fileList = [];
    await fileCursor.forEach((doc) => {
      const document = fileUtils.processFile(doc);
      fileList.push(document);
    });

    return response.status(200).send(fileList);
  }


  static async putPublish(request, response) {
    const { error, code, updatedFile } = await fileUtils.publishUnpublish(
      request,
      true,
    );

    if (error) return response.status(code).send({ error });

    return response.status(code).send(updatedFile);
  }


  static async putUnpublish(request, response) {
    const { error, code, updatedFile } = await fileUtils.publishUnpublish(
      request,
      false,
    );

    if (error) return response.status(code).send({ error });

    return response.status(code).send(updatedFile);
  }


static async getFile(request, response) {
    const { userId } = await userUtils.getUserIdAndKey(request);
    const { id: fileId } = request.params;
    const size = request.query.size || 0;

    // Mongo Condition for Id
    if (!basicUtils.isValidId(fileId)) { return response.status(404).send({ error: 'Not found' }); }

    const file = await fileUtils.getFile({
      _id: ObjectId(fileId),
    });

    if (!file || !fileUtils.isOwnerAndPublic(file, userId)) { return response.status(404).send({ error: 'Not found' }); }

    if (file.type === 'folder') {
      return response
        .status(400)
        .send({ error: "A folder doesn't have content" });
    }

    const { error, code, data } = await fileUtils.getFileData(file, size);

    if (error) return response.status(code).send({ error });

    const mimeType = mime.contentType(file.name);

    response.setHeader('Content-Type', mimeType);

    return response.status(200).send(data);
  }
}


export {getIndex, getFile, putUnpublish, putPublish, postUpload} ;
