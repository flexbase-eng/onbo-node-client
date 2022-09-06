import fetch from 'node-fetch'
import FormData = require('formdata')
import path from 'path'
import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'
import * as CryptoJS from 'crypto-js'

import { UserApi } from './user'
import { LineOfCreditApi } from './loc'
import { WebhookApi } from './webhook'

const ClientVersion = require('../package.json').version
const PROTOCOL = 'https'
const ONBO_HOST = 'api.stilt.com/v1'

/*
 * These are the acceptable options to the creation of the Client:
 *
 *   {
 *     host: 'withpersona.com/api/v1',
 *     clientId: 'persona_sandbox_abcdefg123456xyz',
 *     secret: 'abcdefg',
 *   }
 *
 * and the construction of the Client will use this data for all
 * calls made to Onbo.
 */
export interface OnboOptions {
  host?: string;
  clientId?: string;
  secret?: string;
}

/*
 * These are the standard error objects from Onbo - and will be returned
 * from Onbo for any bad condition. We will allow these - as well as just
 * strings in the errors being returned from the calls.
 */
export interface OnboError {
  type: string;
  code?: string;
  message?: string;
}

/*
 * This is the standard pagination data that comes back on the 'list'
 * function calls that needs to be returned so that the caller can know
 * here this data falls in the complete set for the domain.
 */
export interface OnboPagination {
  offset?: number;
  limit?: number;
  total?: number;
}

/*
 * This is the main constructor of the Onbo Client, and will be called
 * with something like:
 *
 *   import { Onbo } from "onbo-node-client"
 *   const client = new Onbo({
 *     clientId: '54321dcba77884',
 *     secret: 'acb1123',
 *     responseCase: 'camel',
 *   })
 */
export class Onbo {
  host: string
  clientId: string
  secret: string
  user: UserApi
  loc: LineOfCreditApi
  webhook: WebhookApi

  constructor (clientId: string, secret: string, options?: OnboOptions) {
    this.host = options?.host ?? ONBO_HOST
    this.clientId = options?.clientId ?? clientId
    this.secret = options?.secret ?? secret
    // now construct all the specific domain objects
    this.user = new UserApi(this, options)
    this.loc = new LineOfCreditApi(this, options)
    this.webhook = new WebhookApi(this, options)
  }

  /*
   * Function to fire off a GET, PUT, POST, (method) to the uri, preceeded
   * by the host, with the optional query params, and optional body, and
   * puts the 'clientId', and 'secret' values into the headers for the call,
   * and fires off the call to the Onbo host and returns the response.
   */
  async fire(
    method: string,
    uri: string,
    headers?: any,
    query?: { [index: string] : number | string | string[] | boolean },
    body?: object | object[] | FormData,
  ): Promise<{ response: any, payload?: any }> {
    // see if we need the
    // build up the complete url from the provided 'uri' and the 'host'
    let url = new URL(PROTOCOL+'://'+path.join(this.host, uri))
    if (query) {
      Object.keys(query).forEach(k => {
        if (something(query![k])) {
          url.searchParams.append(k, query![k].toString())
        }
      })
    }
    const isForm = isFormData(body)
    // create the values to stuff into the headers
    const epoch = new Date().getTime()
    const fullUrl = url.toString()
    let content = ''
    if (isForm) {
      content = body!.toString()
    } else if (!isEmpty(body)) {
      content = JSON.stringify(snakecaseKeys(body!))
        .replace(/line1/g, 'line_1')
        .replace(/line2/g, 'line_2')
        .replace(/line3/g, 'line_3')
    }
    let stripped = content.replace(/(\r\n|\n|\r|\s+)/gm, '')
    let md5 = ''
    if (stripped !== '') {
      md5 = CryptoJS.MD5(stripped).toString()
    }
    const hmac = CryptoJS.HmacSHA256(fullUrl + md5 + epoch, this.secret).toString()
    // make the appropriate headers
    headers = { ...headers,
      'X_CLIENT_UUID': this.clientId,
      EPOCH: epoch,
      'X_STILT_HMAC': hmac,
      'Content-MD5': md5,
      Accept: 'application/json',
      'X-Onbo-Client-Ver': ClientVersion,
    } as any
    if (!isForm && !isEmpty(body)) {
      headers = { ...headers, 'Content-Type': 'application/json' }
    }
    // allow a few retries on the authentication token expiration
    let response: any
    try {
      response = await fetch(url, {
        method: method,
        body: isForm ? (body as any) : (body ? content : undefined),
        headers,
        redirect: 'follow',
      })
      // ...get the payload of the response, and case it correctly
      const payload = camelcaseKeys((await response?.json()), { deep: true })
      return { response, payload }
    } catch (err) {
      return { response }
    }
  }
}

