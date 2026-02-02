// Inlined verification for commission logic
const calculateCommission = (shares, price, exchange) => {
    const tradeValue = shares * price;
    if (exchange === 'DFM') {
        const brokerage = tradeValue * 0.00125;
        const marketFee = tradeValue * 0.0005;
        const depositoryFee = tradeValue * 0.0005;
        const scaFee = tradeValue * 0.0005;
        const orderFee = 10.00;
        const taxableSubtotal = brokerage + marketFee + depositoryFee + orderFee;
        const vat = taxableSubtotal * 0.05;
        const totalCommission = taxableSubtotal + vat + scaFee;
        return { tradeValue, brokerage, marketFee, depositoryFee, scaFee, orderFee, taxableSubtotal, vat, totalCommission, totalCost: tradeValue + totalCommission };
    } else {
        const brokerage = tradeValue * 0.00125;
        const marketFee = tradeValue * 0.00025;
        const taxableSubtotal = brokerage + marketFee;
        const vat = taxableSubtotal * 0.05;
        const totalCommission = taxableSubtotal + vat;
        return { tradeValue, brokerage, marketFee, taxableSubtotal, vat, totalCommission, totalCost: tradeValue + totalCommission };
    }
};

console.log('Commission Logic Verification:\n');

// 1. DFM Test: 10,000 shares @ 1.00 AED
const dfmResult = calculateCommission(10000, 1.00, 'DFM');
console.log('--- DFM (10,000 @ 1.00) ---');
console.log('Brokerage:', dfmResult.brokerage.toFixed(2));
console.log('Market:', dfmResult.marketFee.toFixed(2));
console.log('Depository:', dfmResult.depositoryFee.toFixed(2));
console.log('Order:', dfmResult.orderFee.toFixed(2));
console.log('SCA Fee:', dfmResult.scaFee.toFixed(2));
console.log('VAT:', dfmResult.vat.toFixed(2));
console.log('Total Commission:', dfmResult.totalCommission.toFixed(2));
console.log('Total Trade Cost:', dfmResult.totalCost.toFixed(2));

// Expected DFM:
// Brokerage: 12.50
// Market: 5.00
// Depository: 5.00
// SCA: 5.00
// Order: 10.00
// VAT: (12.5+5+5+10)*0.05 = 32.5 * 0.05 = 1.625
// Total Comm: 32.5 + 1.625 + 5 = 39.125
const dfmMatch = Math.abs(dfmResult.totalCommission - 39.125) < 0.001;
console.log('DFM Logic Match:', dfmMatch ? '✅' : '❌');

// 2. ADX Test: 10,000 shares @ 1.00 AED
const adxResult = calculateCommission(10000, 1.00, 'ADX');
console.log('\n--- ADX (10,000 @ 1.00) ---');
console.log('Brokerage:', adxResult.brokerage.toFixed(2));
console.log('Market Fee:', adxResult.marketFee.toFixed(2));
console.log('VAT:', adxResult.vat.toFixed(2));
console.log('Total Commission:', adxResult.totalCommission.toFixed(2));
console.log('Total Trade Cost:', adxResult.totalCost.toFixed(2));

// Expected ADX:
// Brokerage: 12.50
// Market: 2.50
// VAT: (12.5+2.5)*0.05 = 0.75
// Total Comm: 15 + 0.75 = 15.75
const adxMatch = Math.abs(adxResult.totalCommission - 15.75) < 0.001;
console.log('ADX Logic Match:', adxMatch ? '✅' : '❌');
