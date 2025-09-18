// Type definitions for WAWebWidFactory
// Types are inferred from the implementation and typical usage; refine as needed.

import type { IWAWebWid } from "./WAWebWid";

export interface IWAWebWidFactory {
    // Wid creation and conversion
    createWid(widlike: string | IWAWebWid): IWAWebWid;
    createHostedDeviceWid(widlike: string): IWAWebWid;
    createWidFromWidLike(a: string | IWAWebWid | { _serialized: string }): IWAWebWid;
    isWidlike(a: any): boolean;
    createDeviceWidFromDeviceListPk(
        jid: string,
        deviceId: number,
        hosted?: boolean
    ): IWAWebWid;
    createUserWidFromDeviceListPk(jid: string): IWAWebWid;
    createDeviceWidFromUserAndDevice(user: string, server: string, deviceId: number): IWAWebWid;
    widFromSignalAddress(a: string): IWAWebWid;
    createDeviceWidFromWid(a: IWAWebWid): IWAWebWid;
    createDeviceWid(a: string | IWAWebWid): IWAWebWid;
    createUserWid(a: string, b?: string): IWAWebWid;
    toUserWid(a: IWAWebWid): IWAWebWid;
    toUserLidOrThrow(a: IWAWebWid): IWAWebWid;
    toChatWid(a: IWAWebWid): IWAWebWid;
    toGroupWid(a: IWAWebWid): IWAWebWid;
    toNewsletterWid(a: IWAWebWid): IWAWebWid;
}

export declare const WAWebWidFactory: IWAWebWidFactory;
