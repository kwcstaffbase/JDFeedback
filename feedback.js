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
        #sb-survey-modal-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          width: 640px;
          max-width: 95vw;
        }
        #sb-survey-modal {
          background: white;
          width: 100%;
          height: 80vh;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        #sb-survey-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          color: #333;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          border: none;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        #sb-survey-iframe-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        #sb-survey-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
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

      var wrapper = document.createElement('div');
      wrapper.id = 'sb-survey-modal-wrapper';

      var closeBtn = document.createElement('button');
      closeBtn.id = 'sb-survey-close';
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', SB_SURVEY_EMBED.closeModal);

      var modal = document.createElement('div');
      modal.id = 'sb-survey-modal';

      var iframe = document.createElement('iframe');
      iframe.id = 'sb-survey-iframe';
      iframe.src = SB_SURVEY_EMBED.SURVEY_URL;
      iframe.addEventListener('load', function () {
        SB_SURVEY_EMBED.cleanIframeDoc(iframe.contentDocument);
      });

      var iframeWrapper = document.createElement('div');
      iframeWrapper.id = 'sb-survey-iframe-wrapper';
      iframeWrapper.appendChild(iframe);

      modal.appendChild(iframeWrapper);
      wrapper.appendChild(closeBtn);   // close button sits above the modal
      wrapper.appendChild(modal);
      overlay.appendChild(wrapper);

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
    cleanIframeDoc: function (doc) {
      if (!doc) return;
      try {
        // CSS for layout fixes that don't need JS enforcement
        var s = doc.createElement('style');
        s.textContent = `
          html, body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .page, .page.iframe,
          .page-content, .scroller, #content,
          .container-fluid, .app-container,
          [class*="plugin-container"],
          .sb-user-view, form {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          *::-webkit-scrollbar { display: none !important; }
          * { scrollbar-width: none !important; }
        `;
        doc.head.appendChild(s);

        // Elements to hide — use JS so we win the race against SPA re-renders
        var HIDE = [
          '#header', '.app-header', '.wow-app-header',
          '.contextual-toolbar-container', '.contextual-action-toolbar',
          '#skip-link-container', 'nav',
        ];

        function applyHide() {
          HIDE.forEach(function (sel) {
            doc.querySelectorAll(sel).forEach(function (el) {
              el.style.setProperty('display', 'none', 'important');
            });
          });
          var wrapper = doc.querySelector('#wrapper');
          if (wrapper) wrapper.style.setProperty('padding-top', '0', 'important');
        }

        applyHide();

        // Re-run whenever the SPA mutates the DOM
        var mo = new MutationObserver(applyHide);
        mo.observe(doc.documentElement, {
          childList: true, subtree: true,
          attributes: true, attributeFilter: ['style', 'class'],
        });

        // Recurse into nested iframes
        doc.querySelectorAll('iframe').forEach(function (f) {
          if (f.contentDocument && f.contentDocument.head) {
            SB_SURVEY_EMBED.cleanIframeDoc(f.contentDocument);
          } else {
            f.addEventListener('load', function () {
              try { SB_SURVEY_EMBED.cleanIframeDoc(f.contentDocument); } catch (e) {}
            });
          }
        });
      } catch (e) {}
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
