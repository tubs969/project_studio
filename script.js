/* ==========================================================================
   1. KONEKSI DATABASE SUPABASE
   ========================================================================== */
const SUPABASE_URL = 'https://phaixkfsgtircfrtnjcq.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_eoo-uE-tTXv2OwFbwqQiYQ_sz7I94M-'; 

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ==========================================================================
   2. UTILITAS DASAR & DATA STUDIO (BOGOR)
   ========================================================================== */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const rp=n=>'Rp '+n.toLocaleString('id-ID');
const toast=m=>{const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(toast.i);toast.i=setTimeout(()=>t.classList.remove('show'),2600)};
const U='https://images.unsplash.com/';

const STUDIOS=[
 {name:'Platinum A',loc:'Pajajaran, Bogor',addr:'Jl. Pajajaran No. 12, Bogor',price:150000,ready:true,rating:'4,9 dari 128 ulasan',imgs:['photo-1598488035139-bdbb2231ce04','photo-1516223725307-6f76b9ec8742','photo-1511671782779-c97d3d27a1d4','photo-1470225620780-dba8ba36b745'],area:'Pajajaran',hours:'09.00 – 23.00',coords:[-6.5900,106.7900]},
 {name:'Premium B',loc:'Taman Kencana, Bogor',addr:'Jl. Taman Kencana No. 40, Bogor',price:200000,ready:true,rating:'4,8 dari 96 ulasan',imgs:['photo-1516223725307-6f76b9ec8742','photo-1598488035139-bdbb2231ce04','photo-1511671782779-c97d3d27a1d4','photo-1470225620780-dba8ba36b745'],area:'Taman Kencana',hours:'10.00 – 22.00',coords:[-6.5800,106.7950]},
 {name:'Suite C',loc:'Bogor Baru, Bogor',addr:'Jl. Kapten Muslihat No. 8, Bogor',price:120000,ready:false,rating:'4,7 dari 64 ulasan',imgs:['photo-1511671782779-c97d3d27a1d4','photo-1598488035139-bdbb2231ce04','photo-1516223725307-6f76b9ec8742','photo-1470225620780-dba8ba36b745'],area:'Bogor Baru',hours:'09.00 – 21.00',coords:[-6.6000,106.7950]}];

const AREAS=['Semua','Pajajaran','Taman Kencana','Bogor Baru'];
const VA={BCA:'123-456-7890',Mandiri:'890-123-4567',BNI:'551-234-8899'};

/* ==========================================================================
   3. STORAGE, SESI USER & DARK MODE
   ========================================================================== */
const getUser=()=>{try{return JSON.parse(sessionStorage.sgUser||'null')}catch(e){return null}};
const user=getUser();

const currentTheme = localStorage.getItem('sgTheme') || 'light';
if(currentTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

const toggleTheme = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if(isDark){
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('sgTheme', 'light');
    const tb = $('#themeBtn'); if(tb) tb.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('sgTheme', 'dark');
    const tb = $('#themeBtn'); if(tb) tb.innerHTML = '<i class="fas fa-sun"></i>';
  }
};

/* ==========================================================================
   4. LOADING OVERLAY & GEOLOKASI
   ========================================================================== */
const showLoading=(text,success)=>{
  const ov=$('#loadingOverlay');
  if(!ov)return;
  const t=$('#loadingText');
  if(t) t.textContent=text||'Memproses…';
  ov.classList.toggle('success',!!success);
  ov.classList.add('show');
};
const hideLoading=()=>{
  const ov=$('#loadingOverlay');
  if(ov) ov.classList.remove('show','success');
};

const dist=(a,b)=>{if(!a||!b)return null;const R=6371,r=Math.PI/180,dLa=(b[0]-a[0])*r,dLo=(b[1]-a[1])*r;const s=Math.sin(dLa/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(s)))};
const fmtD=k=>k==null?null:(k<1?Math.round(k*1000)+' m':k.toFixed(1).replace('.',',')+' km');
const nearMe=cb=>{
  if(!navigator.geolocation){toast('Perangkat ini tidak mendukung deteksi lokasi');cb&&cb(null);return}
  toast('Mendeteksi lokasi Anda…');
  navigator.geolocation.getCurrentPosition(
    p=>{const c=[p.coords.latitude,p.coords.longitude];set({coords:c});toast('Lokasi ditemukan.');cb&&cb(c)},
    ()=>{toast('Izin lokasi ditolak.');cb&&cb(null)},
    {timeout:8000}
  );
};

/* ==========================================================================
   5. ANIMASI & UTILS
   ========================================================================== */
let revealIO=null;
if('IntersectionObserver' in window){
  revealIO=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');revealIO.unobserve(e.target)}});
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
}
const observeReveal=(root=document)=>{
  const els=$$('.reveal:not(.in)',root);
  if(!revealIO){els.forEach(el=>el.classList.add('in'));return}
  els.forEach(el=>revealIO.observe(el));
};

const img=(k,w=900)=>`${U}${k}?q=80&w=${w}&auto=format&fit=crop`;
const get=()=>{try{return JSON.parse(sessionStorage.sg||'{}')}catch(e){return{}}};
const set=o=>sessionStorage.sg=JSON.stringify({...get(),...o});
const idParam=()=>Math.min(+new URLSearchParams(location.search).get('id')||0,STUDIOS.length-1);
const page=document.body.dataset.page;

/* ==========================================================================
   6. RENDER HEADER & FOOTER
   ========================================================================== */
window.addEventListener('offline', () => {
  document.body.classList.add('is-offline');
  toast('Koneksi internet terputus!');
});
window.addEventListener('online', () => {
  document.body.classList.remove('is-offline');
  toast('Koneksi internet kembali.');
});

