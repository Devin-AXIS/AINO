import { ServerObject, ServerVariableObject } from './oas-common';
import { IExtensionName, IExtensionType } from './specification-extension';
export declare class Server implements ServerObject {
    url: string;
    description?: string;
    variables: {
        [v: string]: ServerVariable;
    };
    [k: IExtensionName]: IExtensionType;
    constructor(url: string, desc?: string);
    addVariable(name: string, variable: ServerVariable): void;
}
export declare class ServerVariable implements ServerVariableObject {
    enum?: string[] | boolean[] | number[];
    default: string | boolean | number;
    description?: string;
    [k: IExtensionName]: IExtensionType;
    constructor(defaultValue: string | boolean | number, enums?: string[] | boolean[] | number[], description?: string);
}
