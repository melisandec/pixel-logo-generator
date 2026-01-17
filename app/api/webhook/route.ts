import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook endpoint for Farcaster Mini App events
 * Receives events like app added, notifications enabled, etc.
 * 
 * @see https://miniapps.farcaster.xyz/docs/specification#webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle different event types
    const eventType = body.type;
    
    switch (eventType) {
      case 'app.added':
        // User added the app to their home screen
        console.log('App added by user:', body.userFid);
        break;
      case 'app.removed':
        // User removed the app
        console.log('App removed by user:', body.userFid);
        break;
      case 'notifications.enabled':
        // User enabled notifications
        console.log('Notifications enabled for user:', body.userFid);
        break;
      case 'notifications.disabled':
        // User disabled notifications
        console.log('Notifications disabled for user:', body.userFid);
        break;
      default:
        console.log('Unknown event type:', eventType);
    }
    
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ 
      success: true,
      received: true 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent retries for malformed requests
    return NextResponse.json({ 
      success: false,
      error: 'Invalid request' 
    }, { status: 200 });
  }
}

// Handle GET requests (for health checks)
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'webhook',
    description: 'Farcaster Mini App webhook endpoint'
  });
}