if(page !== 'admin'){
  const NAV=[['beranda.html','beranda','Beranda'],['pesanan.html','pesanan','Pesanan saya'],['bantuan.html','bantuan','Bantuan']];
  const navHTML=NAV.map(([h,t,l])=>`<a href="${h}" class="${page===t?'active':''}">${l}</a>`).join('');

  const profileHTML = user
    ? `<div class="profile-wrap" id="profileWrap">
        <button class="profile-avatar" id="profileBtn">${(user.name||'U').charAt(0).toUpperCase()}</button>
        <div class="profile-menu" id="profileMenu" role="menu">
          <div class="profile-info">
            <div class="profile-name">${user.name||'User'}</div>
            <div class="profile-email">${user.email||''}</div>
          </div>
          <a href="pesanan.html"><i class="fas fa-receipt"></i> Pesanan saya</a>
          <a href="bantuan.html"><i class="fas fa-question-circle"></i> Bantuan</a>
          ${user.email === 'kurtubi881@gmail.com' ? `<a href="admin.html" style="color:var(--blue); font-weight:800;"><i class="fas fa-shield-alt"></i> Dashboard Admin</a>` : ''}
          <button id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Keluar</button>
        </div>
      </div>`
    : `<a class="btn" href="login.html">Masuk</a>`;

  if($('#hdr'))$('#hdr').innerHTML=`<header><div class="wrap bar">
    <a href="beranda.html" class="logo"><i class="fas fa-headphones"></i>StudioGo</a>
    <button class="menu-btn" id="menuBtn"><i class="fas fa-bars"></i></button>
    <nav id="nav">${navHTML}</nav>
    <div style="display:flex; align-items:center; gap:15px;">
      <button id="themeBtn" style="background:none; border:none; color:var(--navy); font-size:20px; cursor:pointer;">
        ${currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'}
      </button>
      ${profileHTML}
    </div>
  </div>
  <div class="offline-banner"><i class="fas fa-wifi"></i> Tidak ada koneksi internet. Periksa jaringan Anda.</div>
  </header>`;

  const themeBtn = $('#themeBtn'); 
  if(themeBtn) themeBtn.onclick = toggleTheme;

  if($('#ftr'))$('#ftr').innerHTML=`<footer><div class="wrap"><span>© ${new Date().getFullYear()} StudioGo</span><span>Studio musik di Bogor</span></div></footer>
  <div class="toast" id="toast"></div>
  <div class="loading-overlay" id="loadingOverlay"><div class="loading-box"><div class="loading-spinner"></div><div class="loading-check"><i class="fas fa-check"></i></div><p id="loadingText">Memproses…</p></div></div>
  <div class="custom-modal" id="confirmModal"><div class="modal-backdrop" id="confirmBackdrop"></div><div class="modal-dialog"><div class="modal-icon"><i class="fas fa-exclamation-triangle"></i></div><h3 class="modal-title">Batalkan Pesanan</h3><p class="modal-msg" id="confirmMsg">Apakah Anda yakin ingin membatalkan pesanan ini?</p><div class="modal-actions"><button class="btn ghost" id="confirmNo">Kembali</button><button class="btn danger" id="confirmYes">Ya, Batalkan</button></div></div></div>`;

  const mb=$('#menuBtn'),nv=$('#nav');
  if(mb&&nv){
    mb.onclick=()=>{
      const o=nv.classList.toggle('open');
      mb.setAttribute('aria-expanded',o);
      mb.innerHTML=o?'<i class="fas fa-times"></i>':'<i class="fas fa-bars"></i>';
    };
  }

  const pWrap=$('#profileWrap'),pBtn=$('#profileBtn');
  if(pBtn&&pWrap){
    pBtn.onclick=e=>{ e.stopPropagation(); pWrap.classList.toggle('open'); };
    document.addEventListener('click',e=>{ if(!pWrap.contains(e.target)) pWrap.classList.remove('open'); });
    const lo=$('#logoutBtn');
    if(lo)lo.onclick=async ()=>{ await db.auth.signOut(); sessionStorage.removeItem('sgUser'); location.href='beranda.html'; };
  }
} else {
  if($('#hdr'))$('#hdr').innerHTML=`<header><div class="wrap bar"><a href="admin.html" class="logo"><i class="fas fa-shield-alt"></i>StudioGo Admin</a><a href="beranda.html" class="btn ghost">Kembali ke Web</a></div>
  <div class="offline-banner"><i class="fas fa-wifi"></i> Tidak ada koneksi internet.</div>
  </header>`;
  if($('#ftr'))$('#ftr').innerHTML=`<div class="toast" id="toast"></div>`;
}

/* ==========================================================================
   7. LOGIN & DAFTAR
   ========================================================================== */
