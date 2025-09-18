// Type definitions for WAWebBaseCollection (BaseCollection)
// Types are inferred from source; refine as needed for your codebase.

import type { IWAWebCollection } from "./WAWebCollection";

export interface IBaseCollection<T = any> extends IWAWebCollection<T> {
    // Internal state and policies
    _inflight: { [key: string]: Promise<any> | null };
    _cachePolicy: any;
    _staleCollection: boolean;

    // Core collection methods
    initializeFromCache(a: T[]): void;
    saveToCache(): void;
    // add(e: T | T[], f?: any): T[] | T;
    findQuery(a: any, b?: any): Promise<T | T[]>;
    find(a: any, e?: any): Promise<T>;
    update(a: any, e?: any): Promise<T>;
    gadd(a: any, b?: any): T;
    gaddUp(a: any): T;
    delete(): void;
    get(a: any): T | undefined;
    reset(): void;
    set(a: any): any;
    forEach(cb: (item: T, idx?: number, arr?: T[]) => void): void;

    // Server and cache querying
    findImpl(a: any, b?: any): Promise<T | T[]>;
    findQueryImpl(a: any): Promise<T | T[]>;

    // Internal query helpers
    _query(op: string, e: any, f?: any): Promise<T | T[]>;
    _serverQuery(op: string, b: any, c?: any): Promise<T | T[]>;

    // Stale collection helpers
    _handleResume(): void;
    _handleStreamChange(): void;
    _updateFromCache(): void;
    _update(a: any, b?: any): Promise<T | T[]>;

    // Util
    // modelClass: { prototype: { isIdType: (a: any) => boolean } };

    // gadd helpers
    // gadd expects an id or an object with id attr
    // gaddUp expects an object with id attr and merges or fetches as needed
}

// BaseCollection class, as in source: g.BaseCollection
export type WAWebBaseCollectionConstructor<T = any> = new (...args: any[]) => IBaseCollection<T>;

// Error thrown for silent query handling
export class CollectionSilentQueryError extends Error {
    //   constructor(message: string);
}