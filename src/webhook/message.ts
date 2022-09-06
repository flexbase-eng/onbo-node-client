import type { Onbo, OnboOptions, OnboError, OnboPagination } from '../'
import type { WebhookApi, Message } from './'

import { isEmpty, mkQueryParams } from '../'

export class MessageApi {
  client: Onbo
  webhook: WebhookApi

  constructor(client: Onbo, webhook: WebhookApi, _options?: OnboOptions) {
    this.client = client
    this.webhook = webhook
  }

  /*
   * Function to return a single message sent by Onbo to properly created
   * webhook endpoints. This will be based on the Onbo 'uuid' identifier
   * for the message.
   */
  async byId(messageId: string): Promise<{
    success: boolean,
    message?: Message,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `webhooks/endpoints/messages/${messageId}`,
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
   * Function to return a list of all the sent by Onbo to any of the
   * endpoints defined for this account. This will include the standard
   * Onbo pagination parameters, but also the the startDate, endDate,
   * and event type for filtering.
   */
  async list(options?: {
    startDate?: string,
    endDate?: string,
    event?: string,
    offset?: number,
    limit?: number,
  }): Promise<{
    success: boolean,
    messages?: Message[],
    error?: OnboError,
    pagination?: OnboPagination,
  }> {
    const resp = await this.client.fire(
      'GET',
      'webhooks/endpoints/messages',
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
      messages: resp?.payload?.data,
      pagination: resp?.payload?.pagination,
    }
  }

  /*
   * Function to resend (recover) a specific failed message for this Onbo
   * account. This will be resent on the existing webhook scheme, so this
   * really just asks Onbo to queue it up.
   */
  async recoverFailedMessage(messageId: string): Promise<{
    success: boolean,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'POST',
      `webhooks/endpoints/messages/${messageId}/resend`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true }
  }
}