if(page==='login'){
  if(getUser()){
    location.replace('beranda.html');
  } else {
    const loginForm=$('#loginForm'), regForm=$('#regForm');
    const setMsg=(el,t,ok)=>{ if(!el) return; el.textContent=t; el.style.color=ok?'var(--ok)':'var(--bad)'; };

    const tabs = $$('.tabs button');
    tabs.forEach(x=>x.classList.remove('on'));
    const loginTab = tabs.find(x=>x.dataset.tab==='login') || tabs[0];
    if(loginTab) loginTab.classList.add('on');
    if(loginForm) loginForm.hidden = false;
    if(regForm)   regForm.hidden   = true;

    tabs.forEach(b=>b.onclick=()=>{
      tabs.forEach(x=>x.classList.remove('on'));
      b.classList.add('on');
      const isReg=b.dataset.tab==='register';
      if(loginForm) loginForm.hidden=isReg;
      if(regForm) regForm.hidden=!isReg;
      setMsg($('#loginMsg'), '', true);
      setMsg($('#regMsg'), '', true);
    });

    const doLogin = async () => {
      const idEl=$('#loginId'), pwEl=$('#loginPw'), msg=$('#loginMsg');
      if(!idEl || !pwEl){ setMsg(msg, 'Form login tidak ditemukan.', false); return; }
      const id=(idEl.value||'').trim(), pw=pwEl.value||'';
      if(!id || !pw){ setMsg(msg, 'Isi email dan password dulu.', false); return; }
      setMsg(msg, 'Memproses login...', true);
      const { data, error } = await db.auth.signInWithPassword({ email: id, password: pw });
      if (error) {
        setMsg(msg, 'Gagal masuk: ' + error.message, false);
      } else {
        const { data: profile } = await db.from('profiles').select('*').eq('id', data.user.id).single();
        sessionStorage.sgUser = JSON.stringify({
          name: profile ? profile.name : id.split('@')[0],
          email: data.user.email,
          username: profile ? profile.username : id.split('@')[0],
          id: data.user.id
        });
        setMsg(msg, 'Berhasil masuk. Mengarahkan…', true);
        setTimeout(() => location.href = 'beranda.html', 500);
      }
    };
    if($('#authGo')) $('#authGo').onclick = doLogin;
    if($('#loginPw')) $('#loginPw').addEventListener('keydown',e=>{
      if(e.key==='Enter'){ e.preventDefault(); doLogin(); }
    });

    const doRegister = async () => {
      const g=id=>{ const el=$('#'+id); return el ? (el.value||'').trim() : ''; };
      const username=g('regUser'), name=g('regName'), email=g('regEmail'), phone=g('regPhone'), pw=g('regPw'), pw2=g('regPw2'), msg=$('#regMsg');
      if(!username||!name||!email||!phone||!pw||!pw2){ setMsg(msg,'Lengkapi semua kolom dulu.',false); return; }
      if(pw.length<6){ setMsg(msg,'Kata sandi minimal 6 karakter.',false); return; }
      if(pw!==pw2){ setMsg(msg,'Konfirmasi kata sandi tidak cocok.',false); return; }
      setMsg(msg, 'Mendaftarkan akun...', true);
      const { data: authData, error: authError } = await db.auth.signUp({ email, password: pw });
      if (authError) { setMsg(msg, 'Gagal daftar: ' + authError.message, false); return; }
      if (authData.user) {
        const { error: profileError } = await db.from('profiles').insert([{ id: authData.user.id, username, name, email, phone }]);
        if (profileError) {
          setMsg(msg, 'Gagal simpan profil: ' + profileError.message, false);
        } else {
          sessionStorage.sgUser = JSON.stringify({ name, email, username, id: authData.user.id });
          setMsg(msg, 'Akun berhasil dibuat. Mengarahkan…', true);
          setTimeout(() => location.href = 'beranda.html', 700);
        }
      }
    };
    if($('#regGo')) $('#regGo').onclick = doRegister;
  }
}

/* ==========================================================================
   8. HALAMAN BERANDA & CARI STUDIO
   ========================================================================== */
if(page==='beranda'){
  const el=$('#feat');
  if(el){
    el.innerHTML = Array(3).fill(`
      <article class="card skeleton-card">
        <div class="skeleton" style="aspect-ratio:16/10; border-radius:14px 14px 0 0;"></div>
        <div class="body" style="padding:18px;">
          <div class="skeleton" style="width: 60%; height: 18px; margin-bottom: 10px;"></div>
          <div class="skeleton" style="width: 80%; height: 14px; margin-bottom: 15px;"></div>
          <div class="skeleton" style="width: 40%; height: 24px;"></div>
        </div>
      </article>
    `).join('');

    setTimeout(() => {
      el.innerHTML=STUDIOS.map((s,i)=>({...s,i})).slice(0,3).map(s=>`
        <article class="card reveal">
          <div class="img" style="background-image:url('${img(s.imgs[0])}')">
            <span class="tag ${s.ready?'ready':'busy'}"><i class="fas fa-circle"></i>${s.ready?'Tersedia':'Sudah dibooking'}</span>
          </div>
          <div class="body">
            <h3>${s.name}</h3>
            <div class="loc"><i class="fas fa-map-marker-alt"></i> ${s.loc}</div>
            <div class="price">${rp(s.price)} <small>/ jam</small></div>
            <a class="btn" style="text-align:center" href="detail.html?id=${s.i}">Lihat detail</a>
          </div>
        </article>`).join('');
      observeReveal(el);
    }, 600);
  }
}

