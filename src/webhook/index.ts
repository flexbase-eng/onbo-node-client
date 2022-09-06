import * as CryptoJS from 'crypto-js'

import type { Onbo, OnboOptions } from '../'

import { EndpointApi } from './endpoint'
import { MessageApi } from './message'

export interface Endpoint {
  uuid: string;
  url: string;
  description?: string;
  events?: string[];
}

export interface Message {
  uuid: string;
  event: string;
  payload: {
    fees?: any;
    uuid: string;
    achId: string;
    amount: number;
    status: string;
    product: string;
    interest: any;
    suspense: any;
    principal: any;
    achBatchId: string;
    paymentType: any;
    effectiveDate: string;
    endingBalance: number;
    completionDate: string;
    initiationDate: string;
    errorDescription: string;
    borrowerBankAccountUuid: string;
  },
  status: string;
  createdAt: string;
}

export class WebhookApi {
  client: Onbo
  endpoint: EndpointApi
  message: MessageApi

  constructor(client: Onbo, options?: OnboOptions) {
    this.client = client
    // now construct all the specific domain objects
    this.endpoint = new EndpointApi(this.client, this, options)
    this.message = new MessageApi(this.client, this, options)
  }

  /*
   * Function to take the endpoint URL, and the headers and body of the
   * webhook call from Onbo, and verify that they HMAC hashing matches
   * what they sent, and so this message is valid.
   */
  isValid(url: string, headers: any, body: object): boolean {
    const epoch = headers['EPOCH']
    const stripped = JSON.stringify(body).replace(/(\r\n|\n|\r|\s+)/gm, '')
    let md5 = ''
    if (stripped !== '') {
      md5 = CryptoJS.MD5(stripped).toString()
    }
    const hmac = CryptoJS.HmacSHA256(url + md5 + epoch, this.client.secret).toString()
    return (headers['X_STILT_HMAC'] === hmac)
  }
}
