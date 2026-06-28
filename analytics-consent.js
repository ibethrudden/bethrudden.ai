(function() {
  const MEASUREMENT_ID = 'G-FL8JCB0PXZ';
  const CONSENT_KEY = 'br_cookie_consent';

  function getConsent() {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (error) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      return;
    }
  }

  function hasAnalyticsConsent() {
    return getConsent() === 'analytics';
  }

  function loadAnalytics() {
    if (!hasAnalyticsConsent() || window.brAnalyticsLoaded) return;

    window.brAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.brTrack = function(eventName, params) {
    if (!hasAnalyticsConsent()) return;
    loadAnalytics();
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  };

  function trackClicks() {
    document.addEventListener('click', function(event) {
      const link = event.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const url = new URL(href, window.location.href);
      const linkText = (link.innerText || link.getAttribute('aria-label') || '').trim();
      const eventBase = {
        link_text: linkText,
        link_url: link.href,
        page_path: window.location.pathname,
        transport_type: 'beacon'
      };

      if (
        link.classList.contains('hero-cv') ||
        link.classList.contains('hero-cv-secondary') ||
        link.classList.contains('cta-button') ||
        link.classList.contains('outcome-request')
      ) {
        window.brTrack('cta_click', eventBase);
      }

      if (url.protocol === 'mailto:') {
        window.brTrack('mailto_click', eventBase);
        window.brTrack('generate_lead', {
          ...eventBase,
          method: 'email_click'
        });
      }

      if (url.pathname.toLowerCase().endsWith('.pdf')) {
        window.brTrack('file_download', {
          ...eventBase,
          file_name: url.pathname.split('/').pop()
        });
      }

      if (url.hostname && url.hostname !== window.location.hostname) {
        window.brTrack('outbound_click', eventBase);
      }
    });
  }

  function injectBannerStyles() {
    if (document.getElementById('br-consent-style')) return;

    const style = document.createElement('style');
    style.id = 'br-consent-style';
    style.textContent = `
      .br-consent {
        position: fixed;
        left: 1rem;
        right: 1rem;
        bottom: 1rem;
        z-index: 1000;
        max-width: 760px;
        margin: 0 auto;
        background: #fff;
        border: 1px solid #d8dce2;
        border-radius: 8px;
        box-shadow: 0 14px 40px rgba(26, 26, 46, 0.16);
        padding: 1rem;
        color: #1a1a2e;
      }
      .br-consent p {
        margin: 0 0 0.85rem;
        color: #444;
        font-size: 0.82rem;
        line-height: 1.5;
      }
      .br-consent-actions {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        align-items: center;
      }
      .br-consent button,
      .br-consent a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        border-radius: 6px;
        font: inherit;
        font-size: 0.78rem;
        font-weight: 600;
        text-decoration: none;
        padding: 0.55rem 0.9rem;
      }
      .br-consent button {
        cursor: pointer;
      }
      .br-consent-accept {
        border: 1px solid #1a1a2e;
        background: #1a1a2e;
        color: #fff;
      }
      .br-consent-reject {
        border: 1px solid #d8dce2;
        background: #fff;
        color: #1a1a2e;
      }
      .br-consent a {
        color: #444;
        border: 1px solid transparent;
      }
      .br-consent button:focus-visible,
      .br-consent a:focus-visible {
        outline: 3px solid rgba(43, 125, 233, 0.35);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  function showConsentBanner() {
    if (document.getElementById('br-consent')) return;

    injectBannerStyles();

    const banner = document.createElement('section');
    banner.id = 'br-consent';
    banner.className = 'br-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie and analytics choices');
    banner.innerHTML = `
      <p>This site uses optional analytics to understand which pages and calls to action are useful. Choose "Allow analytics" to help improve the site, or "Necessary only" to keep analytics off.</p>
      <div class="br-consent-actions">
        <button class="br-consent-reject" type="button">Necessary only</button>
        <button class="br-consent-accept" type="button">Allow analytics</button>
        <a href="privacy.html">Privacy, cookies, and accessibility</a>
      </div>
    `;

    banner.querySelector('.br-consent-reject').addEventListener('click', function() {
      setConsent('necessary');
      banner.remove();
    });

    banner.querySelector('.br-consent-accept').addEventListener('click', function() {
      setConsent('analytics');
      loadAnalytics();
      banner.remove();
    });

    document.body.appendChild(banner);
  }

  window.brOpenConsentPreferences = function() {
    try {
      window.localStorage.removeItem(CONSENT_KEY);
    } catch (error) {
      return;
    }
    showConsentBanner();
  };

  document.addEventListener('DOMContentLoaded', function() {
    if (hasAnalyticsConsent()) {
      loadAnalytics();
    } else if (!getConsent()) {
      showConsentBanner();
    }

    trackClicks();
  });
})();
