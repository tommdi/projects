import { SpaceStack } from "./SpaceStack";
import { App } from "aws-cdk-lib"; //core type

//Creates the stack from SpaceStack.ts, Launches stack to aws
const app = new App() 
 new SpaceStack(app, 'Space-finder', {
    stackName:'SpaceFinder'

})
