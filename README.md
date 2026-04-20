# 鍏徃鍐呴儴鐢ㄧ爺鏈堝害鎴愭灉鐪嬫澘

涓€涓浂鍚庣銆佺函鍓嶇鐨勯潤鎬佺綉椤靛師鍨嬶紝鐢ㄤ簬灞曠ず鍏徃鍐呴儴鏈堝害鐢ㄧ爺鎴愭灉銆傚綋鍓嶇増鏈娇鐢ㄦ湰鍦?JSON 鏂囦欢椹卞姩椤甸潰锛岄€傚悎鍏堝揩閫熷垎浜€侀儴缃插埌 GitHub Pages锛屽苟鍦ㄥ悗缁€愭鏇挎崲鎴愮湡瀹炲唴瀹广€?
## 鐗规€?
- 妗岄潰绔紭鍏堢殑宸﹀彸鍒嗘爮甯冨眬锛岀獎灞忚嚜鍔ㄤ笂涓嬪爢鍙?- A 鍖哄睍绀哄彲鐢ㄦ€ф祴璇曟瑙堛€佹寚鏍囧崱鍜屾粴鍔ㄥ垪琛?- B 鍖烘寜鏈堜唤绛涢€夐噸鐐规礊瀵熷崱锛屽苟鍚屾鏇存柊鍔ㄦ€佹爣棰?- 娲炲療鎽樿鏀寔 Markdown 瀛愰泦
- 鍥剧墖鏀寔鐐瑰嚮鏀惧ぇ棰勮
- 鎵€鏈夋暟鎹潵鑷湰鍦?`data/*.json`
- 鏃犻渶鍚庣鏈嶅姟锛岄€傚悎鐩存帴閮ㄧ讲鍒?GitHub Pages

## 椤圭洰缁撴瀯

```text
.
鈹溾攢 .github/
鈹? 鈹斺攢 workflows/
鈹?    鈹斺攢 deploy.yml
鈹溾攢 assets/
鈹? 鈹斺攢 *.svg
鈹溾攢 data/
鈹? 鈹溾攢 insights.json
鈹? 鈹斺攢 usability.json
鈹溾攢 src/
鈹? 鈹溾攢 components/
鈹? 鈹? 鈹溾攢 ChartCardV2.js
鈹? 鈹? 鈹溾攢 ImageModal.js
鈹? 鈹? 鈹溾攢 InsightCard.js
鈹? 鈹? 鈹溾攢 MetricCardsV2.js
鈹? 鈹? 鈹溾攢 MonthTabs.js
鈹? 鈹? 鈹斺攢 TestList.js
鈹? 鈹溾攢 utils/
鈹? 鈹? 鈹溾攢 data.js
鈹? 鈹? 鈹溾攢 dataV2.js
鈹? 鈹? 鈹溾攢 dom.js
鈹? 鈹? 鈹斺攢 markdown.js
鈹? 鈹溾攢 dashboardAppV2.js
鈹? 鈹斺攢 main.js
鈹溾攢 styles/
鈹? 鈹溾攢 main.css
鈹? 鈹斺攢 tokens.css
鈹斺攢 index.html
```

## 鏈湴杩愯

鐢变簬椤甸潰閫氳繃 `fetch()` 璇诲彇鏈湴 JSON锛屽紑鍙戞椂璇蜂娇鐢ㄩ潤鎬佹湇鍔″櫒鎵撳紑锛屼笉瑕佺洿鎺ュ弻鍑?`index.html`銆?
### 鏂瑰紡 1锛氫娇鐢?Python

```bash
python -m http.server 4173
```
py -m http.server 4173 

鐒跺悗璁块棶锛?
```text
http://localhost:4173
```

### 鏂瑰紡 2锛氫娇鐢?VS Code Live Server

鐩存帴鍦ㄧ紪杈戝櫒涓惎鍔ㄤ换鎰忛潤鎬佹湇鍔′篃鍙互銆?
## 濡備綍鏇挎崲鍐呭

### 1. 鏇挎崲 A 鍖烘暟鎹?
缂栬緫 `data/usability.json`銆?
姣忔潯璁板綍寤鸿淇濇寔濡備笅缁撴瀯锛?
```json
{
  "id": "UT-2026-04-01",
  "testName": "娴嬭瘯鍚嶇О",
  "testDate": "2026-04-11",
  "p0Count": 1,
  "adoptionRate": 88,
  "description": "闂鎻忚堪鎽樿",
  "projectName": "椤圭洰鍚嶇О",
  "tags": ["鏍囩A", "鏍囩B"]
}
```

璇存槑锛?
- `testDate` 浼氳嚜鍔ㄨ褰掔被鍒板搴旀湀浠斤紝渚嬪 `2026-04`
- A 鍖轰細璺熼殢褰撳墠鏈堜唤鍒囨崲鍚屾鍒锋柊
- `adoptionRate` 鐩存帴濉啓鏁板瓧鐧惧垎姣斿嵆鍙紝渚嬪 `88`

