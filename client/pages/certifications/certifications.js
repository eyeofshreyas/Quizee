function certCardHtml(cert) {
    const meta = metaForCode(cert.code);
    return `
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-all group">
            <div class="h-48 certificate-preview flex items-center justify-center p-lg relative overflow-hidden">
                <div class="z-10 flex flex-col items-center">
                    <span class="material-symbols-outlined text-primary text-[64px] mb-sm" style="font-variation-settings: 'FILL' 1;">${meta.icon}</span>
                    <p class="font-label-md text-primary tracking-widest uppercase">${meta.level}</p>
                </div>
            </div>
            <div class="p-lg flex-1 flex flex-col">
                <h4 class="text-headline-md font-headline-md mb-xs">${cert.name}</h4>
                <p class="text-secondary text-body-md mb-md">${cert.code}</p>
                <p class="text-on-surface-variant text-sm mb-md">${cert.description || ''}</p>
                <div class="mt-auto space-y-sm">
                    <div class="grid grid-cols-2 gap-sm text-label-md font-label-md">
                        <div class="bg-surface-container-low p-xs rounded-lg border border-outline-variant">
                            <p class="text-on-surface-variant text-[10px] uppercase mb-[2px]">Passing Score</p>
                            <p>${cert.passingScore}</p>
                        </div>
                        <div class="bg-surface-container-low p-xs rounded-lg border border-outline-variant">
                            <p class="text-on-surface-variant text-[10px] uppercase mb-[2px]">Duration</p>
                            <p>${cert.durationMinutes} min</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-sm">
                        <a class="bg-primary text-white py-xs rounded-lg font-button-text flex items-center justify-center gap-xs transition-colors" href="../quiz/quize.html?certId=${cert._id}&type=practice">
                            <span class="material-symbols-outlined text-[18px]">play_circle</span> Practice
                        </a>
                        <a class="bg-inverse-surface text-inverse-on-surface py-xs rounded-lg font-button-text flex items-center justify-center gap-xs transition-colors" href="../quiz/quize.html?certId=${cert._id}&type=mock">
                            <span class="material-symbols-outlined text-[18px]">timer</span> Mock Exam
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function wireCardHover() {
    document.querySelectorAll('.bg-surface-container-lowest.border').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

if (typeof document !== 'undefined') {
    requireAuth();
    wireLogout('logoutLink');

    document.addEventListener('DOMContentLoaded', async () => {
        const grid = document.getElementById('certGrid');
        const certCount = document.getElementById('certCount');

        try {
            const certifications = await apiRequest('/certifications');
            grid.innerHTML = certifications.map(certCardHtml).join('');
            certCount.textContent = `${certifications.length} Certification${certifications.length === 1 ? '' : 's'} Available`;
            wireCardHover();
        } catch (err) {
            certCount.textContent = 'Unable to load certifications';
            grid.innerHTML = `<p class="text-error col-span-full">${err.message}</p>`;
        }
    });
}
