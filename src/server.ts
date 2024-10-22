import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Element } from "codepedia-types/interfaces";
import { randomUUID } from 'crypto';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { ElementType } from 'codepedia-types/enums/index.js';

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

app.use((req, res, next) => {
  if (req.method === "GET" || req.headers.authorization === process.env.PASSWORD!)
    next();
  else
    res.status(400).send("Wrong password");
});

const dynamo = new DynamoDB({ 
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!
  },
  region: process.env.REGION! 
});

app.get('/', async (req, res) => {
  const params = {
    TableName: 'data'
  }

  const data = await dynamo.scan(params);

  res.status(200).send(data.Items?.map((item) => unmarshall(item)));
});

app.post('/', async (req, res) => {
  const data: Element = req.body;

  data.id = randomUUID();
  data.createdAt = new Date().toISOString();
  data.updatedAt = new Date().toISOString();

  const params = {
    TableName: 'data',
    Item: marshall(data)
  }

  await dynamo.putItem(params);

  res.status(200).send(data);
});


app.put('/', async (req, res) => {
  const data: Element = req.body;

  let updateExpression = 'set #title = :title, #tags = :tags, #languages = :languages, #codes = :codes, #type = :type, #updatedAt = :updatedAt';

  const attributeValues: { [key: `:${string}`]: any } = {
    ":title": data.title,
    ":tags": data.tags,
    ":languages": data.languages,
    ":codes": data.codes,
    ":type": data.type,
    ":updatedAt": new Date().toISOString(),
  };

  const attributeNames: { [key: `#${string}`]: any} = {
    "#title": "title",
    "#tags": "tags",
    "#languages": "languages",
    "#codes": "codes",
    "#type": "type",
    "#updatedAt": "updatedAt",
  };

  if (data.type === ElementType.solution) {
    updateExpression += ', #link = :link';
    attributeValues[":link"] = data.link;
    attributeNames["#link"] = "link";
  }

  const params = {
    TableName: 'data',
    Key: marshall({
      id: data.id,
    }),
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: marshall(attributeValues),
    ExpressionAttributeNames: attributeNames
  }

  await dynamo.updateItem(params);

  res.status(200).send(data);
});


app.delete('/', async (req, res) => {
  const data: Element = req.body;

  const params = {
    TableName: 'data',
    Key: marshall({
      id: data.id
    })
  }

  await dynamo.deleteItem(params);

  res.status(200).send(true);
});

app.listen(process.env.PORT!, () => {  
  console.log(`Example app listening on port ${process.env.PORT!}`)
});

export { app };