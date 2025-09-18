import type { SOCKET_STATE } from "../src/waweb/WAWebSocketConstants"
import {
    Conn, Socket,
    SignalStoreApi,
    Base64,
    AdvSignatureApi,
    UserPrefsInfoStore,
    CompanionRegClientUtils,
    AltDeviceLinkingApi,
    Cmd
} from "./exports"

console.debug("Auth starting")

export class Auth {
    constructor(private onQrCode: (qrcode: string) => void) {
        Socket.on('change:state', this.onStateChange, this)
        Conn.on('change:ref', this.onRefChange, this)
        if (Conn.ref) {
            this.onRefChange(Conn, Conn.ref)
        }
        console.debug("Auth ready")
    }

    dispose() {
        Socket.on('change:state', this.onStateChange)
        Conn.on('change:ref', this.onRefChange)
        console.debug("Auth disposed")
    }

    onStateChange(_src: typeof Socket, value: SOCKET_STATE, _old?: SOCKET_STATE) {
        if (value == 'UNPAIRED_IDLE') {
            if (AltDeviceLinkingApi.getPairingType() == 'QR_CODE') {
                console.debug('Idle detected, showing QRCode again..')
                Cmd.refreshQR();
            } // else: ALT_DEVICE_LINKING
        } else if (value == 'CONNECTED') {
            this.dispose()
        }
    }

    onRefChange(_src: typeof Conn, value: string, _old?: string) {
        if (AltDeviceLinkingApi.getPairingType() != 'QR_CODE')
            return
        this.getQrCode(value).then(this.onQrCode)
    }

    async getQrCode(ref: string) {
        console.debug('Generating QRCode')
        const registrationInfo = await SignalStoreApi.getRegistrationInfo();
        const noiseKeyPair = await UserPrefsInfoStore.waNoiseInfo.get();
        const staticKeyB64 = Base64.encodeB64(noiseKeyPair.staticKeyPair.pubKey);
        const identityKeyB64 = Base64.encodeB64(registrationInfo.identityKeyPair.pubKey);
        const advSecretKey = await AdvSignatureApi.getADVSecretKey();
        const platform = CompanionRegClientUtils.DEVICE_PLATFORM;
        return [ref, staticKeyB64, identityKeyB64, advSecretKey, platform].join(',');
    }
}


