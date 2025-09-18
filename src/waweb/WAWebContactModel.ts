// Type definitions for the Contact model (WAWebContactModel)
// All types are inferred as `any` unless specified; refine as needed.
// Extends WAWebBaseModel and includes Contact-specific fields and methods.

import type { IBaseModel } from "./WAWebBaseModel";

export interface IWAWebContactModel extends IBaseModel {
  // Properties from WAWebBaseModel.prop/session
  id: any;
  name: any;
  shortName: any;
  pushname: any;
  type: string;
  verifiedName: any;
  isBusiness: any;
  isEnterprise: any;
  isSmb: any;
  verifiedLevel: any;
  privacyMode: any;
  statusMute: any;
  sectionHeader: any;
  labels: any;
  isContactSyncCompleted: any;
  forcedBusinessUpdateFromServer: any;
  disappearingModeDuration: any;
  disappearingModeSettingTimestamp: any;
  textStatusString: any;
  textStatusEmoji: any;
  textStatusEphemeralDuration: any;
  textStatusLastUpdateTime: any;
  textStatusExpiryTs: any;
  requestedPnTimestamp: any;
  username: any;
  usernamePin: any;
  usernameCountryCode: any;
  syncToAddressbook: boolean;

  // Session properties
  isContactBlocked: boolean;
  isContactOptedOut: boolean;
  isEverOptedOutOfMarketingMessages: boolean;
  isMarketingMessageThread: boolean;
  verificationString: any;
  verificationBinary: any;
  pendingAction: number;
  promises: any;
  status: any;
  profilePicThumb: any;
  businessProfile: any;
  commonGroups: any;
  businessCatalog: any;
  locale: any;
  shareOwnPn: any;
  phoneNumber: any;
  displayNameLID: any;
  isHosted: boolean;
  isOrHasBeenHosted: boolean;
  // Virtual or generated in storage sync?
  isAddressBookContact: boolean;
  isFavorite: boolean;
  meTextStatusExpiryTimer: any;
  maybeCommonGroupChatModel: any;
  canSendMsgWhileTimelocked: boolean;

  // Methods
  initialize(): void;
  $Contact$p_1(): void;
  setupStatusExpiration(): void;
  updateName(): void;
  updateShortName(): void;
  updateLidContactName(): void;
  copyNameFromPnContact(a: any): void;
  getStatus(): any;
  getProfilePicThumb(): any;
  addPendingAction(a: Promise<any>): Promise<any>;
  decPending(): void;
  updateContactBlocked(): void;
  updateContactOptedOutOfMarketingMessages(): void;
  setIsMarketingMessageThread(a: boolean): void;
  getIsMarketingMessageThread(): boolean;
  searchMatch(a: string, b?: string, e?: any): boolean;
  set(b: string | object, c?: any, e?: any): this;
  getCollection(): any;
  setNotMyContact(): void;
  getSyncToAddressbook(): boolean;
  canToggleFavorite(): boolean;
}

export type WAWebContactModelConstructor = new (...args: any[]) => IWAWebContactModel;

// Singleton instance (as in source: g.default)
export declare const WAWebContactModel: IWAWebContactModel;