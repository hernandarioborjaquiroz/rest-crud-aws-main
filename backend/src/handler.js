const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuid } = require("uuid");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};
const ok = (body) => ({ statusCode: 200, headers, body: JSON.stringify(body) });
const created = (body) => ({ statusCode: 201, headers, body: JSON.stringify(body) });
const bad = (msg) => ({ statusCode: 400, headers, body: JSON.stringify({ error: msg }) });
const notFound = () => ({ statusCode: 404, headers, body: JSON.stringify({ error: "Not found" }) });

module.exports.createItem = async (event) => {
  try {
    const data = JSON.parse(event.body || "{}");
    if (!data || typeof data !== "object") return bad("Invalid body");
    const item = { id: uuid(), ...data, createdAt: new Date().toISOString() };
    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    return created(item);
  } catch (e) {
    return bad(e.message);
  }
};

module.exports.getItem = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return bad("Missing id");
  const out = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
  return out.Item ? ok(out.Item) : notFound();
};

module.exports.listItems = async () => {
  const out = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
  return ok(out.Items || []);
};

module.exports.updateItem = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return bad("Missing id");

  const data = JSON.parse(event.body || "{}");
  const keys = Object.keys(data);
  if (keys.length === 0) return bad("Body empty");

  const names = {};
  const values = {};
  let expr = "SET";
  keys.forEach((k, i) => {
    names[`#k${i}`] = k;
    values[`:v${i}`] = data[k];
    expr += ` #k${i} = :v${i}${i < keys.length - 1 ? "," : ""}`;
  });

  const out = await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: expr,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );
  return ok(out.Attributes);
};

module.exports.deleteItem = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return bad("Missing id");
  await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
  return ok({ deleted: id });
};
