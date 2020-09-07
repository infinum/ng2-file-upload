export declare class FileLikeObject {
    lastModifiedDate: any;
    size: any;
    type: string;
    name: string;
    rawFile: any;
    constructor(fileOrInput: any);
    _createFromFakePath(path: string): void;
    _createFromObject(object: {
        size: number;
        type: string;
        name: string;
    }): void;
}
