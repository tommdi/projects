import { Stack } from "aws-cdk-lib"; //cloudforation stack
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
//Attributetype(string, number etc..)
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"; //lambda made with node.js
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway"; //Lambda to apigateway
import { join } from "path";

//Value are declared at SpaceStack.ts
export interface TableProps {
    tableName: string,
    primaryKey: string,
    createLambdaPath?: string,
    readLambdaPath?: string,
    updateLambdaPath?: string,
    deleteLambdaPath?: string,
    secondaryIndexes?: string[]
}

export class GenericTable {

    private stack: Stack;
    private table: Table;
    private props: TableProps; //from TableProps

    //Lambda is node.js function or undefined
    private createLambda: NodejsFunction | undefined;
    private readLambda: NodejsFunction | undefined;
    private updateLambda: NodejsFunction | undefined;
    private deleteLambda: NodejsFunction | undefined;

    //Lambda crud integrations
    public createLambdaIntegration: LambdaIntegration;
    public readLambdaIntegration: LambdaIntegration;
    public updateLambdaIntegration: LambdaIntegration;
    public deleteLambdaIntegration: LambdaIntegration;
    
    public constructor(stack: Stack, props: TableProps) {
        this.stack = stack;
        this.props = props;
        this.initialize();

    }

    private initialize(){
        this.createTable();
        this.addSecondaryIndexes();
        this.createLambdas();
        this.grantTableRights();
    }

    //Creates the table values are from SpaceStack
    private createTable(){
        this.table = new Table(this.stack, this.props.tableName, {
            partitionKey: {
                name: this.props.primaryKey,
                type: AttributeType.STRING
            },
            tableName: this.props.tableName
        })
    }

    //Creates secondary index/es for dynamodb table
    private addSecondaryIndexes() {
        if (this.props.secondaryIndexes) {
            for (const secondaryIndex of this.props.secondaryIndexes) {
                this.table.addGlobalSecondaryIndex({
                    indexName: secondaryIndex,
                    partitionKey: {
                        name: secondaryIndex,
                        type: AttributeType.STRING
                    }
                })
            }
        }
    }
    //Create lambdas for space the spaceapi in SpaceStack.ts
    private createLambdas() {
        if (this.props.createLambdaPath) {
            this. createLambda = this.createSingleLambda(this.props.createLambdaPath)
            this.createLambdaIntegration = new LambdaIntegration(this.createLambda);
        }
        if (this.props.readLambdaPath) {
            this. readLambda = this.createSingleLambda(this.props.readLambdaPath)
            this.readLambdaIntegration = new LambdaIntegration(this.readLambda)
        }
        if (this.props.updateLambdaPath) {
            this. updateLambda = this.createSingleLambda(this.props.updateLambdaPath)
            this.updateLambdaIntegration = new LambdaIntegration(this.updateLambda)
        }
        if (this.props.deleteLambdaPath) {
            this. deleteLambda = this.createSingleLambda(this.props.deleteLambdaPath)
            this.deleteLambdaIntegration = new LambdaIntegration(this.deleteLambda)
        }
    }

    //Grants iam principal for CRUD operation rights for dynamodb
    private grantTableRights() {
        if(this.createLambda) {
            this.table.grantWriteData(this.createLambda);
        }
        if(this.readLambda) {
            this.table.grantReadData(this.readLambda);
        }
        if(this.updateLambda) {
            this.table.grantWriteData(this.updateLambda);
        }
        if(this.deleteLambda) {
            this.table.grantWriteData(this.deleteLambda);
        }
    }

    //Creates one lambda for each crud action(4 Lambdas)
    private createSingleLambda(lambdaName: string): NodejsFunction{
        const lambdaId = `${this.props.tableName}-${lambdaName}`
        return new NodejsFunction(this.stack, lambdaId, {
            entry: (join(__dirname, '..', 'services', this.props.tableName, `${lambdaName}.ts`)),
            handler: 'handler',
            functionName: lambdaId,
            environment: {
                TABLE_NAME: this.props.tableName,
                PRIMARY_KEY: this.props.primaryKey
            }
        })

    }

}