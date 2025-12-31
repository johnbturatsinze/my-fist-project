// Car Move Solutions — basic interactivity

(function(){
  'use strict'

  // Helpers
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // Smooth scroll for in-page links (account for sticky header)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const href = a.getAttribute('href');
    if(href === '#' || href === '#0') return;
    const target = document.querySelector(href);
    if(target){
      e.preventDefault();
      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 0;
      const rect = target.getBoundingClientRect();
      const offsetTop = window.pageYOffset + rect.top - headerHeight - 12;
      window.scrollTo({ top: Math.max(0, offsetTop), behavior: 'smooth' });
    }
  });

  // Helper: scroll to an anchor accounting for sticky header
  function scrollToTarget(href){
    const target = document.querySelector(href);
    if(!target) return;
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 0;
    const rect = target.getBoundingClientRect();
    const offsetTop = window.pageYOffset + rect.top - headerHeight - 12;
    window.scrollTo({ top: Math.max(0, offsetTop), behavior: 'smooth' });
  }

  // Make header CTA and hero CTA explicitly responsive (show feedback + scroll)
  $$('.hero-cta, .cta').forEach(el => {
    el.addEventListener('click', (ee) => {
      const href = el.getAttribute('href');
      if(href && href.startsWith('#')){
        ee.preventDefault();
        try{ showMessage('Opening booking...', 'info'); }catch(e){}
        scrollToTarget(href);
      }
    });
  });

  // Car card selection and pre-fill booking form
  const carCards = $$('.car-card');
  const vehicleSelect = $('#vehicle');
  carCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // avoid clicks on links or buttons inside cards
      if(e.target.tagName === 'A' || e.target.closest('button')) return;
      // mark selected
      carCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const title = card.querySelector('h4')?.textContent || '';
      const type = title.split('—')[0]?.trim() || title;
      // set vehicle select if option exists
      Array.from(vehicleSelect.options).forEach(opt => {
        if(opt.textContent.toLowerCase().startsWith(type.toLowerCase())){
          opt.selected = true;
        }
      });
      // scroll to booking form
      const booking = $('#booking');
      if(booking){ booking.scrollIntoView({behavior:'smooth', block:'center'}); }
    });

    // image click -> open lightbox
    const img = card.querySelector('img');
    if(img){
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', (ev) => {
        ev.stopPropagation();
        openLightbox(img.getAttribute('src'), card.querySelector('h4')?.textContent);
      });
    }
  });

  // Lightbox implementation
  function openLightbox(src, caption){
    let lb = document.getElementById('lightbox');
    if(!lb){
      lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.innerHTML = `
        <div class="lb-backdrop" role="dialog" aria-modal="true">
          <button class="lb-close" aria-label="Close">×</button>
          <div class="lb-inner">
            <img src="" alt="">
            <p class="lb-caption"></p>
          </div>
        </div>`;
      document.body.appendChild(lb);

      lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
      lb.addEventListener('click', (e) => { if(e.target === lb) closeLightbox(); });
      document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeLightbox(); });
    }
    lb.querySelector('img').src = src;
    lb.querySelector('img').alt = caption || 'Car image';
    lb.querySelector('.lb-caption').textContent = caption || '';
    lb.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    const lb = document.getElementById('lightbox');
    if(lb){ lb.style.display = 'none'; document.body.style.overflow = ''; }
  }

  // Form: Check Availability (mock) and Book
  const checkBtn = document.querySelector('.check-availability');
  const bookingForm = document.getElementById('booking-form');

  function showMessage(text, type = 'info'){
    let msg = document.createElement('div');
    msg.className = 'flash '+type;
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(()=> msg.classList.add('visible'), 20);
    setTimeout(()=>{ msg.classList.remove('visible'); setTimeout(()=> msg.remove(),300); }, 3000);
  }

  if(checkBtn){
    checkBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      // simple validation
      const pickup = $('#pickup').value.trim();
      const start = $('#start').value;
      const end = $('#end').value;
      if(!pickup || !start || !end){
        showMessage('Please fill pickup, start and end dates first', 'error');
        return;
      }
      // simple availability mock
      showMessage('Good news — vehicles available for your dates!', 'success');
    });
  }

  if(bookingForm){
    bookingForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const formData = new FormData(bookingForm);
      // basic check
      if(!formData.get('pickup') || !formData.get('start') || !formData.get('end')){
        showMessage('Please complete the booking details', 'error');
        return;
      }
      // show confirmation
      const vehicle = formData.get('vehicle');
      showMessage(`Thanks — your ${vehicle} booking request is received!`, 'success');
      bookingForm.reset();
      carCards.forEach(c => c.classList.remove('selected'));
    });
  }

  // Flash message styles (injected) for convenience
  const style = document.createElement('style');
  style.textContent = `
    .flash{position:fixed;right:18px;bottom:18px;padding:12px 16px;border-radius:10px;color:#fff;opacity:0;transform:translateY(8px);transition:all .25s ease;z-index:9999}
    .flash.visible{opacity:1;transform:translateY(0)}
    .flash.info{background:#3b82f6}
    .flash.success{background:#16a34a}
    .flash.error{background:#ef4444}
    /* lightbox styles */
    #lightbox{display:none;position:fixed;inset:0;z-index:9998}
    #lightbox .lb-backdrop{display:flex;align-items:center;justify-content:center;height:100%;padding:20px;background:rgba(10,15,25,0.6)}
    #lightbox .lb-inner{max-width:900px;width:100%;background:rgba(255,255,255,0.02);padding:8px;border-radius:10px;display:flex;flex-direction:column;align-items:center}
    #lightbox img{max-width:100%;max-height:75vh;border-radius:8px;display:block}
    #lightbox .lb-caption{color:#fff;margin-top:8px}
    #lightbox .lb-close{position:absolute;top:14px;right:18px;background:transparent;border:none;color:#fff;font-size:28px;cursor:pointer}
  `;
  document.head.appendChild(style);

})();
