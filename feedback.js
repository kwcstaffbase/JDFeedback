(function () {
  if (window.SB_SURVEY_EMBED) return;

  window.SB_SURVEY_EMBED = {

    SURVEY_URL: 'https://jdonline.deere.com/content/surveys/69cae9f2eabe495602806bbe',

    init: function () {
      SB_SURVEY_EMBED.injectStyles();
      SB_SURVEY_EMBED.createTab();
      SB_SURVEY_EMBED.createModal();
    },

    injectStyles: function () {
      var style = document.createElement('style');
      style.textContent = `
        #sb-survey-tab {
          position: fixed;
          bottom: 120px;
          right: 0;
          background: #CC0000;
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
          display: flex;
          flex-direction: column;
        }
        #sb-survey-close {
          position: absolute;
          top: 10px;
          right: 14px;
          font-size: 22px;
          cursor: pointer;
          z-index: 1;
          color: #333;
          background: none;
          border: none;
        }
        #sb-survey-iframe {
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
      tab.textContent = 'Take our Survey';
      tab.addEventListener('click', SB_SURVEY_EMBED.openModal);
      document.body.appendChild(tab);
    },

    createModal: function () {
      // Overlay (the dark background)
      var overlay = document.createElement('div');
      overlay.id = 'sb-survey-overlay';

      // Modal box
      var modal = document.createElement('div');
      modal.id = 'sb-survey-modal';

      // Close button
      var closeBtn = document.createElement('button');
      closeBtn.id = 'sb-survey-close';
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', SB_SURVEY_EMBED.closeModal);

      // The iframe pointing to the survey
      var iframe = document.createElement('iframe');
      iframe.id = 'sb-survey-iframe';
      iframe.src = SB_SURVEY_EMBED.SURVEY_URL;

      modal.appendChild(closeBtn);
      modal.appendChild(iframe);
      overlay.appendChild(modal);

      // Clicking the dark background also closes it
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) SB_SURVEY_EMBED.closeModal();
      });

      document.body.appendChild(overlay);
    },

    openModal: function () {
      document.getElementById('sb-survey-overlay').classList.add('open');
    },

    closeModal: function () {
      document.getElementById('sb-survey-overlay').classList.remove('open');
    },

  };

  // Same load-timing logic as Kampyle
  if (document.readyState === 'complete') {
    window.SB_SURVEY_EMBED.init();
  } else {
    window.addEventListener('load', window.SB_SURVEY_EMBED.init);
  }

})();
