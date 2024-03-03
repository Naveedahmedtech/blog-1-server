import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {
    // SendGrid.setApiKey(this.configService.get<string>('sendGrid_api_key'));
      const apiKey = this.configService.get<string>('sendGrid_api_key');
      if (!apiKey) {
        throw new Error('SendGrid API key is not configured');
      }
      SendGrid.setApiKey(apiKey);
  }

  async sendMail(email: SendGrid.MailDataRequired) {
    try {
      const transport = await SendGrid.send(email);
      console.log(`Email successfully dispatched to ${email.to}`);
      return transport;
    } catch (error) {
      console.log('Email failed to be sent', error);
      return error.message;
    }
  }

  async sendVerificationEmail(
    username: string,
    email: string,
    verificationToken: string,
  ) {
    const emailContent = {
      to: email,
      from: this.configService.get<string>('sendGrid_sender'),
      subject: 'Verify Email',
      text: `Welcome ${username} !`,
      html: `<h1>Please verify your email</h1>
                   <br />
                   <a href="${this.configService.get<string>(
                     'client_host',
                   )}/auth/verify-email?verification_token=${verificationToken}&username=${username}&email=${email}" 
                      style="background-color: blue; color: white; padding: 0.5em;">
                   Verify
                   </a>`,
    };
    return this.sendMail(emailContent);
  }

  async sendResetPasswordEmail(
    username: string,
    email: string,
    verificationToken: string,
  ) {
    const emailContent = {
      to: email,
      from: this.configService.get<string>('sendGrid_sender'),
      subject: 'Reset Password',
      text: `Welcome ${username} !`,
      html: `<h1>Click below to reset your password!</h1>
                   <br />
                   <a href="${this.configService.get<string>(
                     'client_host',
                   )}/auth/reset-password?verification_token=${verificationToken}&username=${username}&email=${email}" 
                      style="background-color: blue; color: white; padding: 0.5em;">
                   Reset Password
                   </a>`,
    };
    return this.sendMail(emailContent);
  }
}
