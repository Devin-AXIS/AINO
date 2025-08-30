export type IExtensionName = `x-${string}`;
export type IExtensionType = any;
export type ISpecificationExtension = {
    [extensionName: IExtensionName]: IExtensionType;
};
export declare class SpecificationExtension implements ISpecificationExtension {
    [extensionName: IExtensionName]: any;
    static isValidExtension(extensionName: string): boolean;
    getExtension(extensionName: string): any;
    addExtension(extensionName: string, payload: any): void;
    listExtensions(): string[];
}
