(function () {
  if (window !== window.top) return; // Don't run inside iframes
  if (window.SB_SURVEY_EMBED) return;
  window.SB_SURVEY_EMBED = {
    SURVEY_URL: 'https://jdonline.staffbase.com/content/form/6a0366d20abf535a160edfab',
    init: function () {
      SB_SURVEY_EMBED.injectStyles();
      SB_SURVEY_EMBED.createTab();
      SB_SURVEY_EMBED.createModal();
      SB_SURVEY_EMBED.watchForModals();
    },
    injectStyles: function () {
      var style = document.createElement('style');
      style.textContent = `
        #sb-survey-tab {
          position: fixed;
          bottom: 120px;
          right: 0;
          background: #006400;
          color: white;
          padding: 10px 14px;
          cursor: pointer;
          font-family: sans-serif;
          font-size: 14px;
          border-radius: 4px 0 0 4px;
          z-index: 9999;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
        #sb-survey-overlay {
          display: none;
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 10000;
          justify-content: center;
          align-items: center;
        }
        #sb-survey-overlay.open {
          display: flex;
        }
        #sb-survey-modal {
          background: white;
          width: 700px;
          max-width: 95vw;
          height: 80vh;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        #sb-survey-close {
          position: absolute;
          top: 10px;
          right: 14px;
          font-size: 22px;
          cursor: pointer;
          z-index: 2;
          color: #333;
          background: none;
          border: none;
        }
        #sb-survey-iframe-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        #sb-survey-iframe {
          position: absolute;
          top: -145px;
          left: 0;
          width: 100%;
          height: calc(100% + 145px);
          border: none;
        }
      `;
      document.head.appendChild(style);
    },
    createTab: function () {
      var tab = document.createElement('div');
      tab.id = 'sb-survey-tab';
      tab.textContent = 'Give Us Feedback';
      tab.addEventListener('click', SB_SURVEY_EMBED.openModal);
      document.body.appendChild(tab);
    },
    createModal: function () {
      var overlay = document.createElement('div');
      overlay.id = 'sb-survey-overlay';

      var modal = document.createElement('div');
      modal.id = 'sb-survey-modal';

      var closeBtn = document.createElement('button');
      closeBtn.id = 'sb-survey-close';
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', SB_SURVEY_EMBED.closeModal);

      var iframe = document.createElement('iframe');
      iframe.id = 'sb-survey-iframe';
      iframe.src = SB_SURVEY_EMBED.SURVEY_URL;
      iframe.addEventListener('load', function () {
        try {
          var doc = iframe.contentDocument;
          if (doc && doc.head) {
            var s = doc.createElement('style');
            s.textContent = 'body, .page, .page.iframe { background: white !important; }';
            doc.head.appendChild(s);
          }
        } catch (e) {
          // Cross-origin guard — shouldn't happen here since same-origin
        }
      });

      var iframeWrapper = document.createElement('div');
      iframeWrapper.id = 'sb-survey-iframe-wrapper';
      iframeWrapper.appendChild(iframe);

      modal.appendChild(closeBtn);
      modal.appendChild(iframeWrapper);
      overlay.appendChild(modal);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) SB_SURVEY_EMBED.closeModal();
      });

      document.body.appendChild(overlay);
    },
    openModal: function () {
      document.getElementById('sb-survey-overlay').classList.add('open');
      document.getElementById('sb-survey-tab').style.display = 'none';
    },
    closeModal: function () {
      document.getElementById('sb-survey-overlay').classList.remove('open');
      document.getElementById('sb-survey-tab').style.display = '';
    },
    watchForModals: function () {
      var tab = document.getElementById('sb-survey-tab');

      function hasHostModal() {
        // ARIA semantics (standard)
        if (document.querySelector(
          '[role="dialog"]:not(#sb-survey-overlay):not(#sb-survey-modal),' +
          '[aria-modal="true"]:not(#sb-survey-overlay):not(#sb-survey-modal)'
        )) return true;
        // Body/html scroll-lock (many modal libraries set this)
        var bodyStyle = window.getComputedStyle(document.body);
        if (bodyStyle.overflow === 'hidden' || bodyStyle.overflowY === 'hidden') return true;
        return false;
      }

      function updateTabVisibility() {
        // Our own modal handles its own tab visibility via openModal/closeModal
        var ourModalOpen = document.getElementById('sb-survey-overlay').classList.contains('open');
        if (ourModalOpen) return;
        tab.style.display = hasHostModal() ? 'none' : '';
      }

      var observer = new MutationObserver(updateTabVisibility);
      // Watch for DOM additions and attribute changes on body/html
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['role', 'aria-modal', 'class', 'style'],
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    },
  };
  if (document.readyState === 'complete') {
    window.SB_SURVEY_EMBED.init();
  } else {
    window.addEventListener('load', window.SB_SURVEY_EMBED.init);
  }
})();