if(page==='home'){
  const st=get(); let f='all', area=st.area||'Semua', sort=st.sort||'pop', usr=st.coords||null;
  if($('#areas')){
    $('#areas').innerHTML=AREAS.map(a=>`<button class="chip${a===area?' on':''}" data-a="${a}">${a==='Semua'?'<i class="fas fa-globe-asia"></i> Semua area':a}</button>`).join('');
    $$('#areas .chip').forEach(c=>c.onclick=()=>{
      $$('#areas .chip').forEach(x=>x.classList.remove('on')); c.classList.add('on');
      area=c.dataset.a; $('#loc').value=area==='Semua'?'':area; set({area}); draw();
    });
  }
  if($('#sortBy'))$('#sortBy').value=sort;
  
  const draw=()=>{
    $('#cards').innerHTML = Array(3).fill(`
      <article class="card skeleton-card">
        <div class="skeleton" style="aspect-ratio:16/10; border-radius:14px 14px 0 0;"></div>
        <div class="body" style="padding:18px;">
          <div class="skeleton" style="width: 60%; height: 18px; margin-bottom: 10px;"></div>
          <div class="skeleton" style="width: 80%; height: 14px; margin-bottom: 15px;"></div>
          <div class="skeleton" style="width: 40%; height: 24px;"></div>
        </div>
      </article>
    `).join('');

    setTimeout(() => {
      const q=$('#loc').value.trim().toLowerCase();
      let list=STUDIOS.map((s,i)=>({...s,i})).filter(s=>(f==='all'||(f==='ready')===s.ready)&&s.loc.toLowerCase().includes(q)).map(s=>({...s,d:dist(usr,s.coords)}));
      
      if(sort==='near'&&usr)list.sort((a,b)=>a.d-b.d);
      else if(sort==='cheap')list.sort((a,b)=>a.price-b.price);
      else if(sort==='rating')list.sort((a,b)=>parseFloat(b.rating.replace(',','.'))-parseFloat(a.rating.replace(',','.')));
      
      $('#cards').innerHTML=list.map(s=>`
        <article class="card reveal">
          <div class="img" style="background-image:url('${img(s.imgs[0])}')">
            <span class="tag ${s.ready?'ready':'busy'}"><i class="fas fa-circle"></i>${s.ready?'Tersedia':'Sudah dibooking'}</span>
          </div>
          <div class="body">
            <h3>${s.name}</h3>
            <div class="loc"><i class="fas fa-map-marker-alt"></i> ${s.loc}</div>
            ${s.d!=null?`<div class="dist"><i class="fas fa-location-arrow"></i> ${fmtD(s.d)} dari lokasi Anda</div>`:''}
            <div class="price">${rp(s.price)} <small>/ jam</small></div>
            ${s.ready?`<a class="btn" style="text-align:center" href="detail.html?id=${s.i}">Lihat detail</a>`:'<button class="btn" disabled>Sudah dibooking</button>'}
          </div>
        </article>`).join('');
      $('#empty').style.display=list.length?'none':'block';
      if($('#count'))$('#count').textContent=list.length?`${list.length} studio ditemukan${usr?' • jarak dihitung':''}`:'Tidak ada studio yang cocok.';
      observeReveal($('#cards'));
    }, 500);
  };
  
  $$('.filters .chip').forEach(c=>c.onclick=()=>{
    $$('.filters .chip').forEach(x=>x.classList.remove('on')); c.classList.add('on'); f=c.dataset.f; draw();
  });
  if($('#sortBy'))$('#sortBy').onchange=e=>{sort=e.target.value;set({sort});draw()};
  if($('#nearMe'))$('#nearMe').onclick=()=>{nearMe(c=>{if(c){usr=c;sort='near';$('#sortBy').value='near';set({sort});draw()}})};
  $('#loc').oninput=draw; $('#doSearch').onclick=()=>{draw();$('#studio').scrollIntoView()};
  draw();
}

/* ==========================================================================
   9. HALAMAN DETAIL
   ========================================================================== */
if(page==='detail'){
  const i=idParam(),s=STUDIOS[i],st=get();
  const setImg = (k) => {
    $('#mainImg').style.backgroundImage=`url('${img(k,1400)}')`;
    $('#mainImg').dataset.currentImg = k;
  };
  setImg(s.imgs[0]);
  
  $('#thumbs').innerHTML=s.imgs.map((k,n)=>`<button class="thumb${n?'':' on'}" data-k="${k}" style="background-image:url('${img(k,500)}')" aria-label="Foto ${n+1}"></button>`).join('');
  $$('.thumb').forEach(t=>t.onclick=()=>{$$('.thumb').forEach(x=>x.classList.remove('on'));t.classList.add('on');setImg(t.dataset.k);});
  
  $('#nm').textContent=s.name; $('#rt').textContent=s.rating; $('#ad').textContent=s.addr; $('#pr').innerHTML=`${rp(s.price)} <small>/ jam</small>`; $('#go').href='booking.html?id='+i;
  
  if($('#hr')){
    $('#hr').textContent='Buka '+s.hours;
    const openH=+s.hours.slice(0,2), closeH=+s.hours.slice(8,10), now=new Date().getHours();
    const isOpen=now>=openH&&now<closeH; const ob=$('#open');
    if(ob){ob.textContent=isOpen?'Buka sekarang':'Tutup';ob.className='openbadge '+(isOpen?'ok':'no')}
  }
  if($('#mapWrap')&&s.coords){
    const [la,lo]=s.coords, d=dist(st.coords,s.coords);
    $('#mapWrap').innerHTML=`
      <iframe title="Peta ${s.name}" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${lo-0.008}%2C${la-0.006}%2C${lo+0.008}%2C${la+0.006}&layer=mapnik&marker=${la}%2C${lo}"></iframe>
      <div class="map-actions">
        <a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${la},${lo}"><i class="fas fa-map-marked-alt"></i> Google Maps</a>
      </div>`;
  }

  $('#mainImg').onclick = () => {
    const imgSrc = `url('${img($('#mainImg').dataset.currentImg, 2000)}')`;
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `<div class="lightbox-content" style="background-image:${imgSrc}"></div>`;
    document.body.appendChild(lb);
    setTimeout(() => lb.classList.add('open'), 10);
    lb.onclick = () => { lb.classList.remove('open'); setTimeout(() => lb.remove(), 300); };
  };
}

/* ==========================================================================
   10. HALAMAN BOOKING (LOGIKA KALENDER BULANAN)
   ========================================================================== */
