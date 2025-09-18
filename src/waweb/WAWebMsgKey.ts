// TypeScript types for the WAWebMsgKey JavaScript class/module

import type { IWAWebWid } from "./WAWebWid";

// Represents the structure for constructing a MsgKey
export type MsgKeyInput =
    | {
        fromMe?: boolean;
        remote: string | IWAWebWid;
        id: string;
        participant?: string | IWAWebWid;
        from?: IWAWebWid; // legacy
        to?: IWAWebWid;   // legacy
        selfDir?: string; // legacy
    }
    | string
    | IWAWebMsgKey;

// The main MsgKey class type
export interface IWAWebMsgKey {
    fromMe: boolean;
    remote: IWAWebWid;
    id: string;
    participant?: IWAWebWid;
    self?: string;
    _serialized: string;

    // Instance methods
    toString(): string;
    clone(): IWAWebMsgKey;
    equals(other: any): boolean;
}

// The static side of the class
export interface WAWebMsgKeyStatic {
    new(input: MsgKeyInput): IWAWebMsgKey;

    fromString(s: string): IWAWebMsgKey;
    from(input: MsgKeyInput): IWAWebMsgKey;

    /**
     * Generates a new message key (SHA256 or fallback).
     * Returns something like "3EB0D75F399929B8A83372"
     */
    newId(): Promise<string>;
    newId_DEPRECATED(): string;
}

export declare const WAWebMsgKey: WAWebMsgKeyStatic;