// Type definitions for WAWebCollection (generic base collection)
// Types are inferred from implementation and common conventions; refine as needed.

import { WAWebEventEmitter } from "./WAWebEventEmitter";

export interface IWAWebCollection<T = any> extends WAWebEventEmitter {
    // Properties
    modelClass: { new(...args: any[]): T };
    length: number;

    // Core collection methods
    add(a: T | T[], b?: object): T[];
    set(a: T[], b?: object): T[];
    remove(a: T | T[], b?: object): T[];
    reset(): void;
    sort(a?: object): this;
    replaceId(a: any, b: any): void;
    reorderMutate(a: number, b: number): void;
    get(a: any): T | undefined;
    assertGet(a: any): T | undefined;
    at(a: number): T | undefined;

    // Data serialization
    serialize(): any[];
    toJSON(): any[];

    // Type checks & searching
    isModel(a: any): boolean;
    includes(a: T, b?: number): boolean;
    indexOf(a: T, b?: number): number;
    lastIndexOf(a: T, b?: number): number;
    every(cb: (item: T, idx: number, arr: T[]) => boolean): boolean;
    some(cb: (item: T, idx: number, arr: T[]) => boolean): boolean;
    forEach(cb: (item: T, idx: number, arr: T[]) => void): void;
    map<U>(cb: (item: T, idx: number, arr: T[]) => U): U[];
    filter(cb: (item: T, idx: number, arr: T[]) => boolean): T[];
    findFirst(cb: (item: T, idx: number, arr: T[]) => boolean): T | undefined;
    reduce<U>(cb: (acc: U, item: T, idx: number, arr: T[]) => U, initial: U): U;
    slice(a?: number, b?: number): T[];
    where(attrs: Partial<T>): T[];
    head(): T | undefined;
    last(): T | undefined;
    toArray(): T[];
    getModelsArray(): T[];
    reorder(a: number, b: number): T[];

    // Internal helpers
    _reset(): void;
    _prepareModel(a: any, b?: object): T | undefined;
    _addReference(a: T): void;
    _removeReference(a: T): void;
    _addIndex(a: T): void;
    _deIndex(a: T): void;
    _removeFromIndex(a: any): void;
    _handleModelEvent(a: string, b: any, c: any, d: any): void;
    _iterateAggregators(cb: (agg: any) => void, allowInit?: boolean): void;
}

// Constructor type for generic collection
export type WAWebCollectionConstructor<T = any> = new (...args: any[]) => IWAWebCollection<T>;