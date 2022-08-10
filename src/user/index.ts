import type { Onbo, OnboOptions, OnboError, OnboPagination } from '../'

import { KeyPersonApi } from './key-person'

export interface Consumer extends Person {
  uuid: string;
  userType: string;
  website?: string;
  dwollaCustomerUrl?: string;
  assetReportJsonGzip?: string;
  creditReportXmlGzip?: string;
}

export interface Business {
  uuid: string;
  userType: string;
  firstName: string;
  email: string;
  phone?: string;
  ein: string;
  startDate?: string;
  entity?: string;
  website?: string;
  address?: Address;
  keyPeople?: Person[];
}

export type User = Consumer | Business

export interface Person {
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  email: string;
  phone?: string;
  ssn: string;
  address?: Address;
  citizenship?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  line3?: string;
  zip: string;
  city: string;
  state: string;
  country: string;
}

import { mkQueryParams, isEmpty, aesEncrypt } from '../'

export class UserApi {
  client: Onbo
  keyPerson: KeyPersonApi

  constructor(client: Onbo, options?: OnboOptions) {
    this.client = client
    // now construct all the specific domain objects
    this.keyPerson = new KeyPersonApi(this.client, this, options)
  }

  /*
   * Function to take some standard Onbo paging parameters and return a
   * list of all the 'Users' in Onbo for your organization within the
   * range identified by those paging parameters. The Onbo defaults are:
   * 'offset' of 0, and 'limit' of 25.
   */
  async list(options?: {
    offset?: number,
    limit?: number,
  }): Promise<{
    success: boolean,
    users?: User[],
    error?: OnboError,
    pagination?: OnboPagination,
  }> {
    const resp = await this.client.fire(
      'GET',
      'users',
      undefined,
      mkQueryParams(options),
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return {
      success: true,
      users: resp?.payload?.data.map((u: any) => this.fromOnbo(u)),
      pagination: resp?.payload?.pagination,
    }
  }

  /*
   * Function to take an 'userId' for a User that should already
   * exist in the system, and return that User, if it exists.
   */
  async byId(userId: string): Promise<{
    success: boolean,
    user?: User,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `users/${userId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, user: this.fromOnbo(resp?.payload) }
  }

  /*
   * Function to create a new User based on the provided data. This will
   * be the Consumer, or Business, that can later be the holder of a Loan
   * or Line of Credit.
   */
  async create(data: Partial<User>): Promise<{
    success: boolean,
    user?: User,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'POST',
      'users',
      undefined,
      undefined,
      this.toOnbo(data),
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, user: this.fromOnbo(resp?.payload) }
  }

  /*
   * Function to delete a User based on the provided 'userId'.
   * Onbo describes this as:
   *
   *   Permanently deletes a user. This cannot be undone.
   *
   *   Returns a message confirming user deletion upon success. If the
   *   user id does not exist then this call will return an error. An
   *   error will also be returned if the user has any outstanding
   *   balances due.
   */
  async delete(userId: string): Promise<{
    success: boolean,
    message?: string,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'DELETE',
      `users/${userId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, message: resp?.payload }
  }

  /*
   * Function to take a userId and a User object, in part, or whole, and
   * updates the User at Onbo with this information. The return value will
   * be the updated User.
   */
  async update(userId: string, data: Partial<User>): Promise<{
    success: boolean,
    user?: User,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'PUT',
      `users/${userId}`,
      undefined,
      undefined,
      this.toOnbo(data),
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, user: this.fromOnbo(resp?.payload) }
  }