if(page==='booking'){
  const i=idParam(),s=STUDIOS[i];
  let duration=2, startTime='16:00', v=true;
  let selectedDateStr = '';
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const dateToday = today.getDate();
  
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  
  if($('#monthYear')) $('#monthYear').textContent = months[month] + ' ' + year;
  
  const daysContainer = $('#days');
  if(daysContainer) {
    $$('.day', daysContainer).forEach(el => el.remove());

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); 
    const offset = startDay === 0 ? 6 : startDay - 1; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for(let e=0; e<offset; e++){
      const emptyBtn = document.createElement('button');
      emptyBtn.className = 'day';
      emptyBtn.style.visibility = 'hidden';
      daysContainer.appendChild(emptyBtn);
    }

    for(let d=1; d<=daysInMonth; d++){
      const b = document.createElement('button');
      b.className = 'day';
      b.textContent = d;
      
      const cellDate = new Date(year, month, d);
      const dateStr = `${dayNames[cellDate.getDay()]}, ${d} ${months[month]} ${year}`;
      
      if(d === dateToday){
        b.classList.add('on');
        selectedDateStr = dateStr;
      } else if (d < dateToday) {
        b.disabled = true;
      }
      
      b.onclick = () => {
        $$('.day').forEach(x=>x.classList.remove('on'));
        b.classList.add('on');
        selectedDateStr = dateStr;
        calc();
      };
      daysContainer.appendChild(b);
    }

    const totalCells = offset + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for(let n=1; n<=remainingCells; n++){
      const b = document.createElement('button');
      b.className = 'day dimmed';
      b.textContent = n;
      b.disabled = true;
      daysContainer.appendChild(b);
    }
  }

  $('#sName').textContent=s.name;
  if($('#durasi')) $('#durasi').onchange = (e) => { duration = parseInt(e.target.value); calc(); };

  $$('.slot:not(:disabled)').forEach(b=>b.onclick=()=>{
    $$('.slot').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); startTime=b.dataset.t; calc();
  });
  
  $('#applyV').onclick=()=>{
    v=$('#vc').value.trim().toUpperCase()==='STUDIOGO10';
    const m=$('#vmsg'); m.textContent=v?'Voucher STUDIOGO10 dipakai: diskon 10%.':'Kode tidak dikenali.'; m.style.color=v?'var(--ok)':'var(--bad)'; calc();
  };
  
  function calc(){
    const [h, m] = startTime.split(':').map(Number);
    const endH = (h + duration) % 24;
    const endTime = String(endH).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    const timeStr = `${startTime} - ${endTime}`;
    
    const basePrice = s.price * duration;
    const discount = v ? basePrice * 0.1 : 0;
    
    $('#sDate').textContent = selectedDateStr;
    $('#sTime').textContent = timeStr;
    $('#sBase').textContent = `${duration} jam x ${rp(s.price)}`;
    $('#sSub').textContent = rp(basePrice);
    $('#sDisc').textContent = discount ? '- ' + rp(discount) : 'Rp 0';
    $('#sTotal').textContent = rp(basePrice - discount);
  }
  calc();
  
  $('#next').onclick=()=>{
    const n=$('#n').value.trim(),e=$('#e').value.trim(),p=$('#p').value.trim();
    if(!n||!e||!p){toast('Lengkapi nama, email, dan no. telepon');return}
    
    const [h, m] = startTime.split(':').map(Number);
    const endH = (h + duration) % 24;
    const endTime = String(endH).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    const timeStr = `${startTime} - ${endTime}`;
    const basePrice = s.price * duration;
    const discount = v ? basePrice * 0.1 : 0;
    
    set({ id:i, studio:s.name, date:selectedDateStr, time:timeStr, name:n, email:e, phone:p, sub:basePrice, disc:discount, order:'#SGO-'+Math.floor(10000+Math.random()*89999) });
    location.href='pembayaran.html';
  };
}

/* ==========================================================================
   11. HALAMAN PEMBAYARAN
   ========================================================================== */
if(page==='bayar'){
  const d=get(); if(!d.studio){location.replace('index.html')}
  const total=(d.sub||0)-(d.disc||0);
  $('#pS').textContent=d.studio; $('#pBase').textContent=rp(total); $('#pTotal').textContent=rp(total+5000);
  let left=599;
  setInterval(()=>{if(left<=0)return; left--; $('#timer').textContent=String(left/60|0).padStart(2,'0')+':'+String(left%60).padStart(2,'0');},1000);

  const syncVA=()=>{const b=$('input[name="b"]:checked');if(b&&$('#va'))$('#va').textContent=VA[b.value]||'-'};
  $$('input[name="b"]').forEach(r=>r.onchange=syncVA); syncVA();

  if($('#copyVa'))$('#copyVa').onclick=async()=>{
    const t=$('#va').textContent;
    try{await navigator.clipboard.writeText(t);toast('Nomor VA disalin')}catch(e){toast('Salin manual: '+t)}
  };

  $$('.acc>button').forEach(b=>b.onclick=()=>{$$('.acc').forEach(a=>a!==b.parentElement&&a.classList.remove('open'));b.parentElement.classList.toggle('open');});

  $('#paid').onclick=()=>{
    const a=$('.acc.open'),r=a&&$('input:checked',a); 
    const method=r?r.parentElement.textContent.trim():(a?'QRIS':'QRIS');
    const totalAkhir = total + 5000;
    const currentUser = getUser();

    if (!currentUser || !currentUser.id) { alert("Sesi login habis. Silakan login ulang."); location.href = 'login.html'; return; }

    showLoading('Menyimpan pesanan…', false);

    setTimeout(async () => {
      const { error } = await db.from('orders').insert([{
        user_id: currentUser.id, studio_name: d.studio, booking_date: d.date, booking_time: d.time, customer_name: d.name, customer_phone: d.phone, subtotal: d.sub, discount: d.disc, total_paid: totalAkhir, payment_method: method, order_code: d.order, status: 'Lunas'
      }]);

      if (error) { alert("Gagal menyimpan pesanan: " + error.message); hideLoading(); } 
      else { showLoading('Pembayaran berhasil!', true); setTimeout(()=>location.href='pesanan.html', 800); }
    }, 1200);
  };
}

/* ==========================================================================
   12. HALAMAN PESANAN (+ SKELETON SHIMMER)
   ========================================================================== */
