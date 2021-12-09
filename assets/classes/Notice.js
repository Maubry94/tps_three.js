export class Notice {
  /**
   * Display notice at the bottom of the page
   * @param {String} name Your notice content
   */
  constructor(content) {
    this.content = content;
    let noticePaEl = document.getElementsByClassName("bottom")[0];
    if (!noticePaEl) {
      console.log("Error when display notice ! Parent Element not found !");
      return;
    }
    let noticeEl = document.createElement("notice");
    noticeEl.innerHTML = content;
    noticePaEl.appendChild(noticeEl);
    setTimeout(() => {
      noticeEl.remove();
    }, 10 * 1000);
  }
}
