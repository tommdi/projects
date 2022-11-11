import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyResultV2 } from "aws-lambda";




export function generateRandomId() {
    return Math.random().toString(36).slice(2);
}

export function getEventBody(event: APIGatewayProxyEvent) {
    return typeof event.body == 'object'? event.body: JSON.parse(event.body);
}

//Cors policy
export function addCorsHeader(result: APIGatewayProxyResult) {

    result.headers = {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

}