if(page==='pesanan'){
  const renderOrder=(o,idx)=>{
    const cancelled = o.status==='Dibatalkan';
    return `<div class="order-card ${cancelled?'cancelled':''}" data-idx="${idx}" data-id="${o.id}">
      <div class="order-head">
        <div><div class="order-code">${o.order_code}</div><div class="order-studio">${o.studio_name}</div></div>
        <div class="order-status ${cancelled?'cancel':'paid'}">${o.status||'Lunas'}</div>
      </div>
      <div class="order-body">
        <div class="order-grid">
          <div><span>Tanggal</span><b>${o.booking_date}</b></div><div><span>Jam</span><b>${o.booking_time}</b></div>
          <div><span>Pemesan</span><b>${o.customer_name}</b></div><div><span>Telepon</span><b>${o.customer_phone}</b></div>
          <div><span>Metode bayar</span><b>${o.payment_method||'QRIS'}</b></div><div><span>Waktu bayar</span><b>Baru saja</b></div>
        </div>
        <div class="order-price">
          <div class="row"><span>Subtotal</span><b>${rp(o.subtotal||0)}</b></div><div class="row"><span>Diskon</span><b>${o.discount?'- '+rp(o.discount):'Rp 0'}</b></div>
          <div class="row"><span>Biaya layanan</span><b>Rp 5.000</b></div><div class="row sum"><span>Total dibayar</span><b>${rp(o.total_paid||0)}</b></div>
        </div>
      </div>
      <div class="order-actions">
        <button class="btn ghost" data-act="dl"><i class="fas fa-print"></i> Cetak Bukti</button>
        ${!cancelled ? `<button class="btn" data-act="review" style="background:var(--ok); border:none; color:#fff;"><i class="fas fa-star"></i> Beri Ulasan</button>` : ''}
        ${!cancelled?`<button class="btn danger" data-act="cancel"><i class="fas fa-times"></i> Batalkan pesanan</button>`:''}
      </div>
    </div>`;
  };

  const renderPesanan = async () => {
    const content=$('#content');
    const currentUser=getUser();
    
    if (!currentUser || !currentUser.id) {
      content.innerHTML=`<div class="panel" style="text-align:center;padding:48px"><h3>Silakan Login</h3><p>Kamu harus login dulu buat lihat pesanan.</p><a class="btn" href="login.html">Masuk</a></div>`;
      return;
    }

    content.innerHTML = `
      <div class="panel skeleton" style="height: 80px; margin-bottom: 24px;"></div>
      <div class="panel skeleton" style="height: 250px; margin-bottom: 16px;"></div>
      <div class="panel skeleton" style="height: 250px;"></div>
    `;

    const { data: orders, error } = await db.from('orders').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
    
    if (error) { content.innerHTML=`<div class="panel" style="text-align:center;padding:48px">Gagal memuat pesanan.</div>`; return; }

    if(!orders || !orders.length){
      content.innerHTML=`<div class="panel empty-state" style="text-align:center;padding:56px 24px">
        <div class="empty-icon"><i class="fas fa-receipt"></i></div>
        <h3 class="t" style="margin-top:20px">Belum ada pesanan</h3>
        <p class="sub" style="margin:0 auto 22px">Pilih studio dulu, lalu pesanan Anda muncul di sini.</p>
        <a class="btn" href="index.html"><i class="fas fa-search"></i> Cari studio</a>
      </div>`; return;
    }

    const active=orders.filter(o=>o.status!=='Dibatalkan');
    const totalSpent=active.reduce((s,o)=>s+(o.total_paid||0),0);
    const banner=`<div class="ok-banner"><i class="fas fa-check-circle"></i>Data pesanan berhasil dimuat dari Database.</div>`;

    content.innerHTML=`
      ${banner}
      <div class="orders-summary">
        <div class="summary-card"><i class="fas fa-receipt"></i><div><b>${orders.length}</b><span>Total pesanan</span></div></div>
        <div class="summary-card"><i class="fas fa-check-circle"></i><div><b>${active.length}</b><span>Pesanan aktif</span></div></div>
        <div class="summary-card"><i class="fas fa-wallet"></i><div><b>${rp(totalSpent)}</b><span>Total pengeluaran</span></div></div>
      </div>
      <div class="orders-list">${orders.map((o,i)=>renderOrder(o,i)).join('')}</div>`;

    $$('.order-card').forEach(card=>{
      const dbId=card.dataset.id;
      const dl=card.querySelector('[data-act="dl"]'), cancel=card.querySelector('[data-act="cancel"]'), review=card.querySelector('[data-act="review"]');
      
      if(dl) dl.onclick=()=>{ card.classList.add('print-area'); window.print(); card.classList.remove('print-area'); };

      if(review) review.onclick=()=>{
        const studioName = card.querySelector('.order-studio').textContent;
        let selectedRating = 5;
        const rvModal = document.createElement('div');
        rvModal.className = 'custom-modal show';
        rvModal.innerHTML = `
          <div class="modal-backdrop" id="rvBackdrop"></div>
          <div class="modal-dialog">
            <div class="modal-icon" style="background:var(--sky); color:var(--blue);"><i class="fas fa-star"></i></div>
            <h3 class="modal-title">Beri Ulasan</h3>
            <p class="modal-msg">Bagaimana pengalamanmu di <b>${studioName}</b>?</p>
            <div class="star-rating" id="starRate">
              <i class="fas fa-star active" data-val="1"></i>
              <i class="fas fa-star active" data-val="2"></i>
              <i class="fas fa-star active" data-val="3"></i>
              <i class="fas fa-star active" data-val="4"></i>
              <i class="fas fa-star active" data-val="5"></i>
            </div>
            <textarea id="rvComment" class="input-review" placeholder="Tulis komentar (opsional)..." rows="3"></textarea>
            <div class="modal-actions">
              <button class="btn ghost" id="rvCancel">Batal</button>
              <button class="btn" id="rvSubmit" style="background:var(--ok);">Kirim Ulasan</button>
            </div>
          </div>`;
        document.body.appendChild(rvModal);

        $$('#starRate i').forEach(star=>{
          star.onclick = () => {
            selectedRating = parseInt(star.dataset.val);
            $$('#starRate i').forEach(s => { s.classList.toggle('active', parseInt(s.dataset.val) <= selectedRating); });
          };
        });

        $('#rvCancel').onclick = () => rvModal.remove();
        $('#rvBackdrop').onclick = () => rvModal.remove();
        $('#rvSubmit').onclick = async () => {
          const comment = $('#rvComment').value.trim();
          $('#rvSubmit').textContent = 'Mengirim...'; $('#rvSubmit').disabled = true;
          const safeName = currentUser.name || currentUser.email || 'User';
          const { error } = await db.from('reviews').insert([{ studio_name: studioName, user_name: safeName, rating: selectedRating, comment: comment }]);
          if(error) { alert('Gagal kirim ulasan: ' + error.message); $('#rvSubmit').textContent = 'Kirim Ulasan'; $('#rvSubmit').disabled = false; }
          else { toast('Ulasan berhasil dikirim!'); rvModal.remove(); }
        };
      };

      if(cancel) cancel.onclick=()=>{
        const m = $('#confirmModal'); if(!m) return; m.classList.add('show');
        const btnYes = $('#confirmYes'), btnNo = $('#confirmNo'), backdrop = $('#confirmBackdrop');
        const newBtnYes = btnYes.cloneNode(true), newBtnNo = btnNo.cloneNode(true), newBackdrop = backdrop.cloneNode(true);
        btnYes.replaceWith(newBtnYes); btnNo.replaceWith(newBtnNo); backdrop.replaceWith(newBackdrop);
        const closeModal = () => m.classList.remove('show');
        newBtnNo.onclick = closeModal; newBackdrop.onclick = closeModal;
        
        newBtnYes.onclick = async () => {
          closeModal(); cancel.classList.add('loading'); cancel.innerHTML='<i class="fas fa-circle-notch"></i> Membatalkan…'; cancel.disabled=true; card.classList.add('cancelling');
          const { data, error } = await db.from('orders').update({ status: 'Dibatalkan' }).eq('id', dbId).select();
          if (error) { alert("Gagal: " + error.message); cancel.classList.remove('loading'); cancel.innerHTML='<i class="fas fa-times"></i> Batalkan pesanan'; cancel.disabled=false; card.classList.remove('cancelling'); }
          else if (data.length === 0) { alert("Gagal: Sesi login habis. Silakan LOGOUT lalu LOGIN ulang."); cancel.classList.remove('loading'); cancel.innerHTML='<i class="fas fa-times"></i> Batalkan pesanan'; cancel.disabled=false; card.classList.remove('cancelling'); }
          else { toast('Pesanan dibatalkan'); renderPesanan(); }
        };
      };
    });
  };
  renderPesanan();
}

