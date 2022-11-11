import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"; //Api gateway request/response
import { MissingFieldError, validateAsSpaceEntry } from "../Shared/InputValidator";
import { v4 } from "uuid"; //Unique id
import { getEventBody, addCorsHeader } from "../Shared/Utils";

const TABLE_NAME = process.env.TABLE_NAME; //Name of the table. From GenericTable
const dbClient = new DynamoDB.DocumentClient(); //Suorittaa CRUD:in

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello from DYnamoDb'
    }
    addCorsHeader(result)

    try {

        const item = getEventBody(event);
        item.spaceId = v4();
        validateAsSpaceEntry(item);

        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: item
        }).promise()
        result.body = JSON.stringify({
            id: item.spaceId
        })
    } catch (error) {
        if (error instanceof Error) { 
            if (error instanceof MissingFieldError) {
                result.statusCode = 403;
            }
            else {
                result.statusCode = 500;
            }
            result.body = JSON.stringify({message: error.message}); //korjaa tama
        }
    }
    
   
    return result

}

export { handler }