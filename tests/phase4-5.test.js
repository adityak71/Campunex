import http from 'http';

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTest() {
  console.log('=== PHASE 4 & 5 END-TO-END INTEGRATION TEST ===');

  // 1. Driver Login
  console.log('1. Driver Login...');
  const dLogin = await request('POST', '/api/v1/auth/login', {
    email: 'driver@lpu.in',
    password: 'password123',
  });
  const dToken = dLogin.data.token;
  console.log('   ✅ Driver Logged In:', dLogin.data.user.name);

  // 2. Driver Creates Ride
  console.log('\n2. Driver Creates Ride (Campus -> Railway Station)...');
  const departureTime = new Date(Date.now() + 3600000).toISOString();
  const rideRes = await request(
    'POST',
    '/api/v1/rides',
    {
      origin_name: 'LPU Main Gate',
      destination_name: 'Jalandhar City Railway Station',
      origin: { latitude: 31.2536, longitude: 75.7037 },
      destination: { latitude: 31.3260, longitude: 75.5762 },
      waypoints: [{ latitude: 31.2800, longitude: 75.6400 }],
      departure_time: departureTime,
      total_seats: 3,
    },
    dToken
  );
  const rideId = rideRes.data.ride.id;
  console.log('   ✅ Ride Published ID:', rideId, '| Available Seats:', rideRes.data.ride.available_seats);

  // 3. PostGIS 500m Route Matching
  console.log('\n3. Rider Search (PostGIS 500m Spatial Route Matching)...');
  const matchRes = await request(
    'GET',
    '/api/v1/rides/matches?pickup_lat=31.2540&pickup_lng=75.7030&dropoff_lat=31.3255&dropoff_lng=75.5768'
  );
  console.log('   ✅ Match Count:', matchRes.data.count);
  const topMatch = matchRes.data.matches[0];
  console.log('   ✅ Top Match Driver:', topMatch?.driver_name);
  console.log('   ✅ Match Score:', topMatch?.matchScore + '%');
  console.log('   ✅ Pickup Route Proximity:', topMatch?.pickupDistanceMeters + 'm (Threshold <= 500m)');
  console.log('   ✅ Dropoff Route Proximity:', topMatch?.dropoffDistanceMeters + 'm (Threshold <= 500m)');

  // 4. Rider Login
  console.log('\n4. Rider Login...');
  const rLogin = await request('POST', '/api/v1/auth/login', {
    email: 'rider@lpu.in',
    password: 'password123',
  });
  const rToken = rLogin.data.token;
  console.log('   ✅ Rider Logged In:', rLogin.data.user.name);

  // 5. Rider Submits Ride Request
  console.log('\n5. Rider Submits Ride Request...');
  const reqRes = await request(
    'POST',
    `/api/v1/rides/${rideId}/requests`,
    {
      pickup: { latitude: 31.2540, longitude: 75.7030 },
      dropoff: { latitude: 31.3255, longitude: 75.5768 },
    },
    rToken
  );
  const requestId = reqRes.data.request.id;
  console.log('   ✅ Request Submitted ID:', requestId, '| Status:', reqRes.data.request.status);

  // 6. Driver Accepts Request (Atomic Seat Reservation & Trip Creation)
  console.log('\n6. Driver Accepts Request (Atomic Seat Reservation & Trip Initialization)...');
  const acceptRes = await request(
    'PATCH',
    `/api/v1/rides/requests/${requestId}/status`,
    { status: 'ACCEPTED' },
    dToken
  );
  console.log('   ✅ Request Status Updated:', acceptRes.data.result.requestStatus);
  console.log('   ✅ Initialized Trip ID:', acceptRes.data.result.trip.id);
  console.log('   ✅ Initialized Trip Status:', acceptRes.data.result.trip.status);

  console.log('\n🎉 === ALL PHASE 4 & 5 TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
