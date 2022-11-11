import { Stack, StackProps } from 'aws-cdk-lib' //Single cloudformation stack
import { Construct } from 'constructs' //Encapsulates everything for cloudformation
import { join } from 'path'; //Lets you browse to another folder
import { AuthorizationType, LambdaIntegration, MethodOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
//Authtype for example cognito(Inside MethodOptions), Lambdint integrates lambda function to apigateway
//MethodOptions gives options for example to cognito(authorizationtype etc..), RestApi = Awsgateway restapi
import { GenericTable } from './GenericTable';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'; //Lambda function created with node.js
import { handler } from '../services/node-lambda/hello';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'; //With this you can create policy
import { AuthorizerWrapper } from './auth/AuthorizerWrapper';

export class SpaceStack extends Stack {

    private api = new RestApi(this, 'SpaceApi'); //Rest api, the name of the rest api is SpaceAPi
    private authorizer: AuthorizerWrapper; //AuthorizerWrapper.ts
    
    //Declares values for properties that are made in GenericTable.ts
    private spacesTable = new GenericTable(this, {
        tableName: 'SpacesTable',
        primaryKey: 'spaceId',
        createLambdaPath: 'Create',
        readLambdaPath: 'Read',
        updateLambdaPath: 'Update',
        deleteLambdaPath: 'Delete',
        secondaryIndexes: ['location']
    })

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props)

        this.authorizer = new AuthorizerWrapper(this, this.api);

        //Creates new lambda function and the function code is at hello.ts
        const helloLambdaNodeJs = new NodejsFunction(this, 'helloLambdaNodeJs', {
            entry: (join(__dirname, '..', 'services', 'node-lambda', 'hello.ts')), //Join method navigates to right folder
            handler: 'handler'
        });


        //Iam policy for listing buckets
        const s3ListPolicy = new PolicyStatement();
        s3ListPolicy.addActions('s3:ListAllMyBuckets');
        s3ListPolicy.addResources('*');
        helloLambdaNodeJs.addToRolePolicy(s3ListPolicy); //Gives list permission to this lambda


        const optionsWithAuthorizer: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: this.authorizer.authorizer.authorizerId
            }
        }

        //Hello API integration testi
        const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodeJs);
        const helloLambdaResource = this.api.root.addResource('hello');
        helloLambdaResource.addMethod('GET', helloLambdaIntegration, optionsWithAuthorizer);

        //Spaces API integrations:
        const spaceResource = this.api.root.addResource('spaces');
        spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration, optionsWithAuthorizer);
        spaceResource.addMethod('GET', this.spacesTable.readLambdaIntegration, optionsWithAuthorizer);
        spaceResource.addMethod('PUT', this.spacesTable.updateLambdaIntegration, optionsWithAuthorizer);
        spaceResource.addMethod('DELETE', this.spacesTable.deleteLambdaIntegration, optionsWithAuthorizer);
    }
}