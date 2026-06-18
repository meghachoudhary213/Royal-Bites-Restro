
async function runTests() {
  console.log('--- Starting Spa Management System Integration Tests ---');
  const baseUrl = 'http://localhost:5000/api';
  let adminToken = '';
  let customerToken = '';
  let customerEmail = `spa_guest_${Date.now()}@example.com`;
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

  // 2. Fetch Spa Services
  console.log('\n[TEST 2] Fetch Spa Services...');
  try {
    const res = await fetch(`${baseUrl}/spa/services`);
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data)) {
      console.log(`✓ Spa services list fetched. Found ${data.data.length} services (Expected: 6).`);
      const names = data.data.map(s => s.name);
      console.log('Services found:', names.join(', '));
      if (data.data.length === 0) {
        throw new Error('No spa services seeded.');
      }
    } else {
      throw new Error(`Failed to fetch spa services: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Fetch Spa Services Failed:', err.message);
    process.exit(1);
  }

  // 3. Register Guest Customer
  console.log(`\n[TEST 3] Register Guest Customer (${customerEmail})...`);
  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spa Test Guest',
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
      guestName: 'Spa Test Guest',
      phone: '9988776655',
      email: customerEmail,
      service: 'Aroma Therapy Massage',
      appointmentDate: '2025-01-01', // definitely in the past
      appointmentTime: '14:00',
      therapistPreference: 'Female',
      specialRequests: 'Lavender oil preferred.'
    };

    const res = await fetch(`${baseUrl}/spa/bookings`, {
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

  // 5. Create Valid Spa Booking
  console.log('\n[TEST 5] Create Valid Spa Booking...');
  try {
    const today = new Date();
    const bookingDate = new Date(today);
    bookingDate.setDate(today.getDate() + 2); // 2 days in the future
    const dateStr = bookingDate.toISOString().split('T')[0];

    const payload = {
      guestName: 'Spa Test Guest',
      phone: '9988776655',
      email: customerEmail,
      service: 'Aroma Therapy Massage',
      appointmentDate: dateStr,
      appointmentTime: '15:30',
      therapistPreference: 'Female',
      specialRequests: 'Lavender oil preferred.'
    };

    const res = await fetch(`${baseUrl}/spa/bookings`, {
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
      testBookingId = data.data.appointmentId;
      console.log(`✓ Booking created. Mongo ID: ${testBookingMongoId}, Appointment ID: ${testBookingId}`);
      console.log(`✓ Initial Status: ${data.data.status} (Expected: Pending)`);
      console.log(`✓ Price charged: ₹${data.data.totalAmount} (Expected: ₹4500)`);
      if (data.data.totalAmount !== 4500) {
        throw new Error(`Unexpected price charged: ${data.data.totalAmount}`);
      }
    } else {
      throw new Error(`Failed to create booking: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Create Booking Failed:', err.message);
    process.exit(1);
  }

  // 6. Fetch User Bookings
  console.log('\n[TEST 6] Fetch Guest Spa Bookings...');
  try {
    const res = await fetch(`${baseUrl}/spa/bookings/my-bookings`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data)) {
      console.log(`✓ Fetched my-bookings list. Found ${data.data.length} appointments.`);
      if (data.data.length === 0 || data.data[0].appointmentId !== testBookingId) {
        throw new Error('Created appointment not found in user bookings.');
      }
    } else {
      throw new Error(`Failed to fetch my bookings: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Fetch Guest Bookings Failed:', err.message);
    process.exit(1);
  }

  // 7. Admin Confirm Spa Booking
  console.log('\n[TEST 7] Admin Confirm Spa Booking...');
  try {
    const res = await fetch(`${baseUrl}/spa/bookings/${testBookingMongoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'Confirmed') {
      console.log('✓ Appointment status updated to Confirmed.');
    } else {
      throw new Error(`Failed to confirm appointment: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Confirm Appointment Failed:', err.message);
    process.exit(1);
  }

  // 8. Reschedule Spa Booking
  console.log('\n[TEST 8] Reschedule Spa Booking...');
  try {
    const today = new Date();
    const reschedDate = new Date(today);
    reschedDate.setDate(today.getDate() + 3); // 3 days in the future
    const dateStr = reschedDate.toISOString().split('T')[0];

    const res = await fetch(`${baseUrl}/spa/bookings/${testBookingMongoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'Rescheduled',
        appointmentDate: dateStr,
        appointmentTime: '17:00'
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'Rescheduled') {
      console.log(`✓ Status updated to Rescheduled.`);
      console.log(`✓ New Schedule: ${data.data.appointmentDate} at ${data.data.appointmentTime} (Expected: ${dateStr} at 17:00)`);
      if (data.data.appointmentDate !== dateStr || data.data.appointmentTime !== '17:00') {
        throw new Error('Schedule details not updated correctly.');
      }
    } else {
      throw new Error(`Failed to reschedule: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Reschedule Failed:', err.message);
    process.exit(1);
  }

  // 9. Complete Spa Booking
  console.log('\n[TEST 9] Complete Spa Booking...');
  try {
    const res = await fetch(`${baseUrl}/spa/bookings/${testBookingMongoId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Completed' })
    });
    const data = await res.json();
    if (res.ok && data.success && data.data.status === 'Completed') {
      console.log('✓ Status updated to Completed.');
    } else {
      throw new Error(`Failed to complete: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Complete Failed:', err.message);
    process.exit(1);
  }

  // 10. Admin Fetch All Spa Bookings
  console.log('\n[TEST 10] Admin Fetch All Spa Bookings...');
  try {
    const res = await fetch(`${baseUrl}/spa/bookings`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.data)) {
      console.log(`✓ Admin fetched all spa bookings. Registry count: ${data.data.length}.`);
    } else {
      throw new Error(`Failed to fetch bookings list: ${data.message}`);
    }
  } catch (err) {
    console.error('✗ Admin Fetch Bookings Failed:', err.message);
    process.exit(1);
  }

  // 11. Delete Spa Booking
  console.log('\n[TEST 11] Delete Spa Booking...');
  try {
    const res = await fetch(`${baseUrl}/spa/bookings/${testBookingMongoId}`, {
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

  console.log('\n--- All Spa API Integration Tests Passed! ---');
  process.exit(0);
}

runTests();
