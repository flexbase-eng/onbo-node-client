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
  const fred = {
    firstName: 'Fred',
    lastName: 'Franklin',
    address: {
      line1: '2601-12 Soldiers Home Rd',
      city: 'West Lafayette',
      state: 'IN',
      zip: '47906',
      country: 'US',
    },
    email: 'fredf@gmail.com',
    phone: '680-206-5532',
    ssn: '111-22-3333',
    dob: '1998-01-11',
    title: 'BENEFICIARY',
    citizenship: 'US',
  }
  const shoes = {
    firstName: 'Shore Shoes',
    address: {
      line1: '2601 Soldiers Home Rd',
      city: 'West Lafayette',
      state: 'IN',
      zip: '47906',
      country: 'US',
    },
    email: 'shoreshoes@gmail.com',
    phone: '680-206-6197',
    start_date: '2001-01-11',
    userType: 'business',
    entity: 'CORPORATION',
    ein: '30-0000000',
    keyPeople: [fred]
  }
  const two = await client.user.create(shoes)
  // console.log('TWO', two)
  if (two.success) {
    console.log(`Success! ${two.user!.firstName} was created with id: ${two.user!.uuid}`)
  } else {
    console.log(`Error! Creating Business User for ${shoes.firstName} failed, and the output is:`)
    console.log(two)
  }

  if (two.success) {
    const userId = two.user!.uuid

    console.log('getting the single Business User we just made...')
    const tre = await client.user.byId(userId)
    // console.log('TRE', tre)
    if (tre.success) {
      console.log(`Success! We found the userId ${userId} for ${tre.user!.firstName}`)
    } else {
      console.log(`Error! We cannot find the userId: ${userId}.`)
      console.log(tre)
    }

    console.log('getting List of Key People for new Business User...')
    const fou = await client.user.keyPerson.list(userId)
    // console.log('FOU', fou)
    if (fou.success) {
      console.log(`Success! There are now ${fou.users!.length} key people for this User`)
    } else {
      console.log('Error! Listing Key People for a User failed, and the output is:')
      console.log(fou)
    }

    console.log('creating a new Key Person for the Business User...')
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
      title: 'BENEFICIARY',
      citizenship: 'US',
    }
    const fiv = await client.user.keyPerson.create(userId, jacob)
    // console.log('FIV', fiv)
    if (fiv.success) {
      const jacobId = fiv.user!.uuid
      console.log(`Success! ${fiv.user!.firstName} was created with id: ${jacobId}`)

      console.log('getting List of Key People for new Business User now...')
      const six = await client.user.keyPerson.list(userId)
      // console.log('SIX', six)
      if (six.success) {
        console.log(`Success! There are now ${six.users!.length} key people for this User`)
      } else {
        console.log('Error! Listing Key People for a User failed, and the output is:')
        console.log(six)
      }

      console.log('getting new Key Person for new Business User now...')
      const sev = await client.user.keyPerson.byId(userId, jacobId)
      // console.log('SEV', sev)
      if (sev.success) {
        console.log(`Success! We found ${sev.user!.firstName} as a key person for this User`)
      } else {
        console.log('Error! Getting a Key Person for a User failed, and the output is:')
        console.log(sev)
      }

      console.log('updating the newly created Key Person for the Business User...')
      const eig = await client.user.keyPerson.update(userId, jacobId, {
        phone: '680-206-6198',
      })
      // console.log('EIG', eig)
      if (eig.success) {
        console.log(`Success! We updated the keyPersonId ${jacobId} in userId ${userId}`)
      } else {
        console.log(`Error! We cannot update the keyPersonId ${jacobId} in userId: ${userId}.`)
        console.log(eig)
      }

      console.log('deleting a single Key Person for a Business User...')
      const nin = await client.user.keyPerson.delete(userId, jacobId)
      // console.log('NIN', nin)
      if (nin.success) {
        console.log(`Success! We deleted the keyPersonId ${jacobId} for userId ${userId}`)
      } else {
        console.log(`Error! We cannot delete the keyPersonId ${jacobId} for userId: ${userId}.`)
        console.log(nin)
      }
    } else {
      console.log(`Error! Creating Key Person ${jacob.firstName} for Business User failed, and the output is:`)
      console.log(fiv)
    }

    console.log('deleting a single Business User...')
    const ten = await client.user.delete(userId)
    // console.log('TEN', ten)
    if (ten.success) {
      console.log(`Success! We deleted the userId ${userId}`)
    } else {
      console.log(`Error! We cannot delete the userId: ${userId}.`)
      console.log(ten)
    }
  }

  console.log('getting List of Users...')
  const ele = await client.user.list()
  if (ele.success) {
    console.log(`Success! There are now ${ele.users!.length} users`)
  } else {
    console.log('Error! Listing Users failed, and the output is:')
    console.log(ele)
  }

})()
