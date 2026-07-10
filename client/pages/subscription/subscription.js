const PRO_PRICE = {
    monthly: '$12 <span class="text-body-md font-normal text-on-surface-variant">/ month</span>',
    quarterly: '$29 <span class="text-body-md font-normal text-on-surface-variant">/ 3 months</span>'
};

function proPriceFor(cycle) {
    return PRO_PRICE[cycle] || PRO_PRICE.monthly;
}

const PAYMENT_HISTORY = [
    { date: 'Jun 24, 2026', description: 'Quizee Pro - Quarterly', amount: '$29.00', status: 'Paid' },
    { date: 'Mar 24, 2026', description: 'Quizee Pro - Quarterly', amount: '$29.00', status: 'Paid' },
    { date: 'Dec 24, 2025', description: 'Quizee Pro - Quarterly', amount: '$29.00', status: 'Paid' }
];

function renderPaymentHistory(tbody, payments) {
    tbody.innerHTML = payments.map(p => `
        <tr>
            <td class="px-lg py-md text-on-surface-variant">${p.date}</td>
            <td class="px-lg py-md text-on-surface">${p.description}</td>
            <td class="px-lg py-md font-bold text-on-surface">${p.amount}</td>
            <td class="px-lg py-md">
                <span class="text-tertiary bg-tertiary-container/10 px-sm py-1 rounded-full text-xs font-label-md">${p.status}</span>
            </td>
            <td class="px-lg py-md text-right">
                <span class="material-symbols-outlined text-secondary hover:text-primary cursor-pointer transition-colors">download</span>
            </td>
        </tr>
    `).join('');
}

if (typeof document !== 'undefined') {
    requireAuth();
    wireLogout('logoutLink');

    document.addEventListener('DOMContentLoaded', () => {
        renderPaymentHistory(document.getElementById('paymentHistoryBody'), PAYMENT_HISTORY);

        const cycleToggle = document.getElementById('cycleToggle');
        const cycleKnob = document.getElementById('cycleKnob');
        const proPriceDisplay = document.querySelector('[data-plan="pro"] .price-display');
        let cycle = 'monthly';

        cycleToggle.addEventListener('click', () => {
            cycle = cycle === 'monthly' ? 'quarterly' : 'monthly';
            cycleKnob.classList.toggle('quarterly', cycle === 'quarterly');
            proPriceDisplay.innerHTML = proPriceFor(cycle);
        });

        document.getElementById('upgradeBtn').addEventListener('click', () => {
            document.querySelector('[data-plan="pro"]').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
}

if (typeof module !== 'undefined' && require.main === module) {
    const assert = require('assert');
    assert.strictEqual(proPriceFor('monthly'), PRO_PRICE.monthly);
    assert.strictEqual(proPriceFor('quarterly'), PRO_PRICE.quarterly);
    assert.strictEqual(proPriceFor('bogus'), PRO_PRICE.monthly);
    console.log('subscription.js self-check passed');
}
