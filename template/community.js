// ===== COMMUNITY HUB PAGE =====
function renderCommunity(container) {
  let activeZone = HP.state.activeZone;

  function renderContent() {
    const filteredTeachers = activeZone ? HP.teachers.filter(t => t.zone === activeZone) : HP.teachers;
    const filteredGroups = activeZone ? HP.groups.filter(g => g.zone === activeZone) : HP.groups;

    return `
      <div class="page">
        <div class="page-header">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
            <div>
              <h1>Community Hub</h1>
              <p>Houston Metro Area · 60-mile radius from Downtown · 6 Zones</p>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-secondary btn-sm" onclick="hp_openTeacherSignup()">👩‍🏫 Become a Teacher</button>
              <button class="btn btn-gold btn-sm" onclick="hp_openCreateGroup()">+ Create Group</button>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:20px">
          <div class="section-header">
            <div class="section-title">Select Your Zone</div>
            ${activeZone ? `<button class="btn btn-ghost btn-sm" onclick="HP.state.activeZone=null;hp_navigate('community')">Clear filter ✕</button>` : ''}
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;position:relative;overflow:hidden;min-height:200px">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.04;font-size:12rem;pointer-events:none">🗺️</div>
            <div style="text-align:center;margin-bottom:12px;color:var(--text-3);font-size:0.82rem">Houston Metro · Tap a zone to filter</div>
            <!-- Visual zone layout mimicking map -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;max-width:480px;margin:0 auto">
              ${[
                { zone: HP.zones[1], pos: 'top-left' },
                { zone: HP.zones[0], pos: 'top-center' },
                { zone: HP.zones[2], pos: 'top-right' },
                { zone: HP.zones[5], pos: 'bot-left' },
                { zone: HP.zones[4], pos: 'bot-center' },
                { zone: HP.zones[3], pos: 'bot-right' },
              ].map(({ zone }) => {
                const isActive = activeZone === zone.num;
                return `
                  <div style="background:${isActive ? 'var(--blue)' : 'var(--surface)'};border:2px solid ${isActive ? 'var(--blue)' : 'var(--border)'};border-radius:10px;padding:12px 8px;text-align:center;cursor:pointer;transition:all 0.2s"
                    onclick="HP.state.activeZone=${isActive ? 'null' : zone.num};hp_navigate('community')"
                    onmouseover="if(!${isActive})this.style.borderColor='var(--blue-light)'"
                    onmouseout="if(!${isActive})this.style.borderColor='var(--border)'">
                    <div style="font-size:1.4rem;font-weight:800;font-family:var(--font-display);color:${isActive ? '#fff' : 'var(--blue)'}">Z${zone.num}</div>
                    <div style="font-size:0.7rem;font-weight:600;color:${isActive ? 'rgba(255,255,255,0.9)' : 'var(--text)'};margin-top:2px;line-height:1.3">${zone.name.split('/')[0].trim()}</div>
                    <div style="font-size:0.65rem;color:${isActive ? 'rgba(255,255,255,0.6)' : 'var(--text-3)'};margin-top:3px">${zone.groups} groups · ${zone.teachers} teachers</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          ${activeZone ? `
            <div style="background:var(--blue)11;border:1px solid var(--blue)33;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px">
              <span style="font-size:1.2rem">📍</span>
              <div>
                <div style="font-weight:600;font-size:0.9rem">${HP.zones[activeZone-1].name}</div>
                <div style="font-size:0.78rem;color:var(--text-3)">${HP.zones[activeZone-1].area}</div>
              </div>
              <div style="margin-left:auto;display:flex;gap:8px">
                <span class="badge blue">${HP.zones[activeZone-1].groups} groups</span>
                <span class="badge purple">${HP.zones[activeZone-1].teachers} teachers</span>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="tabs" style="margin-bottom:16px" id="community-tabs">
          <button class="tab active" onclick="showCommunityTab('groups',this)">👥 Groups (${filteredGroups.length})</button>
          <button class="tab" onclick="showCommunityTab('teachers',this)">👩‍🏫 Teachers (${filteredTeachers.length})</button>
          <button class="tab" onclick="showCommunityTab('events',this)">📋 Field Trips & Events</button>
        </div>

        <div id="community-tab-content">
          ${renderGroupsTab(filteredGroups)}
        </div>

        <div style="margin-top:16px" id="teachers-hidden" style="display:none"></div>
      </div>
    `;
  }

  function renderGroupsTab(groups) {
    if (!groups.length) return `<div class="empty-state"><div class="icon">👥</div><p>No groups found in this zone yet. Be the first to create one!</p></div>`;
    return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
      ${groups.map(g => `
        <div class="card" style="cursor:pointer" onclick="hp_showToast('Joined ${g.name}!','👥')">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
            <div style="font-weight:600;font-size:0.95rem">${g.name}</div>
            <span class="badge ${g.type === 'online' ? 'purple' : g.type === 'both' ? 'blue' : 'green'}">${g.type === 'online' ? '💻 Online' : g.type === 'both' ? '🌐 Hybrid' : '📍 In-Person'}</span>
          </div>
          <div style="font-size:0.8rem;color:var(--text-3);margin-bottom:12px">
            📅 ${g.meeting} · Zone ${g.zone}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:0.8rem;color:var(--text-2)">👨‍👩‍👧 ${g.members} families</span>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();hp_showToast('Request sent to join ${g.name}!','✉️')">Join Group</button>
          </div>
        </div>
      `).join('')}
      <div class="card" style="border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;min-height:120px;cursor:pointer;flex-direction:column;gap:8px;color:var(--text-3)" onclick="hp_openCreateGroup()">
        <div style="font-size:2rem">+</div>
        <div style="font-size:0.85rem;font-weight:500">Create New Group</div>
      </div>
    </div>`;
  }

  function renderTeachersTab(teachers) {
    if (!teachers.length) return `<div class="empty-state"><div class="icon">👩‍🏫</div><p>No verified teachers in this zone yet.</p></div>`;
    return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
      ${teachers.map(t => `
        <div class="card" style="cursor:pointer">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div style="width:50px;height:50px;border-radius:14px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">${t.avatar}</div>
            <div>
              <div style="font-weight:600">${t.name}</div>
              <div style="font-size:0.75rem;color:var(--text-3)">Zone ${t.zone} · ${t.rate}</div>
            </div>
            ${t.verified ? '<span class="badge green" style="margin-left:auto">✓ Verified</span>' : '<span class="badge gold" style="margin-left:auto">⏳ Pending</span>'}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
            ${t.subjects.map(s => `<span class="tag">${s}</span>`).join('')}
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;font-size:0.78rem;color:var(--text-3)">
            ${t.virtual ? '<span>💻 Virtual available</span>' : '<span>📍 In-person only</span>'}
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%" onclick="hp_showToast('Message sent to ${t.name}!','✉️')">Contact Teacher</button>
        </div>
      `).join('')}
    </div>`;
  }

  container.innerHTML = renderContent();

  // Wire up tabs
  window.showCommunityTab = function(tab, btn) {
    document.querySelectorAll('#community-tabs .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tc = document.getElementById('community-tab-content');
    const filteredTeachers = activeZone ? HP.teachers.filter(t => t.zone === activeZone) : HP.teachers;
    const filteredGroups = activeZone ? HP.groups.filter(g => g.zone === activeZone) : HP.groups;

    if (tab === 'groups') tc.innerHTML = renderGroupsTab(filteredGroups);
    else if (tab === 'teachers') tc.innerHTML = renderTeachersTab(filteredTeachers);
    else tc.innerHTML = renderEventsTab();
  };

  function renderEventsTab() {
    const events = [
      { name: 'Houston Museum of Natural Science', type: 'Field Trip', date: 'Mar 15', zone: 1, spots: 12, cost: '$5/student' },
      { name: 'George Ranch Historical Park', type: 'Field Trip', date: 'Mar 22', zone: 5, spots: 20, cost: 'Free' },
      { name: 'NASA JSC Tour', type: 'Field Trip', date: 'Apr 5', zone: 4, spots: 8, cost: '$12/student' },
      { name: 'Houston Arboretum Nature Walk', type: 'Field Trip', date: 'Apr 12', zone: 1, spots: 30, cost: 'Free' },
      { name: 'Co-op Science Fair', type: 'Event', date: 'Mar 29', zone: 6, spots: 50, cost: 'Free' },
    ];
    return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
      ${events.map(e => `
        <div class="card" onclick="hp_showToast('Signed up for ${e.name}!','🎒')">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="font-size:1.4rem">${e.type === 'Field Trip' ? '🎒' : '🎉'}</span>
            <span class="badge ${e.type === 'Field Trip' ? 'blue' : 'purple'}">${e.type}</span>
            <span class="badge gray">Zone ${e.zone}</span>
          </div>
          <div style="font-weight:600;margin-bottom:6px">${e.name}</div>
          <div style="font-size:0.8rem;color:var(--text-3);margin-bottom:12px">📅 ${e.date} · 👥 ${e.spots} spots · ${e.cost}</div>
          <button class="btn btn-primary btn-sm" style="width:100%" onclick="event.stopPropagation();hp_showToast('RSVP sent!','✅')">RSVP</button>
        </div>
      `).join('')}
    </div>`;
  }
}

function hp_openTeacherSignup() {
  hp_openModal('Become an Instructor', `
    <p style="font-size:0.85rem;color:var(--text-2);margin-bottom:16px">Sign up to offer classes to HomePath families in your zone. Background check required.</p>
    <div class="form-group">
      <label class="form-label">Your Name</label>
      <input class="form-input" placeholder="Full name" />
    </div>
    <div class="form-group">
      <label class="form-label">Subjects You Teach</label>
      <input class="form-input" placeholder="e.g., Math, Piano, Art, Self-Defense" />
    </div>
    <div class="form-group">
      <label class="form-label">Zone</label>
      <select class="form-select">
        ${HP.zones.map(z => `<option value="${z.num}">Zone ${z.num} — ${z.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Rate</label>
      <input class="form-input" placeholder="e.g., $40/hr" />
    </div>
    <div class="form-group">
      <label class="form-label">Max Class Size</label>
      <input type="number" class="form-input" placeholder="e.g., 8" min="1" max="30" />
    </div>
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:12px;font-size:0.8rem;color:var(--text-2);margin-bottom:16px">
      🔒 A background check ($29.99 one-time via Checkr) is required before your profile goes live. You'll receive an email with instructions.
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-secondary" onclick="hp_closeModal()" style="flex:1">Cancel</button>
      <button class="btn btn-gold" onclick="hp_closeModal();hp_showToast('Application submitted! Check your email.','👩‍🏫')" style="flex:1">Submit & Pay for Check</button>
    </div>
  `);
}

function hp_openCreateGroup() {
  hp_openModal('Create Community Group', `
    <div class="form-group">
      <label class="form-label">Group Name</label>
      <input class="form-input" placeholder="e.g., Katy STEM Co-op" />
    </div>
    <div class="form-group">
      <label class="form-label">Meeting Type</label>
      <select class="form-select">
        <option>In-Person</option><option>Online</option><option>Hybrid (Both)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Zone</label>
      <select class="form-select">
        ${HP.zones.map(z => `<option>Zone ${z.num} — ${z.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Regular Meeting Time</label>
      <input class="form-input" placeholder="e.g., Thursdays 9am" />
    </div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button class="btn btn-secondary" onclick="hp_closeModal()" style="flex:1">Cancel</button>
      <button class="btn btn-primary" onclick="hp_closeModal();hp_showToast('Group created!','👥')" style="flex:1">Create Group</button>
    </div>
  `);
}
