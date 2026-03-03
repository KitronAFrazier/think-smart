// ===== RESOURCES PAGE =====
function renderResources(container) {
  const categories = [
    {
      icon: '💰', title: 'Scholarships & Funding',
      items: [
        { name: 'Texas ESA+ Program', desc: 'Up to $10,500/year for homeschool expenses. Open enrollment periods vary.', tag: 'State Program', link: 'tea.texas.gov' },
        { name: 'Special Needs ESA+', desc: 'Up to $11,500/year for students with qualifying disabilities.', tag: 'State Program', link: 'tea.texas.gov' },
        { name: 'THSC Scholarship Fund', desc: 'Local grants for Houston-area homeschool families. Apply annually.', tag: 'Local Grant', link: 'thsc.org' },
        { name: 'Khan Academy (Free)', desc: 'Complete free curriculum for K–12. Math, science, humanities and more.', tag: 'Free Resource', link: 'khanacademy.org' },
      ]
    },
    {
      icon: '🤸', title: 'Gymnastics Classes',
      items: [
        { name: 'Stars Gymnastics Houston', desc: 'Recreational and competitive gymnastics, ages 3–18. Zones 1 & 5.', tag: 'Zone 1, 5' },
        { name: 'Katy Gymnastics', desc: 'Homeschool daytime classes available Mon–Fri. Beginner to advanced.', tag: 'Zone 6' },
        { name: 'USA Gymnastics Pearland', desc: 'Certified coaches, flexible homeschool scheduling, beginner classes.', tag: 'Zone 4' },
      ]
    },
    {
      icon: '🏊', title: 'Swim Classes',
      items: [
        { name: 'YMCA Houston (Multiple)', desc: 'Affordable lessons with homeschool daytime scheduling. All zones.', tag: 'All Zones' },
        { name: 'SwimKids Houston', desc: 'Private and group lessons, year-round indoor pools. Zones 1–3.', tag: 'Zone 1–3' },
        { name: 'Sugar Land Aquatic Center', desc: 'Team swim and recreational lessons, homeschool discount available.', tag: 'Zone 5' },
      ]
    },
    {
      icon: '🥋', title: 'Self-Defense & Martial Arts',
      items: [
        { name: 'Tiger Schulmann\'s MMA Katy', desc: 'Kids self-defense, karate, and MMA. Daytime homeschool classes.', tag: 'Zone 6' },
        { name: 'Houston Gracie Jiu-Jitsu', desc: 'Brazilian jiu-jitsu for ages 5+. Multiple Houston locations.', tag: 'Zones 1, 4' },
        { name: 'TKD Champions Houston', desc: 'Taekwondo with homeschool flexible scheduling. Black belt program.', tag: 'Zone 2, 3' },
        { name: 'Krav Maga Houston', desc: 'Practical self-defense for older students (12+). Downtown location.', tag: 'Zone 1' },
      ]
    },
    {
      icon: '🎒', title: 'Field Trips',
      items: [
        { name: 'Houston Museum of Natural Science', desc: 'Homeschool days with discounts, guided tours, science labs.', tag: 'Zone 1' },
        { name: 'Space Center Houston (NASA)', desc: 'STEM-focused tours, homeschool programs, astronaut meet & greets.', tag: 'Zone 4' },
        { name: 'George Ranch Historical Park', desc: 'Texas history living history experience. Great for social studies.', tag: 'Zone 5' },
        { name: 'Houston Zoo', desc: 'Homeschool membership rates, curriculum-aligned programs.', tag: 'Zone 1' },
        { name: 'Houston Arboretum', desc: 'Nature education, plant science, and ecology. Free admission.', tag: 'Zone 1' },
      ]
    },
    {
      icon: '📚', title: 'Curriculum & Learning',
      items: [
        { name: 'Sonlight Curriculum', desc: 'Literature-based curriculum highly rated by TX homeschoolers.', tag: 'Curriculum' },
        { name: 'Singapore Math', desc: 'The gold standard for math curriculum K–12.', tag: 'Curriculum' },
        { name: 'Classical Conversations', desc: 'Houston-area community with weekly meetings. Zones 2, 5, 6.', tag: 'Co-op' },
        { name: 'Texas Virtual School Network (TxVSN)', desc: 'Free and low-cost online courses approved by TEA.', tag: 'Online' },
      ]
    }
  ];

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>Resources</h1>
        <p>Scholarships, local activities, curriculum, and field trips for Houston homeschoolers</p>
      </div>

      <div style="background:linear-gradient(135deg, #1E3A5F, #2563EB);border-radius:var(--radius);padding:24px;margin-bottom:24px;position:relative;overflow:hidden">
        <div style="position:absolute;right:-20px;top:-20px;font-size:8rem;opacity:0.1">💰</div>
        <div style="color:rgba(255,255,255,0.7);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">Featured Program</div>
        <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:#fff;margin-bottom:6px">Texas ESA+ Program</div>
        <div style="color:rgba(255,255,255,0.8);font-size:0.9rem;max-width:500px;margin-bottom:16px">Eligible Texas homeschool families can receive up to <strong style="color:#FCD34D">$10,500 per year</strong> to spend on approved educational expenses including curriculum, tutoring, testing, and extracurricular activities.</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn" style="background:#FCD34D;color:#000;font-weight:600" onclick="hp_showToast('Opening ESA+ info...','💰')">Check Eligibility →</button>
          <button class="btn" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3)" onclick="hp_showToast('ESA+ guide saved!','📥')">📥 Download Guide</button>
        </div>
      </div>

      ${categories.map(cat => `
        <div style="margin-bottom:28px">
          <div style="font-family:var(--font-display);font-size:1.15rem;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:8px">
            <span>${cat.icon}</span> ${cat.title}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">
            ${cat.items.map(item => `
              <div class="resource-card" onclick="hp_showToast('Opening ${item.name}...','🔗')">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;gap:8px">
                  <div style="font-weight:600;font-size:0.9rem;line-height:1.3">${item.name}</div>
                  <span class="badge blue" style="flex-shrink:0;font-size:0.65rem">${item.tag}</span>
                </div>
                <div style="font-size:0.8rem;color:var(--text-3);line-height:1.5;margin-bottom:10px">${item.desc}</div>
                ${item.link ? `<div style="font-size:0.75rem;color:var(--blue)">${item.link} →</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
