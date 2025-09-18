// Type definitions for WAWebWid (Wid)
// Types are inferred from the source and common usage patterns.

export interface IWAWebWid {
  user: string;
  device?: number | null;
  server: string;
  _serialized: string;

  // Instance methods
  getUserPartForLog(): string;
  toString(options?: {
    legacy?: boolean;
    formatFull?: boolean;
    formatIncludeDevice?: boolean;
    formatIncludeAgent?: boolean;
    forLog?: boolean;
  }): string;
  toLogString(): string;
  toJid(): string;
  getJidServer(): string;
  getDeviceId(): number;
  equals(b: any): boolean;
  isLessThan(b: any): boolean;
  isGreaterThan(b: any): boolean;
  isCompanion(): boolean;
  isSameAccountAndAddressingMode(a: IWAWebWid): boolean;
  isUser(): boolean;
  isRegularUserPn(): boolean;
  isLid(): boolean;
  isUserNotPSA(): boolean;
  isRegularUser(): boolean;
  isBroadcast(): boolean;
  isBroadcastList(): boolean;
  isOfficialBizAccount(): boolean;
  isEligibleForUSync(): boolean;
  isGroup(): boolean;
  isGroupCall(): boolean;
  isServer(): boolean;
  isPSA(): boolean;
  isIAS(): boolean;
  isStatus(): boolean;
  isSupportAccount(): boolean;
  isCAPISupportAccount(): boolean;
  isNewsletter(): boolean;
  isBot(): boolean;
  isPnBot(): boolean;
  isFbidBot(): boolean;
  toJSON(): string;
  isHosted(): boolean;
}

// Static interface for Wid class
export interface WAWebWidStatic {
  new (widStr: string, opts: { intentionallyUsePrivateConstructor: boolean }): IWAWebWid;
  isUserWid(a: IWAWebWid): boolean;
  isUserLid(a: IWAWebWid): boolean;
  isXWid(server: string, c: any): boolean;
  isHostedDeviceId(a: any): boolean;
  isUser(b: any): boolean;
  isLid(b: any): boolean;
  isBroadcast(b: any): boolean;
  isGroup(b: any): boolean;
  isNewsletter(b: any): boolean;
  isHosted(b: any): boolean;
  isFbidBot(b: any): boolean;
  isPnBot(b: any): boolean;
  isBot(b: any): boolean;
  isRegularUser(a: any): boolean;
  isRegularUserPn(a: any): boolean;
  isRegularUserNoImply(a: any): boolean;
  isGroupCall(b: any): boolean;
  isWid(b: any): boolean;
  isServer(b: any): boolean;
  isPSA(b: any): boolean;
  isIAS(b: any): boolean;
  isStatus(b: any): boolean;
  isSupportAccount(b: any): boolean;
  isCAPISupportAccount(b: any): boolean;
  isOfficialBizAccount(b: any): boolean;
  isEligibleForUSync(b: any): boolean;
  user(b: any): string | undefined;
  equals(b: any, c: any): boolean;
  isLessThan(b: any, c: any): boolean;
  isGreaterThan(b: any, c: any): boolean;
}

export declare const WAWebWid: WAWebWidStatic;