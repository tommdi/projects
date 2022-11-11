import { CfnOutput } from "aws-cdk-lib"; //Defines outputs for cloudformation stacks
import { CognitoUserPoolsAuthorizer, RestApi } from "aws-cdk-lib/aws-apigateway";
//Defines cognito userpool
import { UserPool, UserPoolClient, CfnUserPoolGroup } from "aws-cdk-lib/aws-cognito";
//Userpool defines cognito userpool, defines userpoolclient(call unautthicated apicalls), defines group(admins)
import { Construct } from "constructs";
import { IdentityPoolWrapper } from "./IdentityPoolWrapper";




export class AuthorizerWrapper {

    private scope: Construct;
    private api: RestApi;

    private userPool: UserPool;
    private userPoolClient: UserPoolClient;
    public authorizer: CognitoUserPoolsAuthorizer;
    private identityPoolWrapper: IdentityPoolWrapper;

    constructor(scope: Construct, api: RestApi) {
        this.scope = scope;
        this.api = api;
        this.initialize();
    }

    private initialize() {
        this.createUserPool();
        this.addUserPoolClient();
        this.createAuthorizer();
        this.initializeIdentityPoolWrapper();
        this.createAdminsGroup();
    }

    //Creates userpool to cognito
    private createUserPool() {
        this.userPool = new UserPool(this.scope, 'SpaceUserPool', {
            userPoolName: 'SpaceUserPool',
            selfSignUpEnabled: true,

            signInAliases: {
                username: true,
                email: true
            }
        });
        new CfnOutput(this.scope, 'UserPoolId', {
            value: this.userPool.userPoolId
        })
    }

    //Unautethicated api call for example sign-up
    private addUserPoolClient() {
        this.userPoolClient = this.userPool.addClient('SpaceUserPool-client', {
            userPoolClientName: 'SpaceUserPool-client',
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            },
            generateSecret: false
        });
        new CfnOutput(this.scope, 'UserPoolClientId', {
            value: this.userPoolClient.userPoolClientId
        })
    }

    private createAuthorizer() {
        this.authorizer = new CognitoUserPoolsAuthorizer(this.scope, 'SpaceUserAuthorizer', {
            cognitoUserPools: [this.userPool], //userpool associated with this authorizer
            authorizerName: 'spaceUserAuthorizer', //(Optional) humanfriendly name for authorizer
            identitySource: 'method.request.header.Authorization' //Mistä tämä tulee? The request header mapping expression for the bearer token.

        });
        this.authorizer._attachToApi(this.api); //attaches the authorizer to this api(hello)
    }

    private initializeIdentityPoolWrapper() {
        this.identityPoolWrapper = new IdentityPoolWrapper(
            this.scope,
            this.userPool,
            this.userPoolClient
        )
    }

    //Creates cognito group called admins
    private createAdminsGroup(){
        new CfnUserPoolGroup(this.scope, 'admins', {
            groupName: 'admins',
            userPoolId: this.userPool.userPoolId,
            roleArn: this.identityPoolWrapper.adminRole.roleArn
        })
    }
}