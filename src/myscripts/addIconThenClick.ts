// export default AddIconThenClick;

export default class AddIconThenClick {
  id: string = "";
  label: string = "";
  icon: string = "";

  onunload() {
    document.getElementById(this.id) &&
      document.getElementById(this.id).remove();
  }

  onload() {
    if (document.getElementById(this.id)) {
      return;
    }
    this.addIconThenClick();
  }

  exec() {}

  addIconThenClick() {
    if (document.getElementById(this.id)) {
      return;
    }
    // 添加一个按钮
    const barMode = document.getElementById("barMode");
    barMode.insertAdjacentHTML(
      "beforebegin",
      `<div id="${this.id}" class="toolbar__item b3-tooltips b3-tooltips__se" aria-label="${this.label}" ></div>`
    );
    const btn = document.getElementById(`${this.id}`);
    btn.style.width = "auto";
    btn.innerHTML = this.icon;
    btn.addEventListener(
      "click",
      (e) => {
        this.exec();
        e.stopPropagation();
        e.preventDefault();
      },
      true
    );
  }

  // 请求函数
  request(url, data = null, method = "POST") {
    return new Promise((resolve, reject) => {
      if (method.toUpperCase() == "POST") {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then(
            (data) => resolve(data.json()),
            (error) => {
              reject(error);
            }
          )
          .catch((err) => {
            console.error("请求失败:", err);
          });
      }
    });
  }
}
