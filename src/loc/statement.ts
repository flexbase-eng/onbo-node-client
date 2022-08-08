import type { Onbo, OnboOptions, OnboError } from '../'
import type { LineOfCreditApi, Statement } from './'

import { isEmpty } from '../'

export class StatementApi {
  client: Onbo
  loc: LineOfCreditApi

  constructor(client: Onbo, loc: LineOfCreditApi, _options?: OnboOptions) {
    this.client = client
    this.loc = loc
  }

  /*
   * Function to take a userId and locId and return a complete Statement
   * for that LOC in Onbo.
   */
  async get(userId: string, locId: string): Promise<{
    success: boolean,
    statement?: Statement,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `users/${userId}/loc/${locId}/statements`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return {
      success: true,
      statement: resp?.payload?.data,
    }
  }
}
