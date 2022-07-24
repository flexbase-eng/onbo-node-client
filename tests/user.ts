import { Onbo } from '../src/index'

(async () => {
  const client = new Onbo(
    process.env.ONBO_CLIENT_ID!,
    process.env.ONBO_SECRET!,
    {
      host: process.env.ONBO_HOST!,
    }
  )

  console.log('getting List of Users...')
  const oneA = await client.user.list()
  // console.log('ONEA', oneA)
  if (oneA.success) {
    console.log(`Success! There are now ${oneA.users!.length} users`)
  } else {
    console.log('Error! Listing Users failed, and the output is:')
    console.log(oneA)
  }

  console.log('getting List of first 10 Users...')
  const oneB = await client.user.list({ limit: 10 })
  // console.log('ONEB', oneB)
  if (oneB.success) {
    console.log(`Success! There are now ${oneB.users!.length} users`)
  } else {
    console.log('Error! Listing first 10 Users failed, and the output is:')
    console.log(oneB)
  }

  console.log('getting a single User... (this should be an error)')
  const twoA = await client.user.byId('913869a1-189a-4942-9852-dd0312b4bd61')
  // console.log('TWOA', twoA)
  if (twoA.success) {
    console.log('Error! There should be no user for a fake userId!')
    console.log(twoA)
  } else {
    console.log('Success! Getting a goofy User by Id failed, as it should.')
  }

  console.log('getting a single User...')
  const twoBUserId = 'ae0c739a-3da3-4adc-a24e-e0e5beb0a407'
  const twoB = await client.user.byId(twoBUserId)
  // console.log('TWOB', twoB)
  if (twoB.success) {
    console.log(`Success! We found the userId ${twoBUserId}`)
  } else {
    console.log(`Error! We cannot find the userId: ${twoBUserId}.`)
    console.log(twoB)
  }

  console.log('creating a new Consumer User...')
  const jacob = {
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
  }
  const tre = await client.user.create(jacob)
  // console.log('TRE', tre)
  if (tre.success) {
    console.log(`Success! ${tre.user!.firstName} was created with id: ${tre.user!.uuid}`)
  } else {
    console.log(`Error! Creating Consumer User for ${jacob.firstName} failed, and the output is:`)
    console.log(tre)
  }

  if (tre.success) {
    const userId = tre.user!.uuid
    console.log('getting the single Consumer User we just made...')
    const hit = await client.user.byId(userId)
    if (hit.success) {
      console.log(`Success! We found the userId ${userId} for ${hit.user!.firstName}`)
    } else {
      console.log(`Error! We cannot find the userId: ${userId}.`)
      console.log(hit)
    }

    console.log('updating the newly created User...')
    const fou = await client.user.update(userId, {
      phone: '680-206-6198',
    })
    // console.log('FOU', fou)
    if (fou.success) {
      console.log(`Success! We updated the userId ${userId}`)
    } else {
      console.log(`Error! We cannot update the userId: ${userId}.`)
      console.log(fou)
    }

    console.log('deleting a single User...')
    const fiv = await client.user.delete(userId)
    // console.log('FIV', fiv)
    if (fiv.success) {
      console.log(`Success! We deleted the userId ${userId}`)
    } else {
      console.log(`Error! We cannot delete the userId: ${userId}.`)
      console.log(fiv)
    }
  }

  console.log('getting List of Users...')
  const six = await client.user.list()
  if (six.success) {
    console.log(`Success! There are now ${six.users!.length} users`)
  } else {
    console.log('Error! Listing Users failed, and the output is:')
    console.log(six)
  }

})()
