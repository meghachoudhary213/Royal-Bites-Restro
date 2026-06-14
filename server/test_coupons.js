async function runTests() {
  console.log('--- Starting Coupons API Integration Tests ---');
  const baseUrl = 'http://localhost:5000/api';
  let adminToken = '';
  let customerToken = '';
  let testCouponId = '';
  const testCouponCode = `TCON${Math.floor(Math.random() * 10000)}`;

  // 1. Admin Login
  console.log('\n[TEST 1] Admin Login...');
  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'royalbites2026' })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.token) {
      adminToken = loginData.token;
      console.log('✓ Admin login successful. Token received.');
    } else {
      throw new Error(`Login failed: ${loginData.message}`);
    }
  } catch (err) {
    console.error('✗ Admin Login Test Failed:', err.message);
    process.exit(1);
  }

  // 2. Create Coupon (POST /api/coupons)
  console.log(`\n[TEST 2] Create Coupon (${testCouponCode})...`);
  const newCoupon = {
    code: testCouponCode,
    description: `50% off on test orders above ₹300`,
    discountType: 'percentage',
    discountValue: 50,
    minimumOrderAmount: 300,
    maximumDiscount: 200,
    expiryDate: '2028-12-31',
    usageLimit: 10
  };

  try {
    const createRes = await fetch(`${baseUrl}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(newCoupon)
    });
    const createData = await createRes.json();
    if (createRes.status === 201 && createData.success) {
      testCouponId = createData.data._id;
      console.log(`✓ Coupon created successfully. ID: ${testCouponId}, Code: ${createData.data.code}`);
      console.log('Sample Response:', JSON.stringify(createData, null, 2));
    } else {
      throw new Error(`Failed to create coupon: ${createData.message}`);
    }
  } catch (err) {
    console.error('✗ Create Coupon Test Failed:', err.message);
    process.exit(1);
  }

  // 3. Get All Coupons (GET /api/coupons)
  console.log('\n[TEST 3] Get Coupons (Admin vs Public)...');
  try {
    // Admin query
    const adminGetRes = await fetch(`${baseUrl}/coupons`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminGetData = await adminGetRes.json();
    
    // Public query
    const publicGetRes = await fetch(`${baseUrl}/coupons`);
    const publicGetData = await publicGetRes.json();

    if (adminGetRes.ok && publicGetRes.ok) {
      console.log(`✓ Admin see ${adminGetData.data.length} coupons, Public see ${publicGetData.data.length} coupons.`);
    } else {
      throw new Error('Failed to get coupons.');
    }
  } catch (err) {
    console.error('✗ Get Coupons Test Failed:', err.message);
    process.exit(1);
  }

  // 4. Get Coupon By ID or Code (GET /api/coupons/:id)
  console.log(`\n[TEST 4] Get Coupon by Code (${testCouponCode})...`);
  try {
    const getRes = await fetch(`${baseUrl}/coupons/${testCouponCode}`);
    const getData = await getRes.json();
    if (getRes.ok && getData.success) {
      console.log(`✓ Coupon retrieved by Code. Code: ${getData.data.code}`);
    } else {
      throw new Error(`Failed to get coupon by code: ${getData.message}`);
    }
  } catch (err) {
    console.error('✗ Get Coupon by Code Failed:', err.message);
    process.exit(1);
  }

  // 5. Coupon Validation API (POST /api/coupons/validate)
  console.log('\n[TEST 5] Coupon Validation...');
  
  // 5a. Valid Validation
  try {
    console.log(`-> Validating ${testCouponCode} with order amount ₹400 (Expected: Valid, 50% of 400 = 200 discount)...`);
    const valRes = await fetch(`${baseUrl}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode: testCouponCode, orderAmount: 400 })
    });
    const valData = await valRes.json();
    console.log('Sample Validation Response:', JSON.stringify(valData, null, 2));
    if (valRes.ok && valData.valid && valData.discountAmount === 200 && valData.finalAmount === 200) {
      console.log('✓ Valid coupon validation successful.');
    } else {
      throw new Error(`Unexpected validation response: ${JSON.stringify(valData)}`);
    }
  } catch (err) {
    console.error('✗ Valid Validation Failed:', err.message);
    process.exit(1);
  }

  // 5b. Invalid spend Validation
  try {
    console.log(`-> Validating ${testCouponCode} with order amount ₹200 (Expected: Invalid, minSpend is ₹300)...`);
    const valRes = await fetch(`${baseUrl}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode: testCouponCode, orderAmount: 200 })
    });
    const valData = await valRes.json();
    if (valRes.ok && !valData.valid && valData.message.includes('Min. spend')) {
      console.log(`✓ Invalid spend validation handled correctly. Message: "${valData.message}"`);
    } else {
      throw new Error(`Unexpected validation response: ${JSON.stringify(valData)}`);
    }
  } catch (err) {
    console.error('✗ Invalid Spend Validation Failed:', err.message);
    process.exit(1);
  }

  // 6. Update/Track Usage (PATCH /api/coupons/:id)
  console.log('\n[TEST 6] Update Coupon (Admin description update)...');
  try {
    const updateRes = await fetch(`${baseUrl}/coupons/${testCouponId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ description: 'Updated test coupon description' })
    });
    const updateData = await updateRes.json();
    if (updateRes.ok && updateData.success && updateData.data.description === 'Updated test coupon description') {
      console.log('✓ Coupon description updated successfully.');
    } else {
      throw new Error(`Update failed: ${updateData.message}`);
    }
  } catch (err) {
    console.error('✗ Update Coupon Failed:', err.message);
    process.exit(1);
  }

  // 6.5 Register/Login normal customer user
  console.log('\n[TEST 6.5] Register/Login normal customer user...');
  try {
    const custEmail = `customer_${Date.now()}@test.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: custEmail,
        phone: '1112223333',
        password: 'customerpassword'
      })
    });
    const regData = await regRes.json();
    if (regRes.ok && regData.token) {
      customerToken = regData.token;
      console.log('✓ Normal customer registered & token received.');
    } else {
      throw new Error(`Registration failed: ${regData.message}`);
    }
  } catch (err) {
    console.error('✗ Customer registration Failed:', err.message);
    process.exit(1);
  }

  // 7. Usage Tracking increment limit
  console.log(`\n[TEST 7] Increment usage count as customer user on ${testCouponCode}...`);
  try {
    const trackRes = await fetch(`${baseUrl}/coupons/${testCouponCode}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ usageCount: 1 })
    });
    const trackData = await trackRes.json();
    if (trackRes.ok && trackData.success && trackData.data.usageCount === 1) {
      console.log('✓ Coupon usage count successfully incremented.');
    } else {
      throw new Error(`Usage count update failed: ${trackData.message}`);
    }
  } catch (err) {
    console.error('✗ Increment Usage Count Failed:', err.message);
    process.exit(1);
  }

  // 7.5 Block customer from changing config
  console.log('\n[TEST 7.5] Try to modify coupon config as customer user (Expected: Forbidden)...');
  try {
    const fraudRes = await fetch(`${baseUrl}/coupons/${testCouponCode}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ description: 'Hacked!' })
    });
    const fraudData = await fraudRes.json();
    if (fraudRes.status === 403) {
      console.log(`✓ Access correctly forbidden: "${fraudData.message}"`);
    } else {
      throw new Error(`Expected status 403, got ${fraudRes.status}: ${JSON.stringify(fraudData)}`);
    }
  } catch (err) {
    console.error('✗ Block Customer Test Failed:', err.message);
    process.exit(1);
  }

  // 8. Delete Coupon (DELETE /api/coupons/:id)
  console.log('\n[TEST 8] Delete Coupon...');
  try {
    const deleteRes = await fetch(`${baseUrl}/coupons/${testCouponId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const deleteData = await deleteRes.json();
    if (deleteRes.ok && deleteData.success) {
      console.log('✓ Coupon deleted successfully.');
    } else {
      throw new Error(`Deletion failed: ${deleteData.message}`);
    }
  } catch (err) {
    console.error('✗ Delete Coupon Test Failed:', err.message);
    process.exit(1);
  }

  console.log('\n--- All Coupon API Integration Tests Passed! ---');
}

runTests();
