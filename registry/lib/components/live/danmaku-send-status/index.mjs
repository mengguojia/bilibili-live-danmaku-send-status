import { classifyResponse, escapeHtml, observeFetch } from './detector.mjs';

const { defineComponentMetadata } = coreApis.componentApis.define;
const { Toast } = coreApis.toast;
const title = '直播弹幕发送检测';
let cleanup;

function notifyFailure(request, result) {
  if (result.status === 'accepted') {
    return;
  }
  const message = `${escapeHtml(result.title)}<br>弹幕：${escapeHtml(request.text)}`;
  Toast.error(message, title, 5000);
}

function start() {
  const onResponse = (request, response, httpStatus) => {
    const result = classifyResponse(response, httpStatus);
    notifyFailure(request, result);
    return result;
  };
  const onFailure = request => {
    notifyFailure(request, { status: 'network-error', title: '请求未完成' });
  };
  cleanup = observeFetch(unsafeWindow, onResponse, onFailure);
}

export const component = defineComponentMetadata({
  name: 'liveDanmakuSendStatus',
  displayName: title,
  tags: [coreApis.componentApis.component.componentsTags.live],
  author: { name: 'mengguojia', link: 'https://github.com/mengguojia' },
  description: '检测系统过滤和直播间屏蔽，仅在发送失败时提示原因和弹幕内容，并将屏蔽响应改写为发送失败。',
  urlInclude: [/^https:\/\/live\.bilibili\.com\/(?:blanc\/)?\d+(?:[/?#]|$)/],
  entry: start,
  reload: start,
  unload: () => cleanup(),
});