/* ==========================================================================
   13. HALAMAN BANTUAN
   ========================================================================== */
if(page==='bantuan'){
  $$('.faq-q').forEach(b=>b.onclick=()=>{
    const f=b.closest('.faq'), open=f.classList.contains('open');
    $$('.faq').forEach(x=>x.classList.remove('open')); if(!open)f.classList.add('open');
  });
}

/* ==========================================================================
   14. LOGIKA DASHBOARD ADMIN (FIX CHAT & TABEL)
   ========================================================================== */
if(page==='admin'){
  const ADMIN_EMAIL = 'kurtubi881@gmail.com'; 
  if(!user || user.email !== ADMIN_EMAIL) { alert("Akses Ditolak! Anda bukan Admin."); location.replace('index.html'); } 
  else {
    let currentOrderCode = null;
    let allOrders = [];

    const loadAdminData = async () => {
      $('#adminTable').innerHTML = `<div class="skeleton" style="height:300px; border-radius:12px;"></div>`;
      const { data: orders, error } = await db.from('orders').select('*').order('created_at', { ascending: false });
      
      if(error) { alert("Gagal load: " + error.message); return; }
      allOrders = orders;

      const totalRevenue = orders.filter(o => o.status === 'Lunas').reduce((sum, o) => sum + o.total_paid, 0);
      const totalActive = orders.filter(o => o.status === 'Lunas').length;

      $('#adminStats').innerHTML = `
        <div class="summary-card"><i class="fas fa-money-bill-wave"></i><div><b>${rp(totalRevenue)}</b><span>Total Pendapatan</span></div></div>
        <div class="summary-card"><i class="fas fa-shopping-cart"></i><div><b>${orders.length}</b><span>Total Pesanan</span></div></div>
        <div class="summary-card"><i class="fas fa-clock"></i><div><b>${totalActive}</b><span>Pesanan Aktif</span></div></div>
      `;

      let html = `<table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left; min-width: 700px;">
        <thead>
          <tr style="border-bottom:2px solid var(--line); color:var(--navy);">
            <th style="padding:12px 10px; white-space:nowrap;">Kode</th>
            <th style="padding:12px 10px; white-space:nowrap;">Studio</th>
            <th style="padding:12px 10px; white-space:nowrap;">Pemesan</th>
            <th style="padding:12px 10px; white-space:nowrap;">Total</th>
            <th style="padding:12px 10px; white-space:nowrap;">Status</th>
            <th style="padding:12px 10px; white-space:nowrap;">Aksi</th>
          </tr>
        </thead>
        <tbody>`;

      orders.forEach(o => {
        const isLunas = o.status === 'Lunas';
        const isBatal = o.status === 'Dibatalkan';
        const statusColor = isLunas ? 'var(--ok)' : (isBatal ? 'var(--bad)' : 'var(--blue)');
        html += `<tr style="border-bottom:1px solid var(--line);">
          <td style="padding:12px 10px; font-weight:bold; color:var(--blue); white-space:nowrap;">${o.order_code}</td>
          <td style="padding:12px 10px; white-space:nowrap;">${o.studio_name}</td>
          <td style="padding:12px 10px; white-space:nowrap;">${o.customer_name}</td>
          <td style="padding:12px 10px; font-weight:bold; white-space:nowrap;">${rp(o.total_paid)}</td>
          <td style="padding:12px 10px; color:${statusColor}; font-weight:bold; white-space:nowrap;">${o.status}</td>
          <td style="padding:12px 10px; display:flex; gap:6px; white-space:nowrap;">
            <button class="btn ghost" style="padding:4px 8px; font-size:11px;" onclick="pilihChat('${o.order_code}', '${o.customer_name}')"><i class="fas fa-comment"></i> Chat</button>
            ${isLunas ? `<button class="btn ghost" style="padding:4px 8px; font-size:11px; color:var(--ok); border-color:var(--ok);" onclick="selesaikanPesanan('${o.id}')">Selesai</button>` : ''}
          </td>
        </tr>`;
      });
      html += `</tbody></table>`;
      $('#adminTable').innerHTML = html;

      const uniqueOrders = [];
      const map = new Set();
      orders.forEach(o => { if(!map.has(o.order_code)) { map.add(o.order_code); uniqueOrders.push(o); } });
      $('#adminChatSelect').innerHTML = uniqueOrders.map(o => `<option value="${o.order_code}">${o.customer_name} - ${o.order_code}</option>`).join('');
    };

    window.selesaikanPesanan = async (id) => {
      if(!confirm("Tandai pesanan ini sudah selesai?")) return;
      const { error } = await db.from('orders').update({ status: 'Selesai' }).eq('id', id);
      if(error) alert("Gagal update: " + error.message);
      else { toast('Pesanan diselesaikan!'); loadAdminData(); }
    };

    window.pilihChat = (orderCode, customerName) => {
      currentOrderCode = orderCode;
      $('#adminChatSelect').value = orderCode;
      $('#adminChatInputArea').style.display = 'block';
      loadAdminMessages();
      $('#adminChatMessages').scrollTop = 9999;
    };

    const loadAdminMessages = async () => {
      if(!currentOrderCode) return;
      const { data: chats } = await db.from('chats').select('*').eq('order_code', currentOrderCode).order('created_at', { ascending: true });
      const container = $('#adminChatMessages');
      
      if(!chats || !chats.length) { 
        container.innerHTML = `<div style="text-align:center; color:var(--mute); margin-top:50px; font-size:14px;">Belum ada obrolan.</div>`; 
        return; 
      }
      
      // FIX: Pakai class .chat-msg dari CSS biar ga tabrakan warnanya di dark mode
      container.innerHTML = chats.map(c => {
        const isAdmin = c.sender === 'admin';
        return `
          <div class="chat-msg ${isAdmin ? 'user' : 'admin'}" style="max-width:80%;">
            ${c.message}
            <span class="chat-time">${new Date(c.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        `;
      }).join('');
      container.scrollTop = container.scrollHeight;
    };

    $('#adminChatSelect').onchange = (e) => {
      currentOrderCode = e.target.value;
      loadAdminMessages();
    };

    $('#adminChatForm').onsubmit = async (e) => {
      e.preventDefault();
      const input = $('#adminChatInput');
      const text = input.value.trim();
      if(!text || !currentOrderCode) return;
      input.value = '';
      await db.from('chats').insert([{ order_code: currentOrderCode, sender: 'admin', message: text }]);
      loadAdminMessages();
    };

    loadAdminData();
    setInterval(() => { if(currentOrderCode) loadAdminMessages(); }, 3000);
  }
}

