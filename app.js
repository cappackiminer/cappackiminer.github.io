(() => {
  'use strict';
  const dictionaries=window.CAPPA_TEXT, apps=window.CAPPA_APPS;
  const release='https://github.com/cappackiminer/CappAckiMiner/releases/download/downloads-2026-10-18/';
  const releasePage='https://github.com/cappackiminer/CappAckiMiner/releases/tag/downloads-2026-10-18';
  // 30-day public tariff from the Cloud Mining host's server/price.ts, in cents.
  const cloudPriceMinimumLevel=30;
  const cloudPriceMaximumLevel=72;
  const cloudPriceMinimumNacklCents=37762;
  const cloudPriceLevelStepCents=1918;
  const licensePdfs={tr:'CAPPA-Lisans-Rehberi-Turkce.pdf',en:'CAPPA-License-Guide-English.pdf',ru:'CAPPA-License-Guide-Russian.pdf',ar:'CAPPA-License-Guide-Arabic.pdf',zh:'CAPPA-License-Guide-Chinese.pdf',id:'CAPPA-License-Guide-Indonesian.pdf'};
  const select=document.getElementById('language-select'),search=document.getElementById('search');
  const cards=[...document.querySelectorAll('.app-card')],filters=[...document.querySelectorAll('.filter')];
  const dialog=document.getElementById('lightbox'),body=document.getElementById('dialog-body');
  const cloudPriceButton=document.querySelector('[data-cloud-price]');
  const cloudPriceHash='#cloud-prices';
  let lang='tr',platform='all',opener=null,modal=null;
  try{lang=localStorage.getItem('cappa-hub-language')||'tr';}catch{}
  if(!Object.hasOwn(dictionaries,lang))lang='tr';
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const w=()=>dictionaries[lang];
  const pricePoster=()=>lang==='tr'?'./assets/eagle-license-prices-tr.png?v=flash-20261126':'./assets/eagle-license-prices-en.png?v=flash-20261126';
  const licenseHelpUrl=()=>`./help/license/#${lang}`;
  function updateLicenseHelp(){
    document.querySelectorAll('[data-license-help]').forEach(link=>link.href=licenseHelpUrl());
    document.querySelectorAll('[data-license-pdf]').forEach(link=>link.href='./help/license/'+licensePdfs[lang]+'?v=flash-1203');
  }
  function updateCloudCheckout(){
    const section=document.getElementById('cloud-mining');
    let origin;
    try{
      const configured=new URL(section.dataset.cloudOrigin);
      if(configured.protocol==='https:'&&!configured.username&&!configured.password&&
        configured.pathname==='/'&&!configured.search&&!configured.hash) origin=configured.origin;
    }catch{}
    section.hidden=!origin;
    document.querySelector('[data-cloud-nav]').hidden=!origin;
    if(!origin)return;
    section.querySelectorAll('[data-cloud-checkout]').forEach(link=>{
      const url=new URL('/',origin);
      url.searchParams.set('lang',lang);
      if(link.dataset.cloudCheckout==='tracking')url.hash='takip';
      link.href=url.href;
    });
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
    const priceImage=document.getElementById('price-image');
    priceImage.setAttribute('src',pricePoster());
    priceImage.alt=w().priceAlt;
    document.querySelector('.preview-button').setAttribute('aria-label',w().gallery);
    document.querySelector('.preview-button img').alt=w().demo;
    document.querySelector('.poster-preview').setAttribute('aria-label',w().priceOpen);
    document.querySelector('.close-dialog').setAttribute('aria-label',w().close);
    const windowsMiner=apps.find(app=>app.id==='miner');
    if(windowsMiner)document.title=windowsMiner.name+' v'+windowsMiner.version;
    document.querySelector('meta[name=description]').content=w().heroCopy;
    if(dialog.open&&modal)renderModal(modal);updateLicenseHelp();updateCloudCheckout();filterCards();
  }
  function renderCloudPrice(labels){
    const numbers=new Intl.NumberFormat(lang);
    const prices=new Intl.NumberFormat(lang,{minimumFractionDigits:2,maximumFractionDigits:2});
    const levels=Array.from({length:cloudPriceMaximumLevel-cloudPriceMinimumLevel+1},(_,index)=>cloudPriceMinimumLevel+index);
    const split=Math.ceil(levels.length/2);
    const tables=[levels.slice(0,split),levels.slice(split)].map(group=>{
      const rows=group.map(level=>{
        const nacklCents=cloudPriceMinimumNacklCents+(level-cloudPriceMinimumLevel)*cloudPriceLevelStepCents;
        const shellCents=Math.round(nacklCents/10);
        return `<tr><th scope="row"><bdi>${numbers.format(level)}</bdi></th><td><bdi>${prices.format(nacklCents/100)}</bdi></td><td><bdi>${prices.format(shellCents/100)}</bdi></td></tr>`;
      }).join('');
      return `<table class="cloud-price-table" aria-label="${escape(labels.cloudPricePeriod)}"><thead><tr><th scope="col">${escape(labels.cloudPriceLevel)}</th><th scope="col">NACKL</th><th scope="col">SHELL</th></tr></thead><tbody>${rows}</tbody></table>`;
    }).join('');
    return `<div class="cloud-price-poster">
      <div class="cloud-price-masthead"><img src="./cappa-logo.png" alt="" width="84" height="84"><div><p>CAPPA Cloud Mining</p><h3>${escape(labels.cloudPricePeriod)}</h3></div></div>
      <div class="cloud-price-notes"><p>${escape(labels.cloudPriceFloor)}</p><p>${escape(labels.cloudPriceInvoice)}</p></div>
      <div class="cloud-price-grid">${tables}</div>
    </div>`;
  }
  function renderModal(target){
    const s=w();dialog.dataset.kind=target.kind;
    if(target.kind==='price'){
      document.getElementById('dialog-title').textContent=s.priceTitle;
      const poster=pricePoster();
      body.innerHTML=`<img class="poster-full" src="${poster}" alt="${escape(s.priceAlt)}" width="1024" height="1536"><p class="dialog-caption">${escape(s.posterTerms)}</p><a class="quiet-link" href="${poster}" target="_blank" rel="noopener noreferrer">${escape(s.fullImage)} ↗</a>`;
    }else if(target.kind==='cloud-price'){
      document.getElementById('dialog-title').textContent=s.cloudPriceTitle;
      body.innerHTML=renderCloudPrice(s);
    }else if(target.kind==='preview'){
      document.getElementById('dialog-title').textContent=`${apps[0].name} · v${apps[0].version}`;
      body.innerHTML=`<img class="dialog-image flash-preview-image" src="./assets/flash-preview-v1200.png" width="1280" height="200" alt="${escape(s.demo)}"><p class="dialog-caption">${escape(s.demo)}</p><div class="dialog-cta"><a class="button" href="${release+apps[0].file}">${escape(s.setup)} ↗</a><a class="quiet-link" href="${licenseHelpUrl()}">${escape(s.licenseNav)} ↗</a><a class="quiet-link" href="${releasePage}" target="_blank" rel="noopener noreferrer">${escape(s.officialRelease)} ↗</a></div>`;
    }else{
      const app=apps.find(a=>a.id===target.id);if(!app)return;
      document.getElementById('dialog-title').textContent=app.name;
      const downloadLinks=app.file
        ? `<a class="button" href="${release+app.file}">${escape(app.platform==="android"?s.apk:s.setup)} ↗</a>${app.id==='miner'?`<a class="quiet-link" href="${licenseHelpUrl()}">${escape(s.licenseNav)} ↗</a>`:''}<a class="quiet-link" href="${releasePage}" target="_blank" rel="noopener noreferrer">${escape(s.officialRelease)} ↗</a>`
        : `<span class="maintenance-badge">${escape(s.boostMaintenance)}</span><span class="maintenance-notice">${escape(s.boostUnavailable)}</span>`;
      body.innerHTML=`<div class="detail-intro">${app.icon?`<img src="./assets/${escape(app.icon)}" alt="" width="72" height="72">`:''}<p>${escape(s[app.id])}${app.id === 'boost' ? `<strong class="boost-qr-note">${escape(s.boostQr)}</strong>` : ''}</p></div><dl class="detail-specs"><div><dt>${escape(s.version)}</dt><dd>${escape(app.version)}</dd></div><div><dt>${escape(s.platformLabel)}</dt><dd>${escape(app.os)}</dd></div><div><dt>${escape(s.package)}</dt><dd>${app.platform==="android"?"Android APK":"Windows Setup"}</dd></div></dl>${app.id==='miner'?`<img class="dialog-image flash-preview-image" src="./assets/flash-preview-v1200.png" width="1280" height="200" alt="${escape(s.demo)}"><p class="dialog-caption">${escape(s.demo)}</p>`:''}<div class="dialog-cta">${downloadLinks}</div>`;
    }
  }
  function openModal(target,button){modal=target;opener=button;renderModal(target);dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;}
  dialog.addEventListener('close',()=>{
    if(modal?.kind==='cloud-price'&&location.hash===cloudPriceHash) history.replaceState(history.state,'','#cloud-mining');
    document.body.classList.remove('modal-open');modal=null;opener?.focus({preventScroll:true});
  });
  document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
  let backdropPointer=false;
  dialog.addEventListener('pointerdown',event=>{const r=dialog.getBoundingClientRect();backdropPointer=event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;});
  dialog.addEventListener('click',event=>{if(event.target===dialog&&backdropPointer)dialog.close();backdropPointer=false;});
  document.querySelectorAll('[data-price]').forEach(b=>b.addEventListener('click',()=>openModal({kind:'price'},b)));
  cloudPriceButton.addEventListener('click',()=>openModal({kind:'cloud-price'},cloudPriceButton));
  function openLinkedCloudPrices(){
    if(location.hash===cloudPriceHash&&!dialog.open&&!cloudPriceButton.closest('section').hidden){
      openModal({kind:'cloud-price'},cloudPriceButton);
    }
  }
  window.addEventListener('hashchange',event=>{
    if(new URL(event.oldURL).hash===cloudPriceHash&&location.hash!==cloudPriceHash&&modal?.kind==='cloud-price')dialog.close();
    openLinkedCloudPrices();
  });
  document.querySelectorAll('[data-preview]').forEach(b=>b.addEventListener('click',()=>openModal({kind:'preview'},b)));
  document.querySelectorAll('[data-app]').forEach(b=>b.addEventListener('click',()=>openModal({kind:'app',id:b.dataset.app},b)));
  filters.forEach(button=>button.addEventListener('click',()=>{platform=button.dataset.filter;filters.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});filterCards();}));
  search.addEventListener('input',filterCards);
  select.addEventListener('change',()=>{lang=select.value;try{localStorage.setItem('cappa-hub-language',lang);}catch{}translate();});
  translate();
  openLinkedCloudPrices();
})();
