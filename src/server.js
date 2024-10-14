"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamo = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const crypto_1 = require("crypto");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
exports.app = (0, express_1.default)();
dotenv_1.default.config();
exports.dynamo = new client_dynamodb_1.DynamoDB({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    },
    region: process.env.REGION
});
exports.app.use(express_1.default.json());
exports.app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const params = {
        TableName: 'data'
    };
    const data = yield exports.dynamo.scan(params);
    res.status(200).send((_a = data.Items) === null || _a === void 0 ? void 0 : _a.map((item) => (0, util_dynamodb_1.unmarshall)(item)));
}));
exports.app.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    data.id = (0, crypto_1.randomUUID)();
    const params = {
        TableName: 'data',
        Item: (0, util_dynamodb_1.marshall)(data)
    };
    yield exports.dynamo.putItem(params);
}));
exports.app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});
