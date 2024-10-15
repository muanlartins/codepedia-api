import express from 'express';
import dotenv from 'dotenv';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
const app = express();
dotenv.config();
const dynamo = new DynamoDB({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    },
    region: process.env.REGION
});
app.use(express.json());
app.get('/', async (req, res) => {
    const params = {
        TableName: 'data'
    };
    const data = await dynamo.scan(params);
    res.status(200).send(data.Items?.map((item) => unmarshall(item)));
});
app.post('/', async (req, res) => {
    const data = req.body;
    data.id = randomUUID();
    const params = {
        TableName: 'data',
        Item: marshall(data)
    };
    await dynamo.putItem(params);
    res.status(200).send(data);
});
app.put('/', async (req, res) => {
    const data = req.body;
    let updateExpression = 'set #title = :title, #tags = :tags, #languages = :languages, #codes = :codes, #type = :type';
    const attributeValues = {
        ":title": data.title,
        ":tags": data.tags,
        ":languages": data.languages,
        ":codes": data.codes,
        ":type": data.type,
    };
    const attributeNames = {
        "#title": "title",
        "#tags": "tags",
        "#languages": "languages",
        "#codes": "codes",
        "#type": "type",
    };
    if (data.link) {
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
    };
    await dynamo.updateItem(params);
    res.status(200).send(data);
});
app.delete('/', async (req, res) => {
    const data = req.body;
    const params = {
        TableName: 'data',
        Key: marshall({
            id: data.id
        })
    };
    await dynamo.deleteItem(params);
    res.status(200).send(true);
});
app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});
export { app };