  /*
   * Function to take what we expect to receive, and prepare it to be sent
   * to Onbo. Some of the felds need to have specific formatting, and some
   * even need encryption, so we have to that what we expect, and then make
   * it idgestible for Onbo.
   */
  toOnbo(arg: any): any {
    // make a deep copy for mutations
    let rdy = JSON.parse(JSON.stringify(arg))
    if (typeof rdy.address?.country === 'string') {
      // only allow 'United States' - not 'US'
      if (rdy.address.country.toUpperCase() === 'US') {
        rdy.address.country = 'United States'
      }
    }
    if (!isEmpty(rdy.ssn)) {
      // keep just the digits and AES encrypt them
      const dig = rdy.ssn.match(/[0-9]/g) ?? []
      if (dig.length == 9) {
        rdy.ssn = aesEncrypt(dig.join(''), this.client.secret)
      }
    }
    if (!isEmpty(rdy.phone)) {
      // they want nothing but digits for the phone
      const dig = rdy.phone!.match(/[0-9]/g) ?? []
      if (dig.length == 10) {
        rdy.phone = dig.join('')
      }
    }

    // ...these are for the Business Users...
    if (!isEmpty(rdy.ein)) {
      // keep just the digits and AES encrypt them
      const dig = rdy.ein.match(/[0-9]/g) ?? []
      if (dig.length == 9) {
        rdy.ein = aesEncrypt(dig.join(''), this.client.secret)
      }
    }
    if (!isEmpty(rdy.keyPeople)) {
      // run each person in the array through the same function...
      rdy.keyPeople = rdy.keyPeople.map((p: any) => this.toOnbo(p))
    }
    return rdy
  }

  /*
   * Function to take what we get from Onbo and try to make it look as we
   * expect with countries as ISO codes and phone numbers with dashes
   * like ###-###-####.
   */
  fromOnbo(arg: any): any {
    // make a deep copy for mutations
    let rdy = JSON.parse(JSON.stringify(arg))
    if (typeof rdy.address?.country === 'string') {
      // converty to ISO code for 'United States' : 'US'
      if (rdy.address.country.toUpperCase() === 'UNITED STATES') {
        rdy.address.country = 'US'
      }
    }
    if (!isEmpty(rdy.phone)) {
      // let's stick with XXX-XXX-XXXX
      const dig = rdy.phone.match(/[0-9]/g) ?? []
      if (dig.length == 10) {
        rdy.phone = dig.slice(0,3).join('') + '-' +
                    dig.slice(3,6).join('') + '-' +
                    dig.slice(-4).join('')
      }
    }

    // ...these are for the Business Users...
    if (!isEmpty(rdy.keyPeople)) {
      // run each person in the array through the same function...
      rdy.keyPeople = rdy.keyPeople.map((p: any) => this.fromOnbo(p))
    }
    return rdy
  }

  /*
   * Testing functions to understand the problem with the Javascript
   * execution of the mapping functions.
   */
  toOnboLog(arg: any): any {
    // make a deep copy for mutations
    let rdy = JSON.parse(JSON.stringify(arg))
    if (typeof rdy.address?.country === 'string') {
      // only allow 'United States' - not 'US'
      console.log('COUNTRY', rdy.address.country.toUpperCase())
      if (rdy.address.country.toUpperCase() === 'US') {
        rdy.address.country = 'United States'
      }
    }
    if (!isEmpty(rdy.ssn)) {
      // keep just the digits and AES encrypt them
      const dig = rdy.ssn.match(/[0-9]/g) ?? []
      console.log('SSN', dig.join(''), dig.length)
      if (dig.length == 9) {
        rdy.ssn = aesEncrypt(dig.join(''), this.client.secret)
      }
    }
    if (!isEmpty(rdy.phone)) {
      // they want nothing but digits for the phone
      const dig = rdy.phone!.match(/[0-9]/g) ?? []
      console.log('PHONE', dig.join(''), dig.length)
      if (dig.length == 10) {
        rdy.phone = dig.join('')
      }
    }

    // ...these are for the Business Users...
    if (!isEmpty(rdy.ein)) {
      // keep just the digits and AES encrypt them
      const dig = rdy.ein.match(/[0-9]/g) ?? []
      console.log('EIN', dig.join(''), dig.length)
      if (dig.length == 9) {
        rdy.ein = aesEncrypt(dig.join(''), this.client.secret)
      }
    }
    if (!isEmpty(rdy.keyPeople)) {
      // run each person in the array through the same function...
      rdy.keyPeople = rdy.keyPeople.map((p: any) => this.toOnboLog(p))
    }
    return rdy
  }

  /*
   * Do before and after comparisons
   */
  toCheck(arg: any): any {
    const rdy = this.toOnbo(arg)
    return {
      before: arg,
      after: rdy,
      loggy: this.toOnboLog(arg),
      reverse: this.fromOnbo(rdy),
    }
  }

}
