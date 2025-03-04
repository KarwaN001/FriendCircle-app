import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import {
    REVERB_APP_ID,
    REVERB_APP_KEY,
    REVERB_APP_SECRET,
    REVERB_HOST,
    REVERB_PORT,
    REVERB_SCHEME
} from '@env';

// Enable Pusher logging for debugging - remove in production
Pusher.logToConsole = __DEV__;

// Create a Pusher instance first
const pusherClient = new Pusher(REVERB_APP_KEY, {
    wsHost: REVERB_HOST,
    wsPort: parseInt(REVERB_PORT, 10),
    wssPort: parseInt(REVERB_PORT, 10),
    forceTLS: REVERB_SCHEME === 'https',
    encrypted: REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    cluster: 'mt1',
});

const echoConfig = {
    broadcaster: 'pusher',
    client: pusherClient,
    auth: {
        headers: {
            Accept: 'application/json',
        }
    },
    authEndpoint: '/api/broadcasting/auth',
};

let echoInstance = null;

export const createEcho = () => {
    if (!echoInstance) {
        console.log('Creating new Echo instance with config:', {
            ...echoConfig,
            appId: REVERB_APP_ID,
            key: REVERB_APP_KEY,
            host: REVERB_HOST,
            port: REVERB_PORT,
            scheme: REVERB_SCHEME
        });
        echoInstance = new Echo(echoConfig);
    }
    return echoInstance;
};

export const destroyEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
    // Also disconnect Pusher client
    if (pusherClient) {
        pusherClient.disconnect();
    }
};

export default echoConfig; 