const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function runTests() {
  console.log('--- Starting Hotel Management System Integration Tests ---');
  const baseUrl = 'http://localhost:5000/api';
  let adminToken = '';
  let customerToken = '';
  let customerEmail = `guest_${Date.now()}@example.com`;
  let testBookingId = '';
  let testBookingMongoId = '';
  let testRoomId = '';

  // 1. Admin Login
  console.log('\n[TEST 1] Admin Login...');
  try {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'royalbites2026' })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      adminToken = data.token;
      console.log('✓ Admin login successful.');
    } else {
      throw new Error(`Login failed: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Admin Login Failed:', err.message);
    process.exit(1);
  }

  // 2. Get Rooms List
  console.log('\n[TEST 2] Fetch Physical Rooms...');
  try {
    const res = await fetch(`${baseUrl}/rooms`);
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data)) {
      console.log(`✓ Rooms list fetched. Found ${data.data.length} rooms (Expected: 14).`);
      if (data.data.length === 0) {
        throw new Error('No rooms seeded in the database.');
      }
      // Keep track of first Deluxe Room for testing
      const firstDeluxe = data.data.find(r => r.roomType === 'Deluxe Room');
      if (firstDeluxe) {
        testRoomId = firstDeluxe._id;
        console.log(`✓ Deluxe Room found for test. Number: ${firstDeluxe.roomNumber}, Current Status: ${firstDeluxe.status}`);
      }
    } else {
      throw new Error(`Failed to fetch rooms: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Fetch Rooms Failed:', err.message);
    process.exit(1);
  }

  // 3. Register Guest Customer
  console.log(`\n[TEST 3] Register Guest Customer (${customerEmail})...`);
  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automation Test Guest',
        email: customerEmail,
        phone: '9876543210',
        password: 'Password123'
      })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      customerToken = data.token;
      console.log('✓ Guest registration successful.');
    } else {
      throw new Error(`Registration failed: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Registration Failed:', err.message);
    process.exit(1);
  }

  // 4. Create Room Booking
  console.log('\n[TEST 4] Create Room Booking (Deluxe Room)...');
  try {
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 5);
    const checkOut = new Date(today);
    checkOut.setDate(today.getDate() + 7);

    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];

    const payload = {
      roomType: 'Deluxe Room',
      guestName: 'Automation Test Guest',
      phone: '9876543210',
      email: customerEmail,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      guests: 2,
      specialRequests: 'High floor, quiet room please.'
    };

    const res = await fetch(`${baseUrl}/room-bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status === 201 && data.success) {
      testBookingMongoId = data.data._id;
      testBookingId = data.data.bookingId;
      console.log(`✓ Booking created successfully. Mongo ID: ${testBookingMongoId}, Booking ID: ${testBookingId}`);
      console.log(`✓ Status check: ${data.data.status} (Expected: Pending)`);
      if (data.data.status !== 'Pending') {
        throw new Error(`Unexpected initial status: ${data.data.status}`);
      }
    } else {
      throw new Error(`Failed to create booking: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Create Booking Failed:', err.message);
    process.exit(1);
  }

  // 5. Confirm Stay and check Assigned Room status (Should be Reserved)
  console.log('\n[TEST 5] Confirm Booking Stay (Admin Approve)...');
  try {
    const res = await fetch(`${baseUrl}/room-bookings/${testBookingMongoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'Confirmed') {
      console.log('✓ Reservation status updated to Confirmed.');
      
      // Verify the associated physical room is now Reserved
      const roomRes = await fetch(`${baseUrl}/rooms`);
      const roomData = await roomRes.json();
      const bookedRoom = roomData.data.find(r => r._id === data.data.room);
      if (bookedRoom) {
        console.log(`✓ Assigned Room ${bookedRoom.roomNumber} status is: ${bookedRoom.status} (Expected: Reserved)`);
        if (bookedRoom.status !== 'Reserved') {
          throw new Error(`Room status was expected to be Reserved, got: ${bookedRoom.status}`);
        }
      } else {
        throw new Error('Assigned physical room not found.');
      }
    } else {
      throw new Error(`Failed to update booking status: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Admin Approve Failed:', err.message);
    process.exit(1);
  }

  // 6. Check-In Stay and check Assigned Room status (Should be Occupied)
  console.log('\n[TEST 6] Guest Check-In...');
  try {
    const res = await fetch(`${baseUrl}/room-bookings/${testBookingMongoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'CheckedIn' })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'CheckedIn') {
      console.log('✓ Reservation status updated to CheckedIn.');
      
      // Verify physical room is now Occupied
      const roomRes = await fetch(`${baseUrl}/rooms`);
      const roomData = await roomRes.json();
      const bookedRoom = roomData.data.find(r => r._id === data.data.room);
      if (bookedRoom) {
        console.log(`✓ Assigned Room ${bookedRoom.roomNumber} status is: ${bookedRoom.status} (Expected: Occupied)`);
        if (bookedRoom.status !== 'Occupied') {
          throw new Error(`Room status was expected to be Occupied, got: ${bookedRoom.status}`);
        }
      }
    } else {
      throw new Error(`Failed to check-in: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Check-In Failed:', err.message);
    process.exit(1);
  }

  // 7. Check-Out Stay and check Assigned Room status (Should be Cleaning)
  console.log('\n[TEST 7] Guest Check-Out...');
  try {
    const res = await fetch(`${baseUrl}/room-bookings/${testBookingMongoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'CheckedOut' })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'CheckedOut') {
      console.log('✓ Reservation status updated to CheckedOut.');
      
      // Verify physical room is now Cleaning
      const roomRes = await fetch(`${baseUrl}/rooms`);
      const roomData = await roomRes.json();
      const bookedRoom = roomData.data.find(r => r._id === data.data.room);
      if (bookedRoom) {
        console.log(`✓ Assigned Room ${bookedRoom.roomNumber} status is: ${bookedRoom.status} (Expected: Cleaning)`);
        if (bookedRoom.status !== 'Cleaning') {
          throw new Error(`Room status was expected to be Cleaning, got: ${bookedRoom.status}`);
        }
        testRoomId = bookedRoom._id;
      }
    } else {
      throw new Error(`Failed to check-out: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Check-Out Failed:', err.message);
    process.exit(1);
  }

  // 8. Set room status back to Available manually
  console.log('\n[TEST 8] Set Room Status to Available manually (Sterilized)...');
  try {
    const res = await fetch(`${baseUrl}/rooms/${testRoomId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Available' })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'Available') {
      console.log('✓ Room status set back to Available.');
    } else {
      throw new Error(`Failed to update room status: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Manual status update Failed:', err.message);
    process.exit(1);
  }

  console.log('\n--- All Hotel API Integration Tests Passed! ---');
  process.exit(0);
}

runTests();
