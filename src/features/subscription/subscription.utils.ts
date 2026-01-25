/**
 * Stripe Error Mapping Utility
 * Maps technical Stripe error codes to user-friendly localized messages
 */

export const mapStripeError = (error: any): string => {
    const errorCode = error?.code || error?.type || 'unknown_error';

    const errorMap: Record<string, string> = {
        'card_declined': 'Your card was declined. Please try a different payment method.',
        'expired_card': 'Your card has expired. Please use a different card.',
        'incorrect_cvc': 'The CVC code is incorrect.',
        'processing_error': 'An error occurred while processing your card. Try again in a moment.',
        'incorrect_number': 'The card number is incorrect.',
        'insufficient_funds': 'Your card has insufficient funds.',
        'stolen_card': 'This card has been reported as stolen.',
        'expired_subscription': 'Your subscription has expired. Please renew to continue.',
        'rate_limit': 'Too many requests. Please wait a moment and try again.',
        'validation_error': 'Invalid payment information provided.',
    };

    return errorMap[errorCode] || 'An unexpected payment error occurred. Please contact support.';
};
