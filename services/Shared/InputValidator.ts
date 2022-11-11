import { Space } from "./Model";


export class MissingFieldError extends Error {

}

export function validateAsSpaceEntry(arg: any) {
    if(!(arg as Space).title){
        throw new MissingFieldError('Value for title')
    }
    if(!(arg as Space).description){
        throw new MissingFieldError('Value for description')
    }
    if(!(arg as Space).spaceId){
        throw new MissingFieldError('Value for spaceId required')
    }
}