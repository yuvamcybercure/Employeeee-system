const { Expo } = require('expo-server-sdk');
const expo = new Expo();

/**
 * Send push notification to a user or multiple users
 * @param {string|string[]} tokens - Expo push tokens
 * @param {object} messageData - { title, body, data }
 */
exports.sendPushNotification = async (tokens, { title, body, data }) => {
    const pushTokens = Array.isArray(tokens) ? tokens : [tokens];
    const messages = [];

    for (const pushToken of pushTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to: pushToken,
            sound: 'default',
            title,
            body,
            data: data || {},
            priority: 'high',
            channelId: 'default',
        });
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error('Error sending push notification chunk', error);
        }
    }

    return tickets;
};
