import http from 'http';
import { io as ioClient } from 'socket.io-client';

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
  console.log('=== PHASE 6 & 7 END-TO-END INTEGRATION TEST ===');

  // 1. Driver & Rider Auth
  const dLogin = await request('POST', '/api/v1/auth/login', {
    email: 'driver@lpu.in',
    password: 'password123',
  });
  const dToken = dLogin.data.token;

  const rLogin = await request('POST', '/api/v1/auth/login', {
    email: 'rider@lpu.in',
    password: 'password123',
  });
  const rToken = rLogin.data.token;

  // 2. Create Ride & Accept Request -> Create Trip
  const departureTime = new Date(Date.now() + 3600000).toISOString();
  const rideRes = await request(
    'POST',
    '/api/v1/rides',
    {
      origin_name: 'Campus Gate 1',
      destination_name: 'City Mall',
      origin: { latitude: 31.2536, longitude: 75.7037 },
      destination: { latitude: 31.3260, longitude: 75.5762 },
      departure_time: departureTime,
      total_seats: 4,
    },
    dToken
  );
  const rideId = rideRes.data.ride.id;

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

  const acceptRes = await request(
    'PATCH',
    `/api/v1/rides/requests/${requestId}/status`,
    { status: 'ACCEPTED' },
    dToken
  );
  const tripId = acceptRes.data.result.trip.id;
  console.log('   ✅ Initialized Trip ID:', tripId, '| Status:', acceptRes.data.result.trip.status);

  // 3. Start OTP Flow (Redis Hashed OTP)
  console.log('\n3. Requesting Start OTP...');
  const startOtpRes = await request('POST', `/api/v1/trips/${tripId}/start-otp`, null, dToken);
  const startOtp = startOtpRes.data.devOtp;
  console.log('   ✅ Plain 4-Digit Start OTP Received by Rider:', startOtp);

  console.log('4. Driver Submits Start OTP Verification...');
  const verifyStartRes = await request(
    'POST',
    `/api/v1/trips/${tripId}/verify-start-otp`,
    { otp: startOtp },
    dToken
  );
  console.log('   ✅ Start OTP Verification Response:', verifyStartRes.data.message);
  console.log('   ✅ Trip State Transformed to:', verifyStartRes.data.result.status);

  // 5. WebSocket Live GPS Streaming Test
  console.log('\n5. Establishing Authenticated WebSocket Connections...');
  const driverSocket = ioClient('http://localhost:4000', {
    auth: { token: dToken },
  });
  const riderSocket = ioClient('http://localhost:4000', {
    auth: { token: rToken },
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  driverSocket.emit('trip:join', { tripId });
  riderSocket.emit('trip:join', { tripId });

  await new Promise((resolve) => setTimeout(resolve, 500));

  const gpsReceivedPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('WebSocket GPS update timeout')), 5000);
    riderSocket.on('trip:location_update', (data) => {
      clearTimeout(timeout);
      console.log('   ✅ Rider Received Live GPS Stream via WebSockets:');
      console.log('      Latitude:', data.latitude, '| Longitude:', data.longitude);
      resolve(data);
    });
  });

  console.log('6. Driver Streaming Live GPS Coordinates over WebSocket...');
  driverSocket.emit('trip:location', {
    tripId,
    latitude: 31.2600,
    longitude: 75.6800,
    timestamp: Date.now(),
  });

  await gpsReceivedPromise;

  driverSocket.disconnect();
  riderSocket.disconnect();

  // 7. Completion OTP Flow
  console.log('\n7. Requesting Completion OTP...');
  const compOtpRes = await request('POST', `/api/v1/trips/${tripId}/completion-otp`, null, dToken);
  const compOtp = compOtpRes.data.devOtp;
  console.log('   ✅ Plain 4-Digit Completion OTP Received by Rider:', compOtp);

  console.log('8. Driver Submits Completion OTP Verification...');
  const verifyCompRes = await request(
    'POST',
    `/api/v1/trips/${tripId}/verify-completion-otp`,
    { otp: compOtp },
    dToken
  );
  console.log('   ✅ Completion OTP Verification Response:', verifyCompRes.data.message);
  console.log('   ✅ Trip State Transformed to:', verifyCompRes.data.result.status);

  console.log('\n🎉 === ALL PHASE 6 & 7 TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Phase 6 & 7 Test failed:', err);
  process.exit(1);
});
