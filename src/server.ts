import express from 'express';
import dotenv from 'dotenv';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { IElement } from "codepedia-types/dist/interfaces/element";
import { randomUUID } from 'crypto';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

export const app = express();
dotenv.config();

export const dynamo = new DynamoDB({ 
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!
  },
  region: process.env.REGION! 
});

app.use(express.json());

app.get('/', async (req, res) => {
  const params = {
    TableName: 'data'
  }

  const data = await dynamo.scan(params);

  res.status(200).send(data.Items?.map((item) => unmarshall(item)));
});

app.post('/', async (req, res) => {
  const data: IElement = req.body;

  data.id = randomUUID();

  const params = {
    TableName: 'data',
    Item: marshall(data)
  }

  await dynamo.putItem(params);
});

app.listen(process.env.PORT!, () => {  
  console.log(`Example app listening on port ${process.env.PORT!}`)
})