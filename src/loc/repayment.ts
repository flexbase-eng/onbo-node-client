import type { Onbo, OnboOptions, OnboError, OnboPagination } from '../'
import type { LineOfCreditApi, Repayment, BankInfo } from './'

import { mkQueryParams, isEmpty } from '../'

export class RepaymentApi {
  client: Onbo
  loc: LineOfCreditApi

  constructor(client: Onbo, loc: LineOfCreditApi, _options?: OnboOptions) {
    this.client = client
    this.loc = loc
  }

  /*
   * Function to take a userId and locId and return a list of all the
   * Repayments made against that LOC in Onbo.
   */
  async list(userId: string, locId: string, options?: {
    offset?: number,
    limit?: number,
  }): Promise<{
    success: boolean,
    repayments?: Repayment[],
    error?: OnboError,
    pagination?: OnboPagination,
  }> {
    const resp = await this.client.fire(
      'GET',
      `users/${userId}/loc/${locId}/payments`,
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
      repayments: resp?.payload?.data,
      pagination: resp?.payload?.pagination,
    }
  }

  /*
   * Function to take a 'userId' for a User, a 'locId' for a LOC, and a
   * 'paymentId' for the LOS Repayment submitted by that User, that should
   * already exist in the system, and return that Repayment, if it exists.
   */
  async byId(userId: string, locId: string, paymentId: string): Promise<{
    success: boolean,
    repayment?: Repayment,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `users/${userId}/loc/${locId}/payments/${paymentId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, repayment: resp?.payload }
  }

  /*
   * Function to create a new Repayment against the LOC
   * referenced by 'locId'.
   */
  async create(userId: string, locId: string, data: {
    amount: number,
    paymentType: string,
    paymentDate: string,
    originalPaymentDate: string,
    repaymentBankInfo?: BankInfo,
  }): Promise<{
    success: boolean,
    availableCredit?: number,
    currentCredit?: number,
    repaymentUuid?: string,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'POST',
      `users/${userId}/loc/${locId}/draw`,
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
