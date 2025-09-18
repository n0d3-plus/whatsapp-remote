// Type definitions for WAWebMsgCollection (MsgCollection)
// Types are inferred from constructor, methods, and collection usage
// Refine any `any` types for your app as needed

import type { IBaseCollection } from "./WAWebBaseCollection";
import type { IWAWebMsgModel } from "./WAWebMsgModel";

export interface IWAWebMsgCollection extends IBaseCollection<IWAWebMsgModel> {
    // Properties
    pendingAdd: { [key: string]: Promise<any> | null };
    ftsCache: { [key: string]: Promise<any> | null };
    productListMessagesPrefetchChain: Promise<any[]>;
    _editKeyByParentKey: Map<string, string>;
    _parentKeyByEditKey: Map<string, string>;
    _encryptedData: any;

    // Aggregated collections
    byParentMessage: any;
    byChat: any;

    // Core collection operations
    // add(b: IWAWebMsgModel | IWAWebMsgModel[], e?: any): any;
    removeFromCollection(a: IWAWebMsgModel): void;
    // get(a: any): IWAWebMsgModel | undefined;
    // some(cb: (a: IWAWebMsgModel) => boolean): boolean;
    // filter(cb: (a: IWAWebMsgModel) => boolean): IWAWebMsgModel[];
    // includes(a: IWAWebMsgModel): boolean;

    // Message search and query
    search(
        searchTerm: string,
        page?: number,
        count?: number,
        remote?: any,
        opts?: { label?: string; kind?: string }
    ): Promise<{ messages: IWAWebMsgModel[]; eof: boolean; canceled: boolean }>;
    _search(
        searchTerm: string,
        page: number,
        count: number,
        remote: any,
        label?: string,
        kind?: string
    ): Promise<{ messages: IWAWebMsgModel[]; eof: boolean; canceled: boolean }>;

    // Batch message processing
    processMultipleMessages(
        chatId: any,
        messages: any[],
        options: any,
        context: string,
        msgChunkCb?: () => any,
        storePending?: boolean
    ): Promise<any>;

    // Prefetch helpers
    _prefetchProductListMessages(a: IWAWebMsgModel[]): void;
    processVCardMessagesForLidMappings(a: IWAWebMsgModel[]): void;

    // Message context navigation
    getContext(a: any, e?: any): Promise<any>;
    findQueryImpl(a: any): Promise<any>;

    // Message queries by type
    getStarred(a?: any, count?: number, filter?: any): Promise<any>;
    getEventMsgs(a?: any, count?: number, filter?: any): Promise<any>;
    getVoipCallLogMsgs(count?: number, filter?: any): Promise<any>;
    getAllMediaMsgs(count?: number, filter?: any): Promise<any>;
    getAllLinksMsgs(count?: number, filter?: any): Promise<any>;
    getAllDocsMsgs(count?: number, filter?: any): Promise<any>;
    queryMedia(
        remote: any,
        count: number,
        direction: string,
        msgKey: any,
        media: string
    ): Promise<any>;
    queryVcard(a: any): Promise<any>;

    // Message id hydration
    getMessagesById(a: any[]): Promise<any>;
    hydrateOrGetMessages(a: any[]): Promise<any[]>;

    // Edits and parent-child
    getByEditMsgKey(a: any): IWAWebMsgModel | undefined;
    processEditedMessages(a: IWAWebMsgModel[]): void;

    // Ephemeral and bot helper
    addInitialBotTypingIndicatorToChat(a: any, b: any): Promise<void>;
    encryptAndClearModels(): Promise<void>;
    decryptAndSetModels(a: any): Promise<void>;

    // Collection state
    hasSynced(): Promise<any>;
    hasUnsentMessages(): boolean;
    makeParentMessagesVisibleInChat(a: IWAWebMsgModel[]): void;

    // Incremental update helpers
    incrementalStarredUpdate(a: any): any;

    // Misc util
    removeFromCollection(a: IWAWebMsgModel): void;
}

export type WAWebMsgCollectionConstructor = new (...args: any[]) => IWAWebMsgCollection;

// Singleton instance (as in source: g.MsgCollection)
export declare const MsgCollection: IWAWebMsgCollection;