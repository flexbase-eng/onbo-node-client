import type { Onbo, OnboOptions, OnboError, OnboPagination } from '../'

import { ApplicationApi } from './application'
import { DrawDownApi } from './draw-down'
import { RepaymentApi } from './repayment'
import { StatementApi } from './statement'

export interface LineOfCredit {
  uuid: string;
  product: string;
  amount: number;
  term?: number;
  purpose?: string;
  details: null,
  creditScoreConsent?: boolean;
  creditReportId: number;
  createdAt: string;
  offers: Offer[];
  status: {
    name: string;
    details?: string[];
  };
}

export interface Offer {
  uuid: string;
  product: string;
  apr: number;
  amount: number;
  term: number;
  termFrequency: string;
  interestRate: number;
  originationFee: number;
  interestOnlyPeriod?: number;
  interestOnlyInstallment?: number;
  interestAmount?: number;
  installment?: number;
  startDate: string;
  explanation?: string;
  maturityDate?: string;
}

export interface BankInfo {
  achRoutingNumber: string;
  bankAccountNumber: string;
  bankAccountName?: string;
  bankName: string;
  accountType: string;
}

export interface DrawDown {
  id: number;
  amount: number;
  description?: string;
  effectiveDate: string;
  borrowerBankAccountUuid: string;
}

export interface Repayment {
  uuid: string;
  product: string;
  paymentType: string;
  effectiveDate: string;
  returnedAt?: string;
  originalPaymentDate?: string;
  amount: number;
  principal?: number;
  interest?: number;
  fees?: number;
  suspense?: number;
  endingBalance?: number;
  shouldCommitToNls: boolean;
  skipNls?: boolean;
  borrowerBankAccountUuid: string;
  achBatchId?: string;
  achId?: string;
  completionDate?: string;
  errorDescription: string;
  initiationDate?: string;
  status?: string;
}

export interface Statement {
  nextBillingDate: string;
  principalBalance: number;
  interestBalance: number;
  payoffBalance: number;
  daysPastDue: number;
  pastDueBalance: number;
  nextPaymentAmountDue: number;
  nextPaymentDueDate: string;
  suspenseBalance: number;
  statements: {
    billingDate: string;
    url: string;
  }[];
  creditLimit: number;
  availableCredit: number;
  currentCredit: number;
  amortizationSchedule?: AmortizationPayment[];
}

export interface AmortizationPayment {
  IsHistory: number;
  PaymentDate: string;
  LoanAmount: number;
  InterestAmount: number;
  PrincipalAmount: number;
  OtherAmount: number;
  PaymentAmount: number;
  BalanceAmount: number;
  PaymentNumber: number;
  ACHTransactionIds?: string[];
}

import { mkQueryParams, isEmpty } from '../'

export class LineOfCreditApi {
  client: Onbo
  application: ApplicationApi
  drawDown: DrawDownApi
  repayment: RepaymentApi
  statement: StatementApi

  constructor(client: Onbo, options?: OnboOptions) {
    this.client = client
    // now construct all the specific domain objects
    this.application = new ApplicationApi(this.client, this, options)
    this.drawDown = new DrawDownApi(this.client, this, options)
    this.repayment = new RepaymentApi(this.client, this, options)
    this.statement = new StatementApi(this.client, this, options)
  }

  /*
   * Function to take an optional userId and some standard Onbo paging
   * parameters and return a list of all the LOCs for that User
   * in Onbo for within the range identified by those paging parameters.
   * The Onbo defaults are: 'offset' of 0, and 'limit' of 25.
   *
   * If there is no 'userId' provided, then this will list *all* LOCs
   * in all of Onbo for this account.
   */
  async list(userId: string, options?: {
    offset?: number,
    limit?: number,
  }): Promise<{
    success: boolean,
    linesOfCredit?: LineOfCredit[],
    error?: OnboError,
    pagination?: OnboPagination,
  }> {
    const uri = userId ? `users/${userId}/loc` : 'users/loc'
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
      linesOfCredit: resp?.payload?.data,
      pagination: resp?.payload?.pagination,
    }
  }

  /*
   * Function to take an 'userId' and 'locId' for a User, and LOC, respectively,
   * and return that LOC for that user.
   */
  async byId(userId: string, locId: string): Promise<{
    success: boolean,
    lineOfCredit?: LineOfCredit,
    error?: OnboError,
  }> {
    const resp = await this.client.fire(
      'GET',
      `users/${userId}/loc/${locId}`,
    )
    if ((resp?.response?.status >= 400) || !isEmpty(resp?.payload?.message)) {
      return {
        success: false,
        error: { type: 'onbo', message: resp?.payload?.message },
      }
    }
    return { success: true, lineOfCredit: resp?.payload }
  }
}
