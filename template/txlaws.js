// ===== TEXAS LAWS PAGE =====
function renderTxLaws(container) {
  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>Texas Homeschool Laws & Options</h1>
        <p>Know your rights · Updated February 2026 · Source: THSC.org</p>
      </div>

      <div style="background:linear-gradient(135deg,#0F2240,#1A3560);border-radius:var(--radius);padding:24px;margin-bottom:24px;position:relative;overflow:hidden">
        <div style="position:absolute;right:-10px;top:-10px;font-size:7rem;opacity:0.08">⚖️</div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
          <span style="font-size:1.5rem">🏛️</span>
          <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:700;color:#fff">Texas is a Homeschool-Friendly State</div>
        </div>
        <div style="color:rgba(255,255,255,0.75);font-size:0.9rem;line-height:1.6;max-width:600px">
          Under <em>Leeper v. Arlington ISD (1994)</em>, Texas homeschools are legally classified as private schools. Parents have broad freedom to educate their children without state oversight, registration, or testing requirements.
        </div>
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
          <span class="badge" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8)">✓ No registration required</span>
          <span class="badge" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8)">✓ No testing mandated</span>
          <span class="badge" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8)">✓ No teacher certification needed</span>
          <span class="badge" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8)">✓ Parent controls curriculum</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-bottom:28px">
        ${HP.txlaws.map((item, i) => `
          <div class="card" style="cursor:pointer;transition:all 0.2s" onclick="this.querySelector('.law-answer').style.display=this.querySelector('.law-answer').style.display==='none'?'block':'none'">
            <div style="display:flex;align-items:flex-start;gap:12px">
              <div style="width:32px;height:32px;border-radius:8px;background:var(--blue);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.85rem;flex-shrink:0">${i+1}</div>
              <div>
                <div style="font-weight:600;font-size:0.9rem;line-height:1.4;margin-bottom:6px">${item.q}</div>
                <div class="law-answer" style="font-size:0.82rem;color:var(--text-2);line-height:1.6;white-space:pre-line">${item.a}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="section-title" style="margin-bottom:16px">📋 Your Texas Homeschool Checklist</div>
        ${[
          { done: true, text: 'Withdraw your child from public school in writing (if applicable)' },
          { done: true, text: 'Choose a bona fide curriculum covering required subjects' },
          { done: false, text: 'Keep attendance records (not required by law, but strongly recommended)' },
          { done: false, text: 'Keep grade and progress records' },
          { done: false, text: 'Check ESA+ eligibility at tea.texas.gov' },
          { done: false, text: 'Connect with a local homeschool group or co-op' },
          { done: false, text: 'Join THSC for legal protection and community support' },
        ].map(item => `
          <div class="task-item" onclick="this.querySelector('.task-check').classList.toggle('done');hp_showToast(this.querySelector('.task-text').textContent + (this.querySelector('.task-check').classList.contains('done') ? ' ✓' : ' unchecked'), '📋')">
            <div class="task-check ${item.done ? 'done' : ''}"></div>
            <div class="task-text ${item.done ? 'done' : ''}">${item.text}</div>
          </div>
        `).join('')}
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
        ${[
          { name: 'THSC', url: 'thsc.org', desc: 'Texas Home School Coalition — #1 legal resource', icon: '🛡️' },
          { name: 'TEA ESA+', url: 'tea.texas.gov', desc: 'Texas Education Agency — ESA+ program info', icon: '💰' },
          { name: 'HSLDA Texas', url: 'hslda.org', desc: 'Legal defense for homeschool families', icon: '⚖️' },
          { name: 'TxVSN', url: 'txvsn.org', desc: 'Texas Virtual School Network — free online courses', icon: '💻' },
        ].map(link => `
          <div class="card" style="cursor:pointer;text-align:center" onclick="hp_showToast('Opening ${link.url}...','🔗')">
            <div style="font-size:2rem;margin-bottom:8px">${link.icon}</div>
            <div style="font-weight:600;margin-bottom:4px">${link.name}</div>
            <div style="font-size:0.75rem;color:var(--text-3);margin-bottom:8px">${link.desc}</div>
            <div style="font-size:0.75rem;color:var(--blue)">${link.url}</div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:20px;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px;font-size:0.8rem;color:var(--text-3)">
        ⚠️ <strong>Disclaimer:</strong> This information is provided for general guidance only and is not legal advice. Laws can change. For current legal guidance, consult THSC at thsc.org or an attorney specializing in Texas homeschool law.
      </div>
    </div>
  `;
}
