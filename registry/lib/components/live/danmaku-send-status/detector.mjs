export function isSendRequest(url, method) {
  const parsed = new URL(url, 'https://live.bilibili.com/');
  return method.toUpperCase() === 'POST' &&
    parsed.origin === 'https://api.live.bilibili.com' && parsed.pathname === '/msg/send';
}

export function classifyResponse(response, httpStatus = 200) {
  if (httpStatus < 200 || httpStatus >= 300) {
    return { status: 'http-error', title: `HTTP 请求失败 (${httpStatus})` };
  }
  if (response.code !== 0) {
    return { status: 'rejected', title: `发送被拒绝 (code=${response.code})` };
  }
  if (response.msg === 'f') {
    return { status: 'system-blocked', title: '发送失败：弹幕被系统过滤' };
  }
  if (response.msg === 'k') {
    return { status: 'room-blocked', title: '发送失败：弹幕被直播间屏蔽' };
  }
  return { status: 'accepted', title: '弹幕发送成功' };
}

export function rewriteBlockedResponse(response, result) {
  const rewritten = { ...response, code: -101, message: result.title, ttl: 1 };
  delete rewritten.msg;
  delete rewritten.data;
  return rewritten;
}

export function readSendFields(body) {
  const fields = typeof body === 'string' ? new URLSearchParams(body) : body;
  const text = fields.get('msg');
  return { text };
}

export function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, character => entities[character]);
}

export function observeFetch(page, onResponse, onFailure) {
  const original = page.fetch;
  let active = true;
  const wrapper = function (input, init) {
    const isRequest = input instanceof page.Request;
    const url = isRequest ? input.url : String(input);
    const method = init?.method ?? (isRequest ? input.method : 'GET');
    if (!active || !isSendRequest(url, method)) {
      return Reflect.apply(original, this, arguments);
    }
    // 克隆 Request 读取正文；页面仍然发送原来的请求。
    const fields = init?.body !== undefined
      ? Promise.resolve(readSendFields(init.body))
      : input.clone().formData().then(readSendFields);
    return Reflect.apply(original, this, arguments).then(async response => {
      const request = await fields;
      if (!active) {
        return response;
      }
      if (response.status < 200 || response.status >= 300) {
        onResponse(request, null, response.status);
        return response;
      }
      const json = await response.clone().json();
      if (!active) {
        return response;
      }
      const result = onResponse(request, json, response.status);
      if (result.status === 'system-blocked' || result.status === 'room-blocked') {
        return new page.Response(JSON.stringify(rewriteBlockedResponse(json, result)), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
      return response;
    }, error => {
      void fields.then(request => {
        if (active) {
          onFailure(request);
        }
      });
      throw error;
    });
  };
  page.fetch = wrapper;
  return () => {
    active = false;
    if (page.fetch === wrapper) {
      page.fetch = original;
    }
  };
}
