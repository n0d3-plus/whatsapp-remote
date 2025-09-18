// Type definitions for WAWebChatCollection (ChatCollection).
// This extends the WAWebBaseCollection with Chat-specific properties and methods.

import type { IBaseCollection } from "./WAWebBaseCollection";
import type { IWAWebChatModel } from "./WAWebChatModel";

export interface IWAWebChatCollection extends IBaseCollection<IWAWebChatModel> {
  // Custom collection properties
  notSpam: { [id: string]: boolean };
  promises: { sendUnstarAll: null | Promise<any> };
  _sortEnabled: boolean;
  _viewOnceCleanupTaskQueue: Set<any>;
  _viewOnceCleanupTimeout?: any;

  // Custom methods
  setIndexes(): void;
  enableSortListener(forceSort?: boolean): void;
  disableSortListener(): void;
  getUnreadCount(): number;
  getActive(): IWAWebChatModel | undefined;
  getChatByAccountLid(accountLid: any): IWAWebChatModel | null;
  unstarAllMessages(a: any, b: any): Promise<any>;
  hasAnyUnreadSinceGivenTimestamp(ts: number): boolean;
  _scheduleViewOnceMediaCleanup(): void;
  _runViewOnceMediaCleanup(): void;

  // Override for delete to re-add sort listener
  delete(): void;
}

export type WAWebChatCollectionConstructor = new (...args: any[]) => IWAWebChatCollection;

// Singleton instance (as in source: g.ChatCollection)
export declare const ChatCollection: IWAWebChatCollection;