/*
 * Simple function used to weed out undefined and null query params before
 * trying to place them on the call.
 */
function something(arg: any) {
  return arg || arg === false || arg === 0 || arg === ''
}

/*
 * Function to examine the argument and see if it's 'empty' - and this will
 * work for undefined values, and nulls, as well as strings, arrays, and
 * objects. If it's a regular data type - then it's "not empty" - but this
 * will help know if there's something in the data to look at.
 */
export function isEmpty(arg: any): boolean {
  if (arg === undefined || arg === null) {
    return true
  } else if (typeof arg === 'string' || Array.isArray(arg)) {
    return arg.length == 0
  } else if (typeof arg === 'object') {
    return Object.keys(arg).length == 0
  }
  return false
}

/*
 * Simple predicate function to return 'true' if the argument is a FormData
 * object - as that is one of the possible values of the 'body' in the fire()
 * function. We have to handle that differently on the call than when it's
 * a more traditional JSON object body.
 */
function isFormData(arg: any): boolean {
  let ans = false
  if (arg && typeof arg === 'object') {
    ans = (typeof arg._boundary === 'string' &&
           arg._boundary.length > 20 &&
           Array.isArray(arg._streams))
  }
  return ans
}

/*
 * Convenience function to create an OnboError based on a simple message
 * from the Client code. This is an easy way to make OnboError instances
 * from the simple error messages we have in this code.
 */
export function mkError(message: string): OnboError {
  return {
    type: 'client',
    message,
  }
}

/*
 * Simple function the make sure the argument is a number - string or not.
 * This works by defaulting to 0, even in the case of 'undefined' values.
 */
export function atof(arg: any): any {
  if (typeof arg === 'number') {
    return arg
  } else if (typeof arg === 'string') {
    return Number((arg || '0').replace(/,|\$/g, ''))
  } else if (Array.isArray(arg)) {
    return arg.map(x => atof(x))
  }
  return 0
}

/*
 * Function to recursively remove all the 'empty' values from the provided
 * Object and return what's left. This will not cover the complete boolean
 * falsey set.
 */
export function removeEmpty(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(itm => removeEmpty(itm)) }
  else if (typeof obj === 'object') {
    return Object.entries(obj)
      .filter(([_k, v]) => !isEmpty(v))
      .reduce(
        (acc, [k, v]) => (
          { ...acc, [k]: v === Object(v) ? removeEmpty(v) : v }
        ), {}
      )
  }
  return obj
}

/*
 * Function to create the 'standard' Onbo query params from the options
 * supplied to many of the functions in this library. This just saves
 * code and time.
 */
export function mkQueryParams(arg: any): any {
  let ans = {} as any
  if (!isEmpty(arg?.limit)) {
    ans['limit'] = arg.limit
  }
  if (!isEmpty(arg?.offset)) {
    ans['offset'] = arg.offset
  }
  if (!isEmpty(arg?.event)) {
    ans['event'] = arg.event
  }
  if (!isEmpty(arg?.startDate)) {
    ans['start_date'] = arg.startDate
  }
  if (!isEmpty(arg?.endDate)) {
    ans['end_date'] = arg.endDate
  }
  return ans
}

/*
 * Onbo requires that we use AES encryption on the 'ssn' field of the
 * User, and on their docs:
 *
 *   https://docs.onbo.com/implementation-guides/creating-and-managing-users
 *
 * they give the following code as an example of how to do this. We
 * have not altered this one bit - it's Onbo's code, that we are using
 * in preparing the User data for sending to them.
 */
export function aesEncrypt(arg: string, secret: string): string {
  const iv = CryptoJS.lib.WordArray.random(16)
  return iv.concat(
    CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(`${encodeURI(arg)}`),
      CryptoJS.enc.Utf8.parse(secret.split('-').join('')),
      { iv: iv }
    ).ciphertext
  ).toString(CryptoJS.enc.Base64)
}

