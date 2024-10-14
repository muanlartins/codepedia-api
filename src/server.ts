import express from 'express';
import dotenv from 'dotenv';
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { IElement } from "codepedia-types/dist/interfaces/element";
import { randomUUID } from 'crypto';

const app = express();
dotenv.config();

app.use(express.json());

export const dynamo = new DynamoDB({ 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  },
  region: process.env.REGION! 
});

app.get('/', async (req, res) => {
  const params = {
    TableName: 'data'
  }

  const data = await dynamo.scan(params);

  return res.status(200).send(data.Items?.map((item) => unmarshall(item)));
});

app.post('/', async (req, res) => {
  const data: IElement = await req.json();

  data.id = randomUUID();

  const params = {
    TableName: 'data',
    Item: marshall(data)
  }

  await dynamo.putItem(params);
});

app.listen(process.env.PORT!, () => {
  console.log(`Listening on ${process.env.PORT!}`);
});