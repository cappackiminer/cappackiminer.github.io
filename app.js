(() => {
  'use strict';
  const dictionaries=window.CAPPA_TEXT, apps=window.CAPPA_APPS;
  const release='https://github.com/cappackiminer/CappAckiMiner/releases/download/downloads-2026-10-18/';
  const releasePage='https://github.com/cappackiminer/CappAckiMiner/releases/tag/downloads-2026-10-18';
  const licensePdfs={tr:'CAPPA-Lisans-Rehberi-Turkce.pdf',en:'CAPPA-License-Guide-English.pdf',ru:'CAPPA-License-Guide-Russian.pdf',ar:'CAPPA-License-Guide-Arabic.pdf',zh:'CAPPA-License-Guide-Chinese.pdf',id:'CAPPA-License-Guide-Indonesian.pdf'};
  const select=document.getElementById('language-select'),search=document.getElementById('search');
  const cards=[...document.querySelectorAll('.app-card')],filters=[...document.querySelectorAll('.filter')];
  const dialog=document.getElementById('lightbox'),body=document.getElementById('dialog-body');
  let lang='tr',platform='all',opener=null,modal=null;
  try{lang=localStorage.getItem('cappa-hub-language')||'tr';}catch{}
  if(!Object.hasOwn(dictionaries,lang))lang='tr';
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const w=()=>dictionaries[lang];
  const licenseHelpUrl=()=>`./help/license/#${lang}`;
  function updateLicenseHelp(){
    document.querySelectorAll('[data-license-help]').forEach(link=>link.href=licenseHelpUrl());
    document.querySelectorAll('[data-license-pdf]').forEach(link=>link.href='./help/license/'+licensePdfs[lang]);
  }
  function filterCards(){
    const term=search.value.trim().toLocaleLowerCase(lang);let shown=0;
    for(const card of cards){const yes=(platform==='all'||card.dataset.platform===platform)&&(!term||(card.textContent+' '+card.dataset.search).toLocaleLowerCase(lang).includes(term));card.hidden=!yes;if(yes)shown++;}
    document.getElementById('empty').hidden=shown>0;
  }
  function translate(){
    document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';select.value=lang;select.setAttribute('aria-label',w().language);
    document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=w()[el.dataset.i18n]||'');
    // Only the six local, author-controlled heading strings contain markup.
    document.querySelectorAll('[data-i18n-html]').forEach(el=>el.innerHTML=w()[el.dataset.i18nHtml]||'');
    search.placeholder=w().search;search.setAttribute('aria-label',w().search);
    document.getElementById('price-image').alt=w().priceAlt;
    document.querySelector('.preview-button').setAttribute('aria-label',w().gallery);
    document.querySelector('.preview-button img').alt=w().demo;
    document.querySelector('.poster-preview').setAttribute('aria-label',w().priceOpen);
    document.querySelector('.close-dialog').setAttribute('aria-label',w().close);
    document.title='CAPPA Eagle v'+(window.CAPPA_APPS.find(app=>app.id==='miner')?.version ?? '1.1.3');
    document.querySelector('meta[name=description]').content=w().heroCopy;
    if(dialog.open&&modal)renderModal(modal);updateLicenseHelp();filterCards();
  }
  function renderModal(target){
    const s=w();dialog.dataset.kind=target.kind;
    if(target.kind==='price'){
      document.getElementById('dialog-title').textContent=s.priceTitle;
      body.innerHTML=`<img class="poster-full" src="./license-price-list.jpg" alt="${escape(s.priceAlt)}" width="853" height="1280"><p class="dialog-caption">${escape(s.posterTerms)}</p><a class="quiet-link" href="./license-price-list.jpg" target="_blank" rel="noopener noreferrer">${escape(s.fullImage)} ↗</a>`;
    }else if(target.kind==='preview'){
      document.getElementById('dialog-title').textContent=`${apps[0].name} · v${apps[0].version}`;
      body.innerHTML=`<img class="dialog-image" src="./assets/eagle-preview-v110.png" width="1472" height="210" alt="${escape(s.demo)}"><p class="dialog-caption">${escape(s.demo)}</p><div class="dialog-cta"><a class="button" href="${release+apps[0].file}">${escape(s.setup)} ↗</a><a class="quiet-link" href="${licenseHelpUrl()}">${escape(s.licenseNav)} ↗</a><a class="quiet-link" href="${releasePage}" target="_blank" rel="noopener noreferrer">${escape(s.officialRelease)} ↗</a></div>`;
    }else{
      const app=apps.find(a=>a.id===target.id);if(!app)return;
      document.getElementById('dialog-title').textContent=app.name;
      const downloadLinks=app.file
        ? `<a class="button" href="${release+app.file}">${escape(app.platform==="android"?s.apk:s.setup)} ↗</a>${app.id==='miner'?`<a class="quiet-link" href="${licenseHelpUrl()}">${escape(s.licenseNav)} ↗</a>`:''}<a class="quiet-link" href="${releasePage}" target="_blank" rel="noopener noreferrer">${escape(s.officialRelease)} ↗</a>`
        : `<span class="maintenance-badge">${escape(s.boostMaintenance)}</span><span class="maintenance-notice">${escape(s.boostUnavailable)}</span>`;
      body.innerHTML=`<div class="detail-intro">${app.icon?`<img src="./assets/${escape(app.icon)}" alt="" width="72" height="72">`:''}<p>${escape(s[app.id])}${app.id === 'boost' ? `<strong class="boost-qr-note">${escape(s.boostQr)}</strong>` : ''}</p></div><dl class="detail-specs"><div><dt>${escape(s.version)}</dt><dd>${escape(app.version)}</dd></div><div><dt>${escape(s.platformLabel)}</dt><dd>${escape(app.os)}</dd></div><div><dt>${escape(s.package)}</dt><dd>${app.platform==="android"?"Android APK":"Windows Setup"}</dd></div></dl>${app.id==='miner'?`<img class="dialog-image" src="./assets/eagle-preview-v110.png" width="1472" height="210" alt="${escape(s.demo)}"><p class="dialog-caption">${escape(s.demo)}</p>`:''}<div class="dialog-cta">${downloadLinks}</div>`;
    }
  }
  function openModal(target,button){modal=target;opener=button;renderModal(target);dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;}
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');modal=null;opener?.focus({preventScroll:true});});
  document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
  let backdropPointer=false;
  dialog.addEventListener('pointerdown',event=>{const r=dialog.getBoundingClientRect();backdropPointer=event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;});
  dialog.addEventListener('click',event=>{if(event.target===dialog&&backdropPointer)dialog.close();backdropPointer=false;});
  document.querySelectorAll('[data-price]').forEach(b=>b.addEventListener('click',()=>openModal({kind:'price'},b)));
  document.querySelectorAll('[data-preview]').forEach(b=>b.addEventListener('click',()=>openModal({kind:'preview'},b)));
  document.querySelectorAll('[data-app]').forEach(b=>b.addEventListener('click',()=>openModal({kind:'app',id:b.dataset.app},b)));
  filters.forEach(button=>button.addEventListener('click',()=>{platform=button.dataset.filter;filters.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});filterCards();}));
  search.addEventListener('input',filterCards);
  select.addEventListener('change',()=>{lang=select.value;try{localStorage.setItem('cappa-hub-language',lang);}catch{}translate();});
  translate();
})();
