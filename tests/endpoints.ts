import { Onbo } from '../src/index'

(async () => {
  const client = new Onbo(
    process.env.ONBO_CLIENT_ID!,
    process.env.ONBO_SECRET!,
    {
      host: process.env.ONBO_HOST!,
    }
  )

  console.log('getting List of Webhook Endpoints...')
  const one = await client.webhook.endpoint.list()
  // console.log('ONE', one)
  if (one.success) {
    console.log(`Success! There are now ${one.endpoints!.length} endpoints`)
  } else {
    console.log('Error! Listing webhook endpoints failed, and the output is:')
    console.log(one)
  }

  console.log('creating new Webhook Endpoint...')
  const two = await client.webhook.endpoint.create({
    url: 'https://tester.ngrok.io/obno/webhook',
    description: 'just another endpoint for all the events',
  })
  // console.log('TWO', two)
  const endpointId = two.endpoint!.uuid
  if (two.success) {
    console.log(`Success! created a new webhook endpoint to ${two.endpoint!.url}`)
  } else {
    console.log('Error! Creating new webhook endpoint failed, and the output is:')
    console.log(two)
  }

  console.log('getting List of Webhook Endpoints now...')
  const tre = await client.webhook.endpoint.list()
  // console.log('TRE', tre)
  if (tre.success) {
    console.log(`Success! There are now ${tre.endpoints!.length} endpoints`)
  } else {
    console.log('Error! Listing webhook endpoints failed, and the output is:')
    console.log(tre)
  }

  console.log('getting Webhook Endpoint by Id...')
  const fouA = await client.webhook.endpoint.byId(endpointId)
  // console.log('FOUA', fouA)
  if (fouA.success) {
    console.log(`Success! puling webhook endpoint by id ${endpointId}`)
  } else {
    console.log('Error! Getting webhook endpoint by id failed, and the output is:')
    console.log(fouA)
  }

  console.log('getting Webhook Endpoint by URL...')
  const fouB = await client.webhook.endpoint.byUrl('https://tester.ngrok.io/obno/webhook')
  // console.log('FOUB', fouB)
  if (fouB.success) {
    console.log(`Success! puling webhook endpoint by url ${endpointId}`)
  } else {
    console.log('Error! Getting webhook endpoint by url failed, and the output is:')
    console.log(fouB)
  }

  console.log('deleting Webhook Endpoint...')
  const fiv = await client.webhook.endpoint.delete(endpointId)
  // console.log('FIV', fiv)
  if (fiv.success) {
    console.log(`Success! deleted the webhook endpoint with id ${endpointId}`)
  } else {
    console.log('Error! Deleting webhook endpoint failed, and the output is:')
    console.log(fiv)
  }

  console.log('getting List of Webhook Endpoints now...')
  const six = await client.webhook.endpoint.list()
  // console.log('SIX', six)
  if (six.success) {
    console.log(`Success! There are now ${six.endpoints!.length} endpoints`)
  } else {
    console.log('Error! Listing webhook endpoints failed, and the output is:')
    console.log(six)
  }

})()