### 2. 鏇挎崲 B 鍖烘暟鎹?
缂栬緫 `data/insights.json`銆?
姣忔潯娲炲療寤鸿缁撴瀯锛?
```json
{
  "id": "IN-2026-04-01",
  "month": "2026-04",
  "featured": true,
  "title": "娲炲療鏍囬",
  "summary": "鏀寔 Markdown 鐨勬憳瑕佸唴瀹?,
  "sourceReport": "鏉ユ簮鎶ュ憡鍚嶇О",
  "date": "2026-04-09",
  "tags": ["鏍囩1", "鏍囩2"],
  "images": ["./assets/example.svg"],
  "link": "https://example.com/report"
}
```

璇存槑锛?
- 鍙湁 `featured: true` 鐨勫唴瀹逛細灞曠ず鍦ㄥ搴旀湀浠藉崱鐗囧尯
- `summary` 鏀寔褰撳墠鐗堟湰鐨?Markdown 瀛愰泦锛?  - 娈佃惤
  - `- 鍒楄〃`
  - `**鍔犵矖**`
- `images` 鍙互鏀?0 鍒板寮犲浘鐗?- 鍥剧墖璺緞寤鸿缁х画浣跨敤鐩稿璺緞锛屼緥濡?`./assets/xxx.png`

## 瑙嗚涓庝氦浜掕鏄?
- 褰撳墠鏈堜唤榛樿鍙栨暟鎹腑鐨勬渶鏂版湀浠?- 宸︿晶 A 鍖哄拰鍙充晶 B 鍖轰細闅忔湀浠戒竴璧峰垏鎹?- A 鍖烘粴鍔ㄥ垪琛ㄩ珮搴﹀浐瀹?- B 鍖哄浘鐗囩偣鍑诲悗浼氬脊绐楁斁澶?- 椤甸潰椋庢牸鍋忔祬鑹层€佺暀鐧芥劅寮恒€侀€傚悎鍐呴儴姹囨姤涓庣鐞嗗眰娴忚

## 閮ㄧ讲鍒?GitHub Pages

### 鏂规 1锛氫娇鐢ㄦ湰浠撳簱闄勫甫鐨?GitHub Actions

浠撳簱鍐呭凡鎻愪緵 `.github/workflows/deploy.yml`銆?
浣犲彧闇€瑕侊細

1. 灏嗘暣涓」鐩帹閫佸埌 GitHub 浠撳簱
2. 鍦?GitHub 浠撳簱涓紑鍚?Pages
3. 鍦?Pages 璁剧疆涓€夋嫨 `GitHub Actions` 浣滀负閮ㄧ讲鏉ユ簮

涔嬪悗姣忔鎺ㄩ€佸埌榛樿鍒嗘敮锛岄〉闈㈤兘浼氳嚜鍔ㄩ儴缃层€?
### 鏂规 2锛氭墜鍔ㄩ儴缃查潤鎬佹枃浠?
鍥犱负鏈」鐩病鏈夋瀯寤烘楠わ紝鎵€浠ヤ篃鍙互鐩存帴鎶婃暣涓洰褰曚綔涓洪潤鎬佺珯鐐圭洰褰曢儴缃层€?
## 鍚庣画鎵╁睍寤鸿

- 灏?`data/usability.json` 鏇挎崲涓?Excel 杞?JSON 鐨勪骇鐗?- 鎵╁睍 A 鍖哄浘琛ㄦā鍧楋紝渚嬪瓒嬪娍鍥俱€侀噰绾崇巼璧板娍鍜岄」鐩姣斿浘
- 涓?B 鍖哄鍔犫€滄潵婧愭姤鍛婅鎯呴〉鈥?- 鎺ュ叆鏇村畬鏁寸殑 Markdown 娓叉煋鎴栬交閲?CMS
- 濡傛灉鏈潵鏀规垚 React/Vite锛屽彲鐩存帴澶嶇敤褰撳墠鐨勬暟鎹粨鏋勫拰缁勪欢杈圭晫

## 澶囨敞

褰撳墠鐗堟湰鏄€滃彲鐩存帴杩愯鐨勯潤鎬佺綉椤靛師鍨嬧€濄€傚鏋滀綘涓嬩竴姝ュ笇鏈涳紝鎴戜篃鍙互缁х画鎶婂畠鍗囩骇鎴愶細

- React + Vite 鐗堟湰
- 甯?GitHub Pages 鏋勫缓鑴氭湰鐨勫伐绋嬬増
- 浣犲搧鐗岃瑙夋洿寮恒€佹洿鎺ヨ繎姝ｅ紡姹囨姤椤甸潰鐨勭増鏈?
## Local Editor

项目现在包含一个只用于本地维护数据的录入页：

```text
http://localhost:4173/editor.html
```

说明：
- 这个录入页不会出现在公开看板导航里
- 页面只允许在 `localhost` 或 `127.0.0.1` 这类本地地址下打开
- 可以直接读取当前 `data/usability.json` 和 `data/insights.json`
- 支持新增、删除、编辑、导入当前 JSON、导出 JSON
- 编辑过程会自动保存到浏览器本地草稿，方便你分批整理月份内容
