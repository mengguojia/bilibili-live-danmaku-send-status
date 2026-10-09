# 直播弹幕发送检测

Bilibili-Evolved v2 独立组件，采用[哔哩哔哩直播弹幕反诈修改版](https://github.com/li7355608/bili_danmu_disharmony/blob/3367fb750f8372c2f6b9a1e34d2820bc452015c0/danmu_diff_main.js)的核心逻辑：监听发送弹幕的 fetch 请求，按响应中的 code 和 msg 提示发送结果，并把屏蔽响应改写为发送失败。

## 安装

1. 安装 [Bilibili-Evolved](https://github.com/the1812/Bilibili-Evolved#安装)。
2. 打开直播间，进入 Bilibili-Evolved 设置面板 → 组件管理 → **浏览**。
3. 选择 `registry/dist/components/live/danmaku-send-status.js`，或在链接安装输入框中粘贴下方安装直链。
4. 开启「直播弹幕发送检测」，刷新直播间。

已有同名组件时，导入文件会更新组件，刷新后生效。

[组件安装直链](https://raw.githubusercontent.com/mengguojia/Bilibili-Evolved/master/registry/dist/components/live/danmaku-send-status.js)

## 第三方组件发布

源码仓库：[mengguojia/bilibili-live-danmaku-send-status](https://github.com/mengguojia/bilibili-live-danmaku-send-status)。

在线仓库从 `owner/Bilibili-Evolved/所选分支/文件路径` 下载第三方功能，因此组件产物发布到 [mengguojia/Bilibili-Evolved](https://github.com/mengguojia/Bilibili-Evolved) 的 master 和 preview 分支，路径为 `registry/dist/components/live/danmaku-send-status.js`。

收录信息提交到主项目的 `registry/lib/docs/third-party.ts`，组件名为 `liveDanmakuSendStatus`，owner 为 `mengguojia`。收录 PR 合并并发布目录后，可从在线仓库搜索安装。

## 响应处理

| 返回值 | 处理 |
| --- | --- |
| `code=0`、`msg="f"` | 提示「发送失败：弹幕被系统过滤」，改写为失败响应 |
| `code=0`、`msg="k"` | 提示「发送失败：弹幕被直播间屏蔽」，改写为失败响应 |
| `code=0`、其他 msg | 正常返回 |
| code 非零 | 提示发送被拒绝和错误码 |
| HTTP 非 2xx 或网络错误 | 提示请求失败 |

屏蔽响应返回给网页前，设置 `code=-101`、`message=屏蔽原因`、`ttl=1`，删除 msg 和 data。直播页据此显示发送失败。

发送成功采用发送接口判定。组件仅监听当前页面的 fetch 请求。

## 失败提示

发送失败使用 Bilibili-Evolved 通知显示原因和弹幕内容，持续 5 秒。

## 构建

项目使用 Node.js 内置模块，无需安装依赖：

```powershell
node build.mjs
```

`registry/lib/components/live/danmaku-send-status/detector.mjs` 实现请求监听与响应处理；同目录的 `index.mjs` 接入框架元数据、通知和开关生命周期。产物为 `registry/dist/components/live/danmaku-send-status.js`。

用户已在直播间确认 `msg="f"` 和 `msg="k"` 两条规则。本项目使用 MIT 许可证，响应处理规则参考文首所链接的公开脚本。
