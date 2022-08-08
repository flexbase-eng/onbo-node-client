# onbo-node-client

`onbo-node-client` is a Node/JS and TypeScript Client for
[Onbo](https://docs.onbo.com) that allows you to use normal Node
syntax to Consumer and Business Users, Lines of Credit, Applications,
Draw Downs, Payments and other data from the Onbo
[API](https://docs.onbo.com).

## Install

```bash
# with npm
$ npm install @flexbase/onbo-node-client
```

## Usage

This README isn't going to cover all the specifics of what Onbo is,
and how to use it - it's targeted as a _companion_ to the Onbo developer
[docs](https://docs.onbo.com)
that explain each of the endpoints and how the general Onbo
[API](https://docs.onbo.com) works.

However, we'll put in plenty of examples so that it's clear how to use this
library to interact with Onbo.

### Getting your API key

This client uses the same Client Id and Secret key that you get when you
visit the [Dashboard](https://dashboard.onbo.com/admin/settings) and pick
up your key data. There is also a sandbox [Dashbaord](https://sandbox-dashboard.onbo.com/admin/settings)
for picking up the sandbox keys, and it's nicely discussed in the docs.

### Creating the Client

At the current time, a targeted subset of functions are available from the
client. These are currently about the User, Line of Credit domains, as
well as the repayment and Draw Down domains. As we add more features,
this client will exapnd, but for now, this works as we need it to.

The basic construction of the client is:

```typescript
import { Onbo } from 'onbo-node-client'
const client = new Onbo(clientId, secret)
```

If you'd like to provide the host to use, say sandbox or production,
these can also be provided in the constructor:

```typescript
const client = new Onbo(clientId, secret, {
  host: 'sandbox-api.stilt.com/v1',
})
```

where the options can include:

* `host` - the hostname where all Onbo calls should be sent
* `clientId` - the clientId if you'd like to put it in the options
* `secret` - the secret if you'd like to put it in the options

### User Calls

As stated in the Onbo
[documentation](https://docs.onbo.com/api-reference/product-api-reference/users):

> The first step in the credit creation process is to create a User object.
> This is the root object, representing a single borrower (person or
> business) applying for credit. Users are identified by a unique, random
> id.

#### [List Users](https://docs.onbo.com/api-reference/product-api-reference/users/consumer-users/list-all-users)

You can list all the Users - Consumer and Busines, with a single call:

```typescript
const resp = await client.user.list()
```

where the default is to display the first 25 Users for the organization,
and the response will be something like:

```javascript
{
  success: true,
  users: [
    {
      uuid: 'e94df949-e0e8-4e72-a0d8-2400359ad21c',
      firstName: 'Jacob',
      lastName: 'Woods',
      middleName: null,
      title: 'BENEFICIARY',
      phone: '680-206-6197',
      email: 'jwoods@gmail.com',
      citizenship: 'US',
      address: {
        zip: '47906',
        city: 'West Lafayette',
        state: 'IN',
        line1: '2601 Soldiers Home Rd',
        country: 'US'
      }
    },
    { ... },
    { ... },
  ],
  pagination: {
    offset: 0,
    limit: 25,
    total: 12
  }
}
```

There are several optional parameters to many of the Onbo calls,
and they are all included in the call in this format:

```typescript
const resp = await client.user.list({
  limit: 20,
})
```

and for this call, the options are:

* `offset` - the starting index of the sequence of elements
* `limit` - the maximum number of elements to return in this page

If there had been an error, the response could be something like:

```javascript
{
  "success": false,
  "error": {
    "type": "onbo",
    "message": "User not found"
  }
}
```

So looking at the `success` value of the response will quickly let you know the outcome of the call.

#### [Get a Single User](https://docs.onbo.com/api-reference/product-api-reference/users/consumer-users/retrieve-a-user)

When you have the `userId` of a specific User - Consumer or Busines, you
can pull back just that one with a single call:

```typescript
const resp = await client.user.byId(userId)
```

and the response will be something like:

```javascript
{
  success: true,
  user: {
    uuid: 'dfa772f8-3650-4a8f-9528-1a3be532daac',
    firstName: 'Jacob',
    middleName: null,
    lastName: 'Woods',
    citizenship: null,
    dwollaCustomerUrl: null,
    userType: 'PERSON',
    website: null,
    email: 'jwoods@gmail.com',
    phone: '680-206-6197',
    address: {
      line1: '2601 Soldiers Home Rd',
      line2: null,
      line3: null,
      zip: '47906',
      city: 'West Lafayette',
      state: 'IN',
      country: 'US'
    }
  }
}
```

This library prefers the camelCase the output from Onbo, and will snake_case
all arguments passed in to match what Onbo requires.

#### [Create a new User](https://docs.onbo.com/api-reference/product-api-reference/users/consumer-users/create-a-user)

You can create a User - Consumer or Busines, with a single call:

```typescript
const resp = await client.user.create({
  firstName: 'Jacob',
  lastName: 'Woods',
  address: {
    line1: '2601 Soldiers Home Rd',
    city: 'West Lafayette',
    state: 'IN',
    zip: '47906',
    country: 'US',
  },
  email: 'jwoods@gmail.com',
  phone: '680-206-6197',
  ssn: '111-22-3333',
  dob: '1998-01-11',
})
```

where Onbo will have certain _completeness_ rules for the data,
and the response will be something like:

```javascript
{
  success: true,
  user: {
    uuid: 'dfa772f8-3650-4a8f-9528-1a3be532daac',
    firstName: 'Jacob',
    middleName: null,
    lastName: 'Woods',
    citizenship: null,
    dwollaCustomerUrl: null,
    userType: 'PERSON',
    website: null,
    email: 'jwoods@gmail.com',
    phone: '680-206-6197',
    address: {
      line1: '2601 Soldiers Home Rd',
      line2: null,
      line3: null,
      zip: '47906',
      city: 'West Lafayette',
      state: 'IN',
      country: 'US'
    }
  }
}
```

This library doesn't **_yet_** want to attempt to impose those Onbo-specific
rules on the data, so if, for example, you don't include the `ein` for a
Business User, the data will be sent to Onbo, they will flag it, and return
the error message that this client will display.

We know it's needed, but there may be cases where the rules are a little more
complicated, so we have chosen not to attempt to implement any of them at
this time.

#### [Update a User](https://docs.onbo.com/api-reference/product-api-reference/users/consumer-users/update-a-user)

You can update a User - Consumer and Busines, with a single call:

```typescript
const resp = await client.user.update(userId, {
  phone: '312-555-1212'
})
```

where the second argument is `Partial<User>`, so _most_ fields are updatable
in Onbo, and the response will be something like the response from `byId()`.

#### [Delete a User](https://docs.onbo.com/api-reference/product-api-reference/users/consumer-users/delete-a-user)

You can delete a User - Consumer or Busines, with a single call:

```typescript
const resp = await client.user.delete(userId)
```

where Onbo describes this operation as:

> Permanently deletes a user. This cannot be undone.
>
> Returns a message confirming user deletion upon success. If the user id
> does not exist then this call will return an error. An error will also
> be returned if the user has any outstanding balances due.

and if successful, the response will be something like:

```javascript
{
  success: true,
  message: 'User succesfully deleted'
}
```

### Business User Key Person Calls

The Business User in Onbo has an additional component - the _Key Person_.
There are several calls that can be made to manipulate the list of these
Key People on a Business User after the `user.create()` call.

The fields on these Key People are very close to the elements of a User,
so the data is returned in a similar manner.

#### [List Key People](https://docs.onbo.com/api-reference/product-api-reference/users/commercial-users/key-people/list-all-key-people)

You can list all the Key People with a single call:

```typescript
const resp = await client.user.keyPerson.list(userId)
```

and the response will be something like:

```javascript
{
  success: true,
  users: [
    {
      uuid: 'e6168072-c350-410e-b898-e75d9a633b2b',
      firstName: 'Fred',
      lastName: 'Franklin',
      middleName: null,
      title: 'BENEFICIARY',
      phone: '680-206-5532',
      email: 'fredf@gmail.com',
      citizenship: 'US',
      address: [Object]
    }
  ],
  pagination: { offset: 0, limit: 25, total: 1 }
}
```

Where again, the Onbo pagination concept is true for all "Listing" functions.

#### [Add a Key Person](https://docs.onbo.com/api-reference/product-api-reference/users/commercial-users/key-people/add-a-key-person)

You can add a Key Person to a Business User with a single call:

```typescript
const resp = await client.user.keyPerson.create(userId, {
  firstName: 'Jacob',
  lastName: 'Woods',
  address: {
    line1: '2601 Soldiers Home Rd',
    city: 'West Lafayette',
    state: 'IN',
    zip: '47906',
    country: 'US',
  },
  email: 'jwoods@gmail.com',
  phone: '680-206-6197',
  ssn: '111-22-3333',
  dob: '1998-01-11',
  title: 'BENEFICIARY',
  citizenship: 'US',
})
```

and the response will be something like:

```javascript
{
  success: true,
  user: {
    uuid: '4ba8a544-aa4a-423e-9c4b-d233b36dba04',
    firstName: 'Jacob',
    lastName: 'Woods',
    middleName: null,
    title: 'BENEFICIARY',
    phone: '680-206-6197',
    email: 'jwoods@gmail.com',
    citizenship: 'US',
    address: {
      zip: '47906',
      city: 'West Lafayette',
      state: 'IN',
      line1: '2601 Soldiers Home Rd',
      country: 'US'
    }
  }
}
```

#### [Get a Single Key Person](https://docs.onbo.com/api-reference/product-api-reference/users/commercial-users/key-people/retrieve-a-key-person)

You can get a single Key Person for a Business User with a single call:

```typescript
const resp = await client.user.keyPerson.byId(userId, keyPersonId)
```

and the response will look very much like the `user.keyPerson.create()`
response.

#### [Update a Key Person](https://docs.onbo.com/api-reference/product-api-reference/users/commercial-users/key-people/update-a-key-person)

You can update a Key Person on a Business User with a single call:

```typescript
const resp = await client.user.keyPerson.update(userId, keyPersonId, {
  phone: '630-555-1212'
})
```

and the response will look very much like the response from
`user.keyPerson.byId()`

#### Delete a Key Person

Missing from the Onbo Docs, but discovered by experiementation, you can
delete a Key Person from a Business User with a single call:

```typescript
const resp = await client.user.kyePerson.delete(userId, keyPersonId)
```

and the response will be something like:

```javascript
{
  success: true,
  message: 'Key person succesfully deleted'
}
```

### Line of Credit Calls

As stated in the Onbo
[documentation](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit):

> A LOC object can be originated for a given User object. LOCs are
> identified by a unique, random id.

#### [List LOCs](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/list-all-locs)

You can get a list of all the Lines of Credit (LOCs) for a User, or for the
complete organization for all Users, with a single call:

```typescript
const resp = await client.loc.list()
```

or:

```typescript
const resp = await client.loc.list(userId)
```

if you provide the `userId`, the list retured will be just for that User,
and if no argument is provided, than all LOCs will be returned.


The response will be something like:

```javascript
{
  success: true,
  linesOfCredit: [
    { ... },
    { ... },
  ],
  pagination: { offset: 0, limit: 25, total: 10 }
}
```

At this time we have not run sufficient tests to document this output.

#### [Get a Single LOC](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/retrieve-a-loc)

You can get a single LOC with a single call:

```typescript
const resp = await client.loc.byId(userId, locId)
```

The response will be something like:

```javascript
{
  success: true,
  lineOfCredit: {
    ...
  }
}
```

At this time we have not run sufficient tests to document this output.

### Line of Credit - Application Calls

All Line of Credit Application calls are grouped under `loc.application`.

#### [List LOC Applications](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/applications/list-all-loc-applications)

You can get a list of all the LOC Applications for a User, or for the
complete organization for all Users, with a single call:

```typescript
const resp = await client.loc.application.list(userId)
```

where again, the `userId` is optional, and if omitted, the complete list
of Applications will be returned. The response will be something like:

```javascript
{
  success: true,
  applications: [
    { ... },
    { ... },
  ],
  pagination: { offset: 0, limit: 25, total: 10 }
}
```

At this time we have not run sufficient tests to document this output.

#### [Get a Single Application](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/applications/retrieve-a-loc-application)

You can get just a single LOC Application with a single call:

```typescript
const resp = await client.loc.application.byId(userId, applicationId)
```

and the response will be something like:

```javascript
{
  success: true,
  application: {
    ...
  }
}
```

At this time we have not run sufficient tests to document this output.

#### [Create an LOC Application](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/applications/create-a-loc-application)

You can create an LOC Application with a single call:

```typescript
const resp = await client.loc.application.create(userId, {
  amount: 5000
})
```

and the response will be something like:

```javascript
{
  success: true,
  lineOfCredit: {
    ...
  }
}
```

At this time we have not run sufficient tests to document this output.

#### [Get a Promissory Note](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/applications/retrieve-a-promissory-note)

You can get the `id` and URL to the PDF for a Promissory Note with a single
call:

```typescript
const resp = await client.loc.application.promissoryNote(userId, offerId)
```

and the response will be something like:

```javascript
{
  success: true,
  documentUuid: '86235565-5276-4459-8929-a82f3ba92f24',
  documentUrl: 'https://storage.googleapis.com/...'
}
```

At this time we have not run sufficient tests to document this output.

#### [Activate an LOC](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/applications/activate-a-loc)

You can activate a Line of Credit with a single call:

```typescript
const resp = await client.loc.application.activate(userId, offerId, {
  status: 'accepted',
  documentUuid: '86235565-5276-4459-8929-a82f3ba92f24',
})
```

and the response will be something like:

```javascript
{
  success: true,
  status: '',
}
```

At this time we have not run sufficient tests to document this output.

### Line of Credit - Draw Down Calls

All Line of Credit Draw Down calls are grouped under `loc.drawDown`.

#### [List Drawdowns](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/drawdowns/list-all-drawdowns-for-a-loc)

You can list all the Drawdowns for an LOC with a single call:

```typescript
const resp = await client.loc.drawDown.list(userId, locId)
```

and the response will be something like:

```javascript
{
  success: true,
  drawDowns: [
    { ... },
    { ... },
  ],
  pagination: { offset: 0, limit: 25, total: 5 }
}
```

At this time we have not run sufficient tests to document this output.

#### [Draw Down on an LOC](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/drawdowns/draw-down-on-a-loc)

You can list all the Users - Consumer and Busines, with a single call:

```typescript
const resp = await client.loc.drawDown.create(userId, locId, {
  amount: 152.50
})
```

and the response will be something like:

```javascript
{
  success: true,
  availableCredit: 4500.0,
  currentCredit: 4200.0
}
```

At this time we have not run sufficient tests to document this output.

### Line of Credit - Repayment Calls

All Line of Credit Repayment calls are grouped under `loc.repayment`.

#### [List all Repayments on an LOC](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/repayments/list-all-repayments-on-a-loc)

You can list all the repayment on an LOC with a single call:

```typescript
const resp = await client.loc.repayment.list(userId, locId)
```

and the response will be something like:

```javascript
{
  success: true,
  repayments: [
    { ... },
    { ... },
  ],
  pagination: { offset: 0, limit: 25, total: 8 }
}
```

At this time we have not run sufficient tests to document this output.

#### [Get a Single Repayment on an LOC](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/repayments/retrieve-details-of-a-loc-repayment)

You can get a single Repayment for an LOC with a single call:

```typescript
const resp = await client.loc.repayment.byId(userId, locId, paymentId)
```

and the response will be something like:

```javascript
{
  success: true,
  repayment: {
    ...
  }
}
```

At this time we have not run sufficient tests to document this output.

#### [Transmit a Repayment](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/repayments/transmit-a-repayment)

You can initiate a repayment to a LOC with a single call:

```typescript
const resp = await client.loc.repayment.create(userId, locId, {
  amount: 500.0,
  paymentType: 'SINGLE_PAYMENT',
  paymentDate: '2022-04-12',
  repaymentBankInfo: {
    achRoutingNumber: '103100195',
    bankAccountNumber: '456455535',
    bankName: 'Chime',
    accountType: 'checking'
  }
})
```

and the response will be something like:

```javascript
{
  success: true,
  availableCredit: 4500.0,
  currentCredit: 4200.0,
  repaymentUuid: '214bef06-2a87-412e-8430-82b33b2a044d'
}
```

At this time we have not run sufficient tests to document this output.

### Line of Credit - Statement Calls

All Line of Credit Statement calls are grouped under `loc.statement`.

#### [Get a Statement](https://docs.onbo.com/api-reference/product-api-reference/lines-of-credit/statements/retrieve-a-statement)

You can get the statement for the LOC with a single call:

```typescript
const resp = await client.loc.statement.get(userId, locId)
```

and the response will be something like:

```javascript
{
  success: true,
  statement: {
    ...
  }
}
```

At this time we have not run sufficient tests to document this output.



## Development

For those interested in working on the library, there are a few things that
will make that job a little simpler. The organization of the code is all in
`src/`, with one module per _section_ of the Client: `user`, `loc`,
etc. This makes location of the function very easy.

Additionally, the main communication with the Onbo service is in the
`src/index.ts` module in the `fire()` function. In the constructor for the
Client, each of the _sections_ are created, and then they link back to the
main class for their communication work.

### Setup

In order to work with the code, the development dependencies include `dotenv`
so that each user can create a `.env` file with a single value for working
with Onbo:

* `ONBO_CLIENT_ID` - this is the Onbo-generated "Client Id" from the
  Onbo Settings page on the Dashboard.
* `ONBO_SECRET` - this is the Onbo-generated "Secret" from the
  Onbo Settings page on the Dashboard.
* `ONBO_HOST` - this is the Onbo "API" from the
  Onbo Settings page on the Dashboard.

### Testing

There are several test scripts that test, and validate, information on the
Onbo service exercising different parts of the API. Each is
self-contained, and can be run with:

```bash
$ npm run ts tests/user.ts

> @flexbase/persona-node-client@0.1.0 ts
> ts-node -r dotenv/config "tests/user.ts"

getting List of Users...
Success! There are now 0 users
getting List of first 10 Users...
Success! There are now 0 users
getting a single User... (this should be an error)
Success! Getting a goofy User by Id failed, as it should.
getting a single User...
Error! We cannot find the userId: ae0c739a-3da3-4adc-a24e-e0e5beb0a407.
{ success: false, error: { type: 'onbo', message: 'User not found' } }
creating a new Consumer User...
Success! Jacob was created with id: bc6bf00c-bece-4767-955b-92a31042c780
getting the single Consumer User we just made...
Success! We found the userId bc6bf00c-bece-4767-955b-92a31042c780 for Jacob
updating the newly created User...
Success! We updated the userId bc6bf00c-bece-4767-955b-92a31042c780
deleting a single User...
Success! We deleted the userId bc6bf00c-bece-4767-955b-92a31042c780
getting List of Users...
Success! There are now 0 users
```

Each of the tests will run a series of calls through the Client, and check the
results to see that the operation succeeded. As shown, if the steps all
report back with `Success!` then things are working.

If there is an issue with one of the calls, then an `Error!` will be printed
out, and the data returned from the client will be dumped to the console.
