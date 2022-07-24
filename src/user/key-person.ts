import type { Onbo, OnboOptions, OnboError, OnboPagination } from '../'
import type { UserApi, User } from './'

import { mkQueryParams, isEmpty } from '../'

export class KeyPersonApi {
  client: Onbo
  user: UserApi

  constructor(client: Onbo, user: UserApi, _options?: OnboOptions) {
    this.client = client
    this.user = user
  }

  /*
   * Function to take a userId and some standard Onbo paging parameters
   * and return a list of all the 'Key People' for that User' in Onbo for
   * within the range identified by those paging parameters. The Onbo
   * defaults are: 'offset' of 0, and 'limit' of 25.
   */
  async list(userId: string, options?: {
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
      `users/${userId}/key_people`,
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
      users: resp?.payload?.data.map((u: User) => this.user.fromOnbo(u)),
      pagination: resp?.payload?.pagination,
    }
  }

  /*
   * Function to take an 'userId' for a User, and a 'keyPersonId' for the
   * Key Person attached to that User, that should already
   * exist in the system, and return that Key Person (User), if it exists.
   */
  async byId(userId: string, keyPersonId: string): Promise<{
    success: boolean,
    user?: User,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `users/${userId}/key_people/${keyPersonId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, user: this.user.fromOnbo(resp?.payload) }
  }

  /*
   * Function to create a new Key Person (User) based on the provided data,
   * and attached to the User referenced by the 'userId'. This will be
   * an Officer or Owner of the parent User, and is really focused on the
   * Users that are Businesses.
   */
  async create(userId: string, data: Partial<User>): Promise<{
    success: boolean,
    user?: User,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'POST',
      `users/${userId}/key_people`,
      undefined,
      undefined,
      this.user.toOnbo(data) as User,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, user: this.user.fromOnbo(resp?.payload) }
  }

  /*
   * Function to delete a Key Person (User) for the provided 'keyPersonId'
   * on the provided 'userId' parent User (usually a Business User).
   */
  async delete(userId: string, keyPersonId: string): Promise<{
    success: boolean,
    message?: string,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'DELETE',
      `users/${userId}/key_people/${keyPersonId}`,
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
  async update(userId: string, keyPersonId: string, data: Partial<User>): Promise<{
    success: boolean,
    user?: User,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'PUT',
      `users/${userId}/key_people/${keyPersonId}`,
      undefined,
      undefined,
      this.user.toOnbo(data) as User,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, user: this.user.fromOnbo(resp?.payload) }
  }
}
