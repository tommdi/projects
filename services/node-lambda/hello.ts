import { v4 } from 'uuid';
import { S3 } from 'aws-sdk'
import { APIGatewayProxyEvent } from 'aws-lambda';

const s3Client = new S3();

async function handler(event: any, context: any) {
    const buckets = await s3Client.listBuckets().promise();
    console.log('Got an event:');
    console.log(event);
    return {
        statusCode: 200,
        body: 'Here are your buckets: ' + JSON.stringify(buckets.Buckets)


}
}


//Authorizes api calls only to group admins
function isAuthorized(event: APIGatewayProxyEvent){
    const groups = event.requestContext.authorizer?.claims['cognito:groups'];
    if (groups) {
        return (groups as string).includes('admins')
    } else {
        return false
    }
}

export { handler }