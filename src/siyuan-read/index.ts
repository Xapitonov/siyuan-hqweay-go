import AddIconThenClick from "@/myscripts/addIconThenClick";
import InsertCSS from "@/myscripts/insertCSS";
import { settings } from "@/settings";
import { plugin } from "@/utils";
import { showMessage } from "siyuan";

export default class Read extends AddIconThenClick {
  regexOfHighLight = /==([^=]+?)==/g;
  regexOfMemo = /\^\((.*?)\)\^|\^（(.*?)）\^/g;

  private async extractHighLight({ detail, keepContext, extractPath, addRef }) {
    const docID = document
      .querySelector(
        ".layout__wnd--active .protyle.fn__flex-1:not(.fn__none) .protyle-background"
      )
      ?.getAttribute("data-node-id");

    const extractHighLightSQL = `SELECT * FROM blocks WHERE path LIKE '%/${docID}.sy' 
				AND markdown LIKE '%==%==%' AND  (type = 'p' AND parent_id not in 
				(SELECT id FROM blocks WHERE path LIKE '%/${docID}.sy' AND type = 'i' ) )  
				OR (type = 'i' AND id in (SELECT parent_id FROM blocks WHERE path LIKE '%/${docID}.sy' 
				AND type ='p' AND markdown LIKE '%==%==%' )) ORDER BY created`;

    let res = await this.request("/api/query/sql", {
      stmt: extractHighLightSQL,
    });

    const basicInfoResponse = await this.request("/api/query/sql", {
      stmt: `select * from blocks where id = '${detail.data.id}'`,
    });
    const basicInfo = basicInfoResponse.data[0];

    let result = ``;
    if (res) {
      res.data.forEach((element) => {
        // console.log(element);

        if (keepContext) {
          result += `${element.markdown}\n\n`;
        } else {
          // const match = element.markdown.match(this.regexOfHighLight);
          let match;
          while (
            (match = this.regexOfHighLight.exec(element.markdown)) !== null
          ) {
            result += `${match[1]}${addRef ? ` ((${element.id} "*"))` : ""}\n\n`;
          }
        }
      });
      result = result.trim();
      if (!result) {
        showMessage(`当前文档无标注喔`);
        return;
      }

      await this.request("/api/filetree/createDocWithMd", {
        notebook: detail.protyle.notebookId,
        path: extractPath
          ? `${extractPath}/${basicInfo.content}`
          : `${basicInfo.hpath}/${basicInfo.content}`,
        markdown: result,
      });
    }
  }

  private async extractMemo({ detail, keepContext, extractPath, addRef }) {
    const docID = document
      .querySelector(
        ".layout__wnd--active .protyle.fn__flex-1:not(.fn__none) .protyle-background"
      )
      ?.getAttribute("data-node-id");

    const sql = `select * from blocks where root_id = '${docID}' and id in
(select block_id from spans where type='textmark inline-memo') ORDER BY created`;

    let res = await this.request("/api/query/sql", {
      stmt: sql,
    });

    const basicInfoResponse = await this.request("/api/query/sql", {
      stmt: `select * from blocks where id = '${detail.data.id}'`,
    });
    const basicInfo = basicInfoResponse.data[0];

    let result = ``;
    if (res) {
      res.data.forEach((element) => {
        // console.log(element);

        if (keepContext) {
          result += `${element.markdown}\n\n`;
        } else {
          let match;

          while ((match = this.regexOfMemo.exec(element.markdown)) !== null) {
            result += `${match[1] ? match[1] : match[2]}${
              addRef ? ` ((${element.id} "*"))` : ""
            }\n\n`;
          }
        }
      });
      result = result.trim();
      if (!result) {
        showMessage(`当前文档无备注喔`);
        return;
      }

      await this.request("/api/filetree/createDocWithMd", {
        notebook: detail.protyle.notebookId,
        path: extractPath
          ? `${extractPath}/${basicInfo.content}`
          : `${basicInfo.hpath}/${basicInfo.content}`,
        markdown: result,
      });
    }
  }
  public editortitleiconEvent({ detail }) {
    detail.menu.addItem({
      iconHTML: "",
      label: "提取元素至新文档",
      // click: async () => {
      //   const extractPath = settings.getBySpace("readConfig", "extractPath");
      //   const addRef = settings.getBySpace("readConfig", "addRef");
      //   this.extractHighLight({
      //     detail,
      //     keepContext: false,
      //     extractPath,
      //     addRef,
      //   });
      // },
      submenu: [
        {
          iconHTML: "",
          label: "提取标注（无上下文）",
          click: async () => {
            const extractPath = settings.getBySpace(
              "readConfig",
              "extractPath"
            );
            const addRef = settings.getBySpace("readConfig", "addRef");
            this.extractHighLight({
              detail,
              keepContext: false,
              extractPath,
              addRef,
            });
          },
        },
        {
          iconHTML: "",
          label: "提取标注（含上下文）",
          click: async () => {
            const extractPath = settings.getBySpace(
              "readConfig",
              "extractPath"
            );
            const addRef = settings.getBySpace("readConfig", "addRef");
            this.extractHighLight({
              detail,
              keepContext: true,
              extractPath,
              addRef: false,
            });
          },
        },
        {
          iconHTML: "",
          label: "提取备注（无上下文）",
          click: async () => {
            const extractPath = settings.getBySpace(
              "readConfig",
              "extractPath"
            );
            const addRef = settings.getBySpace("readConfig", "addRef");
            this.extractMemo({
              detail,
              keepContext: false,
              extractPath,
              addRef,
            });
          },
        },
        {
          iconHTML: "",
          label: "提取备注（含上下文）",
          click: async () => {
            const extractPath = settings.getBySpace(
              "readConfig",
              "extractPath"
            );
            const addRef = settings.getBySpace("readConfig", "addRef");
            this.extractMemo({
              detail,
              keepContext: true,
              extractPath,
              addRef: false,
            });
          },
        },
      ],
    });
    // const keepContext = settings.getBySpace("readConfig", "keepContext");
    // if (keepContext) {
    // detail.menu.addItem({});
    // }
  }
}
