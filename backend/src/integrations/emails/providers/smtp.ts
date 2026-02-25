import nodemailer from 'nodemailer'

import * as CONFIG from '../../../core/constants'
import { EmailProviderBase } from '../base'

export class Smtp extends EmailProviderBase {

    transporter: any

    constructor() {
        super()

        this.transporter = nodemailer.createTransport(CONFIG.SMTP_VALUES);
    }

    override async sendEmail(from: string, to: string | string[], subject: string, body: string, cc?: string | string[]) {

        const msg = {
            to: to,
            from: "info@mangosoft.dev",//|| from,
            subject: subject,
            html: body,
        }

        const info = await this.transporter.sendMail(msg);
        return info
    }

}


