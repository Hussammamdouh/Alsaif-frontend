/**
 * Stock Commission Calculator Utility
 * Implements official fee structures for DFM and ADX
 */

export interface CommissionBreakdown {
    tradeValue: number;
    brokerage: number;
    marketFee: number;
    depositoryFee?: number;
    scaFee?: number;
    orderFee?: number;
    taxableSubtotal: number;
    vat: number;
    totalCommission: number;
    totalCost: number;
}

export const calculateCommission = (
    shares: number,
    price: number,
    exchange: 'DFM' | 'ADX',
    type: 'buy' | 'sell' = 'buy'
): CommissionBreakdown => {
    const tradeValue = shares * price;

    if (exchange === 'DFM') {
        // DFM Formula:
        // Brokerage: V * 0.00125
        // Market Fee: V * 0.0005
        // Depository Fee: V * 0.0005
        // SCA Fee: V * 0.0005 (VAT-exempt)
        // Order Fee: 10.00 AED

        const brokerage = tradeValue * 0.00125;
        const marketFee = tradeValue * 0.0005;
        const depositoryFee = tradeValue * 0.0005;
        const scaFee = tradeValue * 0.0005;
        const orderFee = 10.00;

        const taxableSubtotal = brokerage + marketFee + depositoryFee + orderFee;
        const vat = taxableSubtotal * 0.05;
        const totalCommission = taxableSubtotal + vat + scaFee;

        return {
            tradeValue,
            brokerage,
            marketFee,
            depositoryFee,
            scaFee,
            orderFee,
            taxableSubtotal,
            vat,
            totalCommission,
            totalCost: type === 'buy' ? tradeValue + totalCommission : tradeValue - totalCommission
        };
    } else {
        // ADX Formula:
        // Brokerage: V * 0.00125
        // Market Fee: V * 0.00025

        const brokerage = tradeValue * 0.00125;
        const marketFee = tradeValue * 0.00025;

        const taxableSubtotal = brokerage + marketFee;
        const vat = taxableSubtotal * 0.05;
        const totalCommission = taxableSubtotal + vat;

        return {
            tradeValue,
            brokerage,
            marketFee,
            taxableSubtotal,
            vat,
            totalCommission,
            totalCost: type === 'buy' ? tradeValue + totalCommission : tradeValue - totalCommission
        };
    }
};
