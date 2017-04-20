/* eslint-disable no-new */
/* global Flash */
export default class BlobViewer {
  constructor() {
    this.switcherBtns = document.querySelectorAll('.js-blob-viewer-switcher');
    this.copySourceBtn = document.querySelector('.js-copy-blob-source-btn');
    this.simpleViewer = document.querySelector('.blob-viewer[data-type="simple"]');
    this.richViewer = document.querySelector('.blob-viewer[data-type="rich"]');
    this.$blobContentHolder = $('#blob-content-holder');

    let initialViewerName = document.querySelector('.blob-viewer:not(.hidden)').getAttribute('data-type');

    if (this.switcherBtns.length) {
      this.initBindings();

      if (location.hash.indexOf('#L') === 0) {
        initialViewerName = 'simple';
      }
    }

    this.switchToViewer(initialViewerName);
  }

  initBindings() {
    Array.from(this.switcherBtns)
      .forEach((el) => {
        el.addEventListener('click', this.switchViewHandler.bind(this));
      });

    if (this.copySourceBtn) {
      this.copySourceBtn.addEventListener('click', () => {
        if (this.copySourceBtn.classList.contains('disabled')) return;

        this.switchToViewer('simple');
      });
    }
  }

  switchViewHandler(e) {
    const target = e.currentTarget;

    e.preventDefault();

    this.switchToViewer(target.getAttribute('data-viewer'));
  }

  toggleCopyButtonState() {
    if (!this.copySourceBtn) return;

    if (this.simpleViewer.getAttribute('data-loaded')) {
      this.copySourceBtn.setAttribute('title', 'Copy source to clipboard');
      this.copySourceBtn.classList.remove('disabled');
    } else if (this.activeViewer === this.simpleViewer) {
      this.copySourceBtn.setAttribute('title', 'Wait for the source to load to copy it to the clipboard');
      this.copySourceBtn.classList.add('disabled');
    } else {
      this.copySourceBtn.setAttribute('title', 'Switch to the source to copy it to the clipboard');
      this.copySourceBtn.classList.add('disabled');
    }

    $(this.copySourceBtn).tooltip('fixTitle');
  }

  loadViewer(viewerParam) {
    const viewer = viewerParam;
    const url = viewer.getAttribute('data-url');

    if (!url || viewer.getAttribute('data-loaded') || viewer.getAttribute('data-loading')) {
      return;
    }

    viewer.setAttribute('data-loading', 'true');

    $.ajax({
      url,
      dataType: 'JSON',
    })
    .done((data) => {
      viewer.innerHTML = data.html;
      $(viewer).syntaxHighlight();

      viewer.setAttribute('data-loaded', 'true');

      this.$blobContentHolder.trigger('highlight:line');

      this.toggleCopyButtonState();
    });
  }

  switchToViewer(name) {
    const newViewer = document.querySelector(`.blob-viewer[data-type='${name}']`);
    if (this.activeViewer === newViewer) return;

    const oldButton = document.querySelector('.js-blob-viewer-switcher.active');
    const newButton = document.querySelector(`.js-blob-viewer-switcher[data-viewer='${name}']`);
    const oldViewer = document.querySelector(`.blob-viewer:not([data-type='${name}'])`);

    if (oldButton) {
      oldButton.classList.remove('active');
    }

    if (newButton) {
      newButton.classList.add('active');
      newButton.blur();
    }

    if (oldViewer) {
      oldViewer.classList.add('hidden');
    }

    newViewer.classList.remove('hidden');

    this.activeViewer = newViewer;

    this.toggleCopyButtonState();

    this.loadViewer(newViewer);
  }
}
