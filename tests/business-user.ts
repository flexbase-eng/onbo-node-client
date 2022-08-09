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
  const one = await client.user.list()
  // console.log('ONE', one)
  if (one.success) {
    console.log(`Success! There are now ${one.users!.length} users`)
  } else {
    console.log('Error! Listing Users failed, and the output is:')
    console.log(one)
  }

  console.log('creating a new Business User...')
  const chips = {
    userType: 'BUSINESS',
    EIN: '11-1111111',
    firstName: "Chip's Concrete",
    phone: '515-555-1212',
    startDate: '1996-02-06',
    entity: 'LIMITED_LIABILITY_PARTNERSHIP',
    email: 'chip@gmail.com',
    keyPeople: [
      {
        title: 'BENEFICIARY',
        firstName: 'Jacob',
        lastName: 'Woods',
        email: 'jwoods@gmail.com',
        phone: '680-206-6197',
        ssn: '111-22-3333',
        dob: '1998-01-11',
        citizenship: 'US',
        address: {
          line1: '2601 Soldiers Home Rd',
          city: 'West Lafayette',
          state: 'IN',
          zip: '47906',
          country: 'US',
        }
      }
    ],
    address: {
      line1: '333 West End',
      city: 'Sacramento',
      state: 'CA',
      zip: '95630',
      country: 'US',
    }
  }
  const tre = await client.user.create(chips)
  console.log('TRE', tre)
  if (tre.success) {
    console.log(`Success! ${tre.user!.firstName} was created with id: ${tre.user!.uuid}`)
  } else {
    console.log(`Error! Creating Bunsiness User for ${chips.firstName} failed, and the output is:`)
    console.log(tre)
  }

  if (tre.success) {
    const userId = tre.user!.uuid
    console.log('getting the single Business User we just made...')
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
    console.log('FOU', fou)
    if (fou.success) {
      console.log(`Success! We updated the userId ${userId}`)
    } else {
      console.log(`Error! We cannot update the userId: ${userId}.`)
      console.log(fou)
    }

    console.log('deleting a single User...')
    const fiv = await client.user.delete(userId)
    console.log('FIV', fiv)
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
