import type { Onbo, OnboOptions, OnboError } from '../'
import type { WebhookApi, Endpoint } from './'

import { isEmpty } from '../'

export class EndpointApi {
  client: Onbo
  webhook: WebhookApi

  constructor(client: Onbo, webhook: WebhookApi, _options?: OnboOptions) {
    this.client = client
    this.webhook = webhook
  }

  /*
   * Function to create a new webhook endpoint for messages from Onbo to
   * be sent. Onbo will send all messages to all endpoints, unless the
   * endpoint is created with a specific list of events to receive.
   */
  async create(data: Partial<Endpoint>): Promise<{
    success: boolean,
    endpoint?: Endpoint,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'POST',
      'webhooks/endpoints',
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
    return { success: true, endpoint: resp?.payload }
  }

  /*
   * Function to return a single endpoint created for this Onbo account.
   * This will be based on the Onbo 'uuid' identifier for the endpoint.
   */
  async byId(endpointId: string): Promise<{
    success: boolean,
    endpoint?: Endpoint,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `webhooks/endpoints/${endpointId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, endpoint: resp?.payload }
  }

  /*
   * Function to return a single endpoint created for this Onbo account.
   * This will be based on the URL provided during the creation of the
   * endpoint.
   */
  async byUrl(endpointUrl: string): Promise<{
    success: boolean,
    endpoint?: Endpoint,
    error?: OnboError,
  }> {
    const lst = await this.list()
    if (!lst?.success) {
      return { ...lst, success: false }
    }
    const endpoint = lst.endpoints?.find(ep => ep.url === endpointUrl)
    return { success: !!endpoint, endpoint }
  }

  /*
   * Function to update an endpoint created for this Onbo account.
   * This will be based on the Onbo 'uuid' identifier for the endpoint.
   */
  async update(endpointId: string, data: Partial<Endpoint>): Promise<{
    success: boolean,
    endpoint?: Endpoint,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'PUT',
      `webhooks/endpoints/${endpointId}`,
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
    return { success: true, endpoint: resp?.payload }
  }

  /*
   * Function to delete an endpoint created for this Onbo account.
   * This will be based on the Onbo 'uuid' identifier for the endpoint.
   */
  async delete(endpointId: string): Promise<{
    success: boolean,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'DELETE',
      `webhooks/endpoints/${endpointId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true }
  }

  /*
   * Function to return a list of all the endpoints defined for this Onbo
   * account. Unlike the other listing functions, there is no pagination
   * for this call - and all endpoints will be pulled on each call.
   */
  async list(): Promise<{
    success: boolean,
    endpoints?: Endpoint[],
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'GET',
      'webhooks/endpoints',
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, endpoints: resp?.payload }
  }

  /*
   * Function to resend (recover) all failed messages for this Onbo account.
   * The optional 'startDate' needs to be of the form 'YYYY-MM-DD', and
   * will indicate the starting date of the missed messages to resend.
   */
  async recoverFailedMessages(endpointId: string, data?: {
    startDate?: string,
  }): Promise<{
    success: boolean,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'POST',
      `webhooks/endpoints/${endpointId}/resend`,
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
    return { success: true }
  }
}
