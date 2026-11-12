/* ===== АНАЛИТИКА: впишите номера счётчиков, остальное настроено =====
   YM_ID — номер счётчика Яндекс Метрики (metrika.yandex.ru → Добавить счётчик), например 98765432
   GA_ID — идентификатор Google Analytics 4 (analytics.google.com), например G-XXXXXXXXXX
   GTM_ID — контейнер Google Tag Manager. Цели ниже также уходят в dataLayer как event —
   в GTM их можно ловить триггером «Пользовательское событие» (например, lead_submit).
   Цели (создайте в Метрике как «JavaScript-событие» с этими идентификаторами):
   quiz_start, quiz_step2, quiz_step3, lead_submit, whatsapp_click, phone_click */
var YM_ID = '';
var GA_ID = '';
var GTM_ID = 'GTM-WJ98DH6H';
(function(){
  if(YM_ID){
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
    ym(YM_ID,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
  }
  window.dataLayer=window.dataLayer||[];
  if(GTM_ID){
    dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var g=document.createElement('script');g.async=1;g.src='https://www.googletagmanager.com/gtm.js?id='+GTM_ID;document.head.appendChild(g);
  }
  if(GA_ID){
    var s=document.createElement('script');s.async=1;s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',GA_ID);
  }
  window.goal=function(name,params){
    try{if(YM_ID&&window.ym)ym(YM_ID,'reachGoal',name,params||{})}catch(e){}
    try{if(GA_ID&&window.gtag)gtag('event',name,params||{})}catch(e){}
    try{var ev={event:name};for(var k in params||{})ev[k]=params[k];dataLayer.push(ev)}catch(e){}
  };
  // Запоминаем источник рекламы (utm, yclid, gclid), чтобы он попал в заявку
  try{
    var p=new URLSearchParams(location.search),keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','yclid','gclid'],has=false,o={};
    keys.forEach(function(k){if(p.get(k)){o[k]=p.get(k);has=true}});
    if(has){o.referrer=document.referrer;sessionStorage.setItem('ss_src',JSON.stringify(o))}
    else if(!sessionStorage.getItem('ss_src')){sessionStorage.setItem('ss_src',JSON.stringify({referrer:document.referrer}))}
  }catch(e){}
})();
