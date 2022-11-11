import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { addCorsHeader } from '../Shared/Utils'


const TABLE_NAME = process.env.TABLE_NAME as string; //Variable from generictable
const PRIMARY_KEY = process.env.PRIMARY_KEY as string; //Variable from generictable
const dbClient = new DynamoDB.DocumentClient(); //Does the delete action

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DYnamoDb'
    }
    addCorsHeader(result)

    const spaceId = event.queryStringParameters?.[PRIMARY_KEY];
    //Does the delete operation from spaceId
    if (spaceId) {
        const deleteResult = await dbClient.delete({
            TableName: TABLE_NAME,
            Key:{
              [PRIMARY_KEY]: spaceId  
            }
        }).promise()
        result.body = JSON.stringify(deleteResult);
    }


    return result

}

export { handler }