/* ==========================================================================
   15. LOGIKA CHAT UNTUK USER (CUSTOMER)
   ========================================================================== */
if(page !== 'admin'){
  const initUserChat = async () => {
    const currentUser = getUser(); 
    if (!currentUser || !currentUser.id) return;

    const { data: activeOrders } = await db.from('orders').select('*').eq('user_id', currentUser.id).neq('status', 'Dibatalkan');
    if (!activeOrders || !activeOrders.length) return;

    if (!document.getElementById('chatWidget')) {
      const chatHTML = `
        <div id="chatWidget" class="chat-widget">
          <button class="chat-btn" id="chatToggle"><i class="fas fa-comment-dots"></i><span class="chat-badge" id="chatBadge">1</span></button>
          <div class="chat-box" id="chatBox">
            <div class="chat-header">
              <div class="chat-admin-info"><div class="chat-avatar"><i class="fas fa-headset"></i><span class="online-dot"></span></div><div><h4>Admin StudioGo</h4><p>Online • Balas cepat</p></div></div>
              <button class="chat-close" id="chatClose"><i class="fas fa-times"></i></button>
            </div>
            <div class="chat-context"><i class="fas fa-receipt"></i> Topik: <select id="chatOrderSelect" class="chat-order-select">${activeOrders.map(o => `<option value="${o.order_code}">${o.studio_name} (${o.order_code})</option>`).join('')}</select></div>
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input-area">
              <input type="text" id="chatInput" placeholder="Tulis pesan..." autocomplete="off">
              <button id="chatSend"><i class="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', chatHTML);

      const chatMessages = $('#chatMessages'), chatOrderSelect = $('#chatOrderSelect'), chatInput = $('#chatInput');

      const loadUserMessages = async () => {
        const orderCode = chatOrderSelect.value;
        const { data: chats } = await db.from('chats').select('*').eq('order_code', orderCode).order('created_at', { ascending: true });
        
        if(!chats || !chats.length) {
          chatMessages.innerHTML = `<div class="chat-msg admin">Halo! Ada yang bisa dibantu soal pesanan ini?</div>`;
        } else {
          chatMessages.innerHTML = chats.map(msg => {
            const isUser = msg.sender === 'user';
            return `<div class="chat-msg ${isUser?'user':'admin'}">${msg.message}<span class="chat-time">${new Date(msg.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span></div>`;
          }).join('');
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
      };

      chatOrderSelect.onchange = loadUserMessages;
      loadUserMessages();

      $('#chatToggle').onclick = () => { $('#chatBox').classList.add('open'); $('#chatToggle').classList.add('hidden'); setTimeout(() => chatInput.focus(), 300); };
      $('#chatClose').onclick = () => { $('#chatBox').classList.remove('open'); $('#chatToggle').classList.remove('hidden'); };

      const sendUserMessage = async () => {
        const text = chatInput.value.trim(); if (!text) return;
        chatInput.value = '';
        const orderCode = chatOrderSelect.value;
        await db.from('chats').insert([{ order_code: orderCode, sender: 'user', message: text }]);
        loadUserMessages();
      };
      
      $('#chatSend').onclick = sendUserMessage; 
      chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendUserMessage(); };

      setInterval(() => { if($('#chatBox').classList.contains('open')) loadUserMessages(); }, 3000);
    }
  };
  initUserChat();
}

observeReveal();