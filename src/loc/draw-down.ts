import type { Onbo, OnboOptions, OnboError, OnboPagination } from '../'
import type { LineOfCreditApi, DrawDown, BankInfo } from './'

import { mkQueryParams, isEmpty } from '../'

export class DrawDownApi {
  client: Onbo
  loc: LineOfCreditApi

  constructor(client: Onbo, loc: LineOfCreditApi, _options?: OnboOptions) {
    this.client = client
    this.loc = loc
  }

  /*
   * Function to take a userId and locId and return a list of all the
   * Draw Downs made against that LOC in Onbo.
   */
  async list(userId: string, locId: string, options?: {
    offset?: number,
    limit?: number,
  }): Promise<{
    success: boolean,
    drawDowns?: DrawDown[],
    error?: OnboError,
    pagination?: OnboPagination,
  }> {
    const resp = await this.client.fire(
      'GET',
      `users/${userId}/loc/${locId}/disbursements`,
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
      drawDowns: resp?.payload?.data,
      pagination: resp?.payload?.pagination,
    }
  }

  /*
   * Function to create a new Draw Down (disbursement) against the LOC
   * referenced by 'locId'.
   */
  async create(userId: string, locId: string, data: {
    amount: number,
    disbursementBankInfo?: BankInfo,
  }): Promise<{
    success: boolean,
    availableCredit?: number,
    currentCredit?: number,
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
