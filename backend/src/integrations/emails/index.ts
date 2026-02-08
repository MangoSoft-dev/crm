
// import { SendGrid } from "./providers/sendgrid";
import { Smtp } from "./providers/smtp";
// import { Elasticemail } from './providers/elasticemail'
import { EmailProviderBase } from './base'
import { console } from '../../core/security/logger'

export enum EmailProviders {
    SMTP,
    SENDGRID,
    ELASTICEMAIL
}

export class Emails {

    static getProvider(provider?: EmailProviders): EmailProviderBase {
        console.log("EMAILS", "emails/index/getProvider", "provider", provider)
        switch (provider) {
            // case EmailProviders.SENDGRID:
            //     return new SendGrid()

            // case EmailProviders.ELASTICEMAIL:
            //     return new Elasticemail()

            case EmailProviders.SMTP:
            default:
                return new Smtp()

        }

    }

}

