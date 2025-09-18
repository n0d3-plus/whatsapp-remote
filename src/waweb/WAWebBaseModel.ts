// Type definitions for the BaseModel and related utilities

import type { WAWebEventEmitter } from "./WAWebEventEmitter";

export type Constructor<T = {}> = new (...args: any[]) => T;

export interface IBaseModelOptions {
    parent?: any;
    collection?: any;
    _internalInitializationDoNotUse?: boolean;
    [key: string]: any;
}

export interface IBaseModel extends WAWebEventEmitter {
    idClass?: {
        displayName: string
    }
    stale: boolean;
    revisionNumber: number;
    __fired: any;
    __changes: any;
    __initialized: boolean;
    parent: any;
    collection: any;
    _uiObservers: number;
    mirrorMask?: any;
    mirror?: any;
    id?: any;
    __defaults?: any;
    __props: string[];
    __session: string[];
    __derived: string[];
    _collections: { [key: string]: any };
    _definition: { [key: string]: any };
    _deps: any;
    _topo?: any;
    _topoIndexMap?: any;

    initialize(): void;
    _refreshStaleModel(): void;
    incObservers(a?: any): void;
    decObservers(): void;
    hasObservers(): boolean;
    getObservers_TEST_ONLY(): any;
    addChild(a: string, b: IBaseModel): void;
    get(a: string): any;
    set(a: string | any, e?: any, f?: any): this;
    _markChange(a: string, b: any): void;
    _set(a: any, b: any, e?: any): this;
    _setKV(a: string, b: any, e: any): any;
    _setD(a: string): any;
    hasUnfiredChanges(): boolean;
    _getChanges(): any[];
    _initDeriveds(): void;
    _initCollections(): void;
    unset(a: string | string[], b?: any): void;
    clear(): void;
    delete(): void;
    reset(): void;
    toJSON(): any;
    serialize(): any;
    getDefault(a: string): any;
    _getCachedEventBubblingHandler(a: string): (b: string, c: any, d: any) => void;
    pp(): void;
}

export interface IBaseModelConstructor extends Constructor<IBaseModel> {
    allowedIds?: any[];
    idClass?: {
        displayName: string
    };
    isIdType(a: any): boolean;
    isEmptyObject(a: any): boolean;
}

export type PropDecorator = (target: any, propertyKey: string) => void;

export interface IWAWebModelUtils {
    prop: PropDecorator;
    //   session: PropDecorator;
    derived: PropDecorator;
    getter: PropDecorator;
    collection: PropDecorator;
    INIT: any;
    Attr: { DERIVED: any };
    session(flag: boolean): boolean;
    convert(a: any): any;
    stateExtend(base: any, ext: any): any;
}

export interface IWAWebBaseMirror {
    BaseMirror: Constructor<any>;
    genMirrorMask(b: any): any;
}

export interface IWAWebProxyStateFactory {
    ProxyStateFactory(proxyName: string, b: any, e: any): void;
}

// Utility function types
export type IdTypeToString = (a: any) => string;
export type DefineModel = (a: any) => IBaseModelConstructor;

// Exported utilities
export declare const prop: PropDecorator;
export declare const session: PropDecorator;
export declare const derived: PropDecorator;
export declare const getter: PropDecorator;
export declare const collection: PropDecorator;
export declare const idTypeToString: IdTypeToString;
export declare const BaseModel: IBaseModelConstructor;
export declare const defineModel: DefineModel;