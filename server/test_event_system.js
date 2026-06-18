async function runTests() {
  console.log('--- Starting Event & Banquet Management System Integration Tests ---');
  const baseUrl = 'http://localhost:5000/api';
  let adminToken = '';
  let customerToken = '';
  let customerEmail = `event_guest_${Date.now()}@example.com`;
  let testBookingId = '';
  let testBookingMongoId = '';

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

  // 2. Fetch Event Packages
  console.log('\n[TEST 2] Fetch Event Packages...');
  try {
    const res = await fetch(`${baseUrl}/events/packages`);
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data)) {
      console.log(`✓ Event packages list fetched. Found ${data.data.length} packages (Expected: 5).`);
      const names = data.data.map(p => p.name);
      console.log('Packages found:', names.join(', '));
      if (data.data.length === 0) {
        throw new Error('No event packages seeded.');
      }
    } else {
      throw new Error(`Failed to fetch event packages: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Fetch Event Packages Failed:', err.message);
    process.exit(1);
  }

  // 3. Register Guest Customer
  console.log(`\n[TEST 3] Register Guest Customer (${customerEmail})...`);
  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Event Test Guest',
        email: customerEmail,
        phone: '9988776655',
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

  // 4. Past Date Validation Check
  console.log('\n[TEST 4] Validate Past Date Rejection...');
  try {
    const payload = {
      guestName: 'Event Test Guest',
      phone: '9988776655',
      email: customerEmail,
      eventType: 'Corporate',
      package: 'Corporate Conference Package',
      eventDate: '2025-01-01', // in the past
      guestCount: 40,
      specialRequirements: 'Projector screen required.'
    };

    const res = await fetch(`${baseUrl}/events/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status === 400 && !data.success) {
      console.log('✓ Rejection successful. Message:', data.message);
    } else {
      throw new Error(`Expected status 400 but got ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('✗ Past Date Validation Check Failed:', err.message);
    process.exit(1);
  }

  // 5. Capacity Validation Check
  console.log('\n[TEST 5] Validate Package Capacity Rejection...');
  try {
    const today = new Date();
    const bookingDate = new Date(today);
    bookingDate.setDate(today.getDate() + 30); // 30 days in the future
    const dateStr = bookingDate.toISOString().split('T')[0];

    const payload = {
      guestName: 'Event Test Guest',
      phone: '9988776655',
      email: customerEmail,
      eventType: 'Corporate',
      package: 'Corporate Conference Package',
      eventDate: dateStr,
      guestCount: 100, // exceeds capacity (50)
      specialRequirements: 'Projector screen required.'
    };

    const res = await fetch(`${baseUrl}/events/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status === 400 && !data.success) {
      console.log('✓ Rejection successful. Message:', data.message);
    } else {
      throw new Error(`Expected status 400 but got ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('✗ Capacity Rejection Check Failed:', err.message);
    process.exit(1);
  }

  // 6. Create Valid Event Booking
  console.log('\n[TEST 6] Create Valid Event Booking...');
  try {
    const today = new Date();
    const bookingDate = new Date(today);
    bookingDate.setDate(today.getDate() + 30); // 30 days in the future
    const dateStr = bookingDate.toISOString().split('T')[0];

    const payload = {
      guestName: 'Event Test Guest',
      phone: '9988776655',
      email: customerEmail,
      eventType: 'Corporate',
      package: 'Corporate Conference Package',
      eventDate: dateStr,
      guestCount: 40,
      specialRequirements: 'Projector screen required.'
    };

    const res = await fetch(`${baseUrl}/events/bookings`, {
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
      console.log(`✓ Booking created. Mongo ID: ${testBookingMongoId}, Booking ID: ${testBookingId}`);
      console.log(`✓ Initial Status: ${data.data.status} (Expected: Pending)`);
      console.log(`✓ Price charged: ₹${data.data.totalAmount} (Expected: ₹150000)`);
      if (data.data.totalAmount !== 150000) {
        throw new Error(`Unexpected price charged: ${data.data.totalAmount}`);
      }
    } else {
      throw new Error(`Failed to create booking: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Create Booking Failed:', err.message);
    process.exit(1);
  }

  // 7. Fetch User Bookings
  console.log('\n[TEST 7] Fetch Guest Event Bookings...');
  try {
    const res = await fetch(`${baseUrl}/events/bookings/my-bookings`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data)) {
      console.log(`✓ Fetched my-bookings list. Found ${data.data.length} event bookings.`);
      if (data.data.length === 0 || data.data[0].bookingId !== testBookingId) {
        throw new Error('Created booking not found in user bookings.');
      }
    } else {
      throw new Error(`Failed to fetch my bookings: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Fetch Guest Bookings Failed:', err.message);
    process.exit(1);
  }

  // 8. Admin Confirm Event Booking
  console.log('\n[TEST 8] Admin Confirm Event Booking...');
  try {
    const res = await fetch(`${baseUrl}/events/bookings/${testBookingMongoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'Confirmed') {
      console.log('✓ Booking status updated to Confirmed.');
    } else {
      throw new Error(`Failed to confirm booking: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Confirm Booking Failed:', err.message);
    process.exit(1);
  }

  // 9. Admin Complete Event Booking
  console.log('\n[TEST 9] Admin Complete Event Booking...');
  try {
    const res = await fetch(`${baseUrl}/events/bookings/${testBookingMongoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Completed' })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'Completed') {
      console.log('✓ Booking status updated to Completed.');
    } else {
      throw new Error(`Failed to complete booking: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Complete Booking Failed:', err.message);
    process.exit(1);
  }

  // 10. Admin Fetch All Event Bookings
  console.log('\n[TEST 10] Admin Fetch All Event Bookings...');
  try {
    const res = await fetch(`${baseUrl}/events/bookings`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data)) {
      console.log(`✓ Admin fetched all event bookings. Registry count: ${data.data.length}.`);
    } else {
      throw new Error(`Failed to fetch bookings list: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Admin Fetch Bookings Failed:', err.message);
    process.exit(1);
  }

  // 11. Delete Event Booking
  console.log('\n[TEST 11] Delete Event Booking...');
  try {
    const res = await fetch(`${baseUrl}/events/bookings/${testBookingMongoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log('✓ Booking successfully deleted.');
    } else {
      throw new Error(`Failed to delete: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Delete Failed:', err.message);
    process.exit(1);
  }

  console.log('\n--- All Event API Integration Tests Passed! ---');
  process.exit(0);
}

runTests();
