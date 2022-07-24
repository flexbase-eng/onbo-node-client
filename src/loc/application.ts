import type { Onbo, OnboOptions, OnboError, OnboPagination } from '../'
import type { LineOfCreditApi, LineOfCredit, Offer, BankInfo } from './'

import { mkQueryParams, isEmpty } from '../'

export class ApplicationApi {
  client: Onbo
  loc: LineOfCreditApi

  constructor(client: Onbo, loc: LineOfCreditApi, _options?: OnboOptions) {
    this.client = client
    this.loc = loc
  }

  /*
   * Function to take an optional userId and some standard Onbo paging
   * parameters and return a list of all the LOC Applications for that User
   * in Onbo for within the range identified by those paging parameters.
   * The Onbo defaults are: 'offset' of 0, and 'limit' of 25.
   *
   * If there is no 'userId' provided, then this will list *all* LOC
   * Applications in all of Onbo for this account.
   */
  async list(userId?: string, options?: {
    offset?: number,
    limit?: number,
  }): Promise<{
    success: boolean,
    applications?: LineOfCredit[],
    error?: OnboError,
    pagination?: OnboPagination,
  }> {
    const uri = userId ? `users/${userId}/loc/applications` : 'users/loc/applications'
    const resp = await this.client.fire(
      'GET',
      uri,
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
      applications: resp?.payload?.data,
      pagination: resp?.payload?.pagination,
    }
  }

  /*
   * Function to take a 'userId' for a User, and an 'applicationId' for the
   * LOS Application submitted by that User, that should already
   * exist in the system, and return that LOS Application, if it exists.
   */
  async byId(userId: string, applicationId: string): Promise<{
    success: boolean,
    application?: LineOfCredit,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `users/${userId}/loc/applications/${applicationId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, application: resp?.payload }
  }

  /*
   * Function to take a 'userId' for a User, and an 'offerId' for the
   * LOS Application Offer for that User, that should already
   * exist in the system, and return the Document uuid and URL to
   * pull a PDF copy of that Promissory Note. As Onbo's docs describe it:
   *
   *   Returns an object with a link to the hosted pdf of the promissory
   *   note document. After a LOC is activated, the document_url will
   *   return the executed document. The document_uuid expires after 24
   *   hours
   */
  async promissoryNote(userId: string, offerId: string): Promise<{
    success: boolean,
    documentUuid?: string,
    documentUrl?: string,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `users/${userId}/loc/${offerId}/documents/promissory_note`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { ...resp?.payload, success: true }
  }

  /*
   * Function to create a new LOC Application based on the provided data,
   * and attached to the User referenced by the 'userId'. This will either
   * contain a decision on the LOC, or it can use Onbo's decisioning engine
   * to accept/reject the LOC application.
   */
  async create(userId: string, data: {
    amount: number,
    decision?: string,
    offers?: Partial<Offer>[],
    reasons?: string[],
  }): Promise<{
    success: boolean,
    lineOfCredit?: LineOfCredit,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'POST',
      `users/${userId}/loc/applications`,
      undefined,
      undefined,
      data,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, lineOfCredit: resp?.payload }
  }

  /*
   * Function to activate an LOC for the provided 'offerId'
   * on the provided 'userId' parent User.
   */
  async activate(userId: string, offerId: string, data: {
    status: string,
    documentUuid: string,
    disbursementBankInfo?: BankInfo,
    repaymentBankInfo?: BankInfo,
  }): Promise<{
    success: boolean,
    status?: string,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'PATCH',
      `users/${userId}/loc/${offerId}`,
      undefined,
      undefined,
      data,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { ...resp?.payload, success: true }
  }
}
