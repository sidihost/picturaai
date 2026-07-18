import { NextResponse } from 'next/server'

const WIDGET_SCRIPT = `(function(){
  function base64Encode(obj){
    try { return btoa(JSON.stringify(obj)); } catch(e){ return ''; }
  }

  function render(el){
    var sitekey = el.getAttribute('data-sitekey') || 'demo';
    var callbackName = el.getAttribute('data-callback');
    var compact = el.getAttribute('data-size') === 'compact';

    el.innerHTML = '';
    el.style.display = 'inline-block';

    var wrapper = document.createElement('div');
    wrapper.style.border = '1px solid #e5e5e5';
    wrapper.style.borderRadius = '10px';
    wrapper.style.padding = compact ? '8px 10px' : '10px 12px';
    wrapper.style.background = '#fff';
    wrapper.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    wrapper.style.minWidth = compact ? '200px' : '260px';

    var row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'space-between';
    row.style.gap = '10px';

    var left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '8px';

    var checkbox = document.createElement('button');
    checkbox.type = 'button';
    checkbox.setAttribute('aria-label', 'Verify captcha');
    checkbox.style.width = '22px';
    checkbox.style.height = '22px';
    checkbox.style.border = '1px solid #c9c9c9';
    checkbox.style.borderRadius = '6px';
    checkbox.style.background = '#fff';
    checkbox.style.cursor = 'pointer';

    var label = document.createElement('span');
    label.textContent = 'I am human';
    label.style.fontSize = '13px';
    label.style.color = '#111';

    var badge = document.createElement('span');
    badge.textContent = 'Pictura CAPTCHA';
    badge.style.fontSize = '11px';
    badge.style.color = '#666';

    var status = document.createElement('div');
    status.style.fontSize = '11px';
    status.style.color = '#666';
    status.textContent = 'Not verified';

    left.appendChild(checkbox);
    left.appendChild(label);
    row.appendChild(left);
    row.appendChild(badge);

    wrapper.appendChild(row);
    wrapper.appendChild(status);

    var hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'captchaToken';

    function setToken(token){
      hidden.value = token;
      if (!hidden.parentElement) {
        var form = el.closest('form');
        if (form) form.appendChild(hidden);
      }

      if (callbackName && typeof window[callbackName] === 'function') {
        try { window[callbackName](token); } catch(e) {}
      }

      var evt = new CustomEvent('pictura-captcha-verified', { detail: { token: token } });
      el.dispatchEvent(evt);
    }

    checkbox.addEventListener('click', function(){
      checkbox.disabled = true;
      status.textContent = 'Verifying...';

      setTimeout(function(){
        var token = base64Encode({
          t: Date.now(),
          s: sitekey,
          v: true,
          i: 20,
          steps: 2,
          r: 'verified'
        });

        checkbox.textContent = '✓';
        checkbox.style.background = '#16a34a';
        checkbox.style.color = '#fff';
        checkbox.style.borderColor = '#16a34a';
        status.textContent = 'Verified';
        status.style.color = '#16a34a';

        setToken(token);
      }, 500);
    });

    el.appendChild(wrapper);
  }

  function init(){
    var targets = document.querySelectorAll('#pictura-captcha, .pictura-captcha');
    for (var i = 0; i < targets.length; i++) render(targets[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PicturaCaptcha = { render: render, init: init };
})();`

export async function GET() {
  return new NextResponse(WIDGET_SCRIPT, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'Content-Type',
    },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'Content-Type',
    },
  })
}
