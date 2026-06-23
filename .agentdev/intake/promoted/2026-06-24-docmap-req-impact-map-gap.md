# docs/DOC-MAP.md と docs/specs/req-impact-map.md に REQ-0142〜0147 のカタログ行が欠落

## 観測内容

バンドル元 inbox 項目 1 件。

- `.agentdev/intake/inbox/2026-06-23-epic1060-wave1-docmap-req-impact-map-req0142-0147-gap.md`

発生源は PR #1068（Epic #1060 Wave 1 close、Issue #1061 OU-001: REQ-0148 CREATE + ADR-0129 CREATE、squash f24cf00a、2026-06-23 マージ）。本 PR の検証過程で、PR スコープ外の先行ギャップ 2 件を見つけた。

1. `docs/DOC-MAP.md` の現行 REQ テーブルに REQ-0142 の行が欠落している。
   - REQ-0143〜0148 は記載済み。REQ-0142 のみ行なし。
   - req-save 時のカタログ更新漏れの可能性。本 PR では REQ-0148 のみ追加し、REQ-0142 は別途対応とした。

2. `docs/specs/req-impact-map.md` の Impact Matrix に REQ-0142〜0147 が欠落している。
   - REQ-0148 は本 PR で追加済み（IR-006, IR-016 / commands 系）。
   - REQ-0142〜0147 は未記載。低影響リストにも未記載。
   - 同様に req-save 時のカタログ更新漏れの可能性。

PR #1068 はスコープ外としてそのまま進行し、本 intake で記録のみ行った。検証済みの状態:

- `docs/DOC-MAP.md`: REQ-0142 行欠落（未修正）
- `docs/specs/req-impact-map.md`: REQ-0142〜0147 行欠落（未修正）

## 影響

DOC-MAP.md と req-impact-map.md は、要件影響分析とカタログ全体の俯瞰参照で使われる前提表。欠落行があると、REQ-0142〜0147 を起点とする影響調査や、新規要件が既存 REQ と重複しないかの確認で見落としが出る。

- DOC-MAP.md の REQ-0142 欠落: REQ-0142 を前提にした文書配置確認ができない。
- req-impact-map.md の REQ-0142〜0147 欠落: 当該 REQ 群がどの IR / commands に影響するかの追跡ができない。REQ-0148 のみ追加された状態で行列が部分的であり、全体像の整合性が取れない。
- 原因が req-save 時のカタログ更新漏れと推定されるため、再発防止策を入れないと次回以降の req-save でも同様の欠落が起きる。

## 課題

REQ-0142〜0147 を DOC-MAP.md と req-impact-map.md の両方へ過不足なく追加し、あわせて req-save 時のカタログ更新漏れを防ぐ再発防止策を整備する。

## 既存要件との関連

- REQ-0142: 配布物整合性検査の実装。DOC-MAP.md のみ行欠落。req-impact-map.md にも行欠落。
- REQ-0143: command file format Step 形式への準拠。req-impact-map.md に行欠落。
- REQ-0144〜0147: req-impact-map.md に行欠落。REQ-0148 と同じタイミングで追加されたべき行群。
- REQ-0148: 本 PR #1068 で DOC-MAP.md / req-impact-map.md の両方へ追加済み。REQ-0142〜0147 はこれと対で揃うべき行。
- DOC-MAP.md / req-impact-map.md: ともに docs/ または docs/specs/ 配下のカタログ前提表。REQ-0101 系で文書管理基準が定義されている。

存在するもの: REQ-0142〜0147 の各 REQ ファイル、REQ-0148 の両表への行追加（PR #1068）。
欠けているもの: DOC-MAP.md の REQ-0142 行、req-impact-map.md の REQ-0142〜0147 行。

## 整形の方向性

backlog-review では docs_chore の単独 RU として扱う候補を推奨する。修正範囲が DOC-MAP.md と req-impact-map.md の 2 ファイルに限定され、作業内容も行追加のみで完結する。

RU の想定作業要素:

1. `docs/DOC-MAP.md` の現行 REQ テーブルへ REQ-0142 の行を追加。REQ-0143〜0148 と同じ書式で記載。
2. `docs/specs/req-impact-map.md` の Impact Matrix と低影響リストへ REQ-0142〜0147 の行を追加。REQ-0148 の追加内容を参考に IR / commands 列を埋める。
3. req-save 時のカタログ更新漏れの再発防止策を検討。req-save コマンド手順へ DOC-MAP.md / req-impact-map.md 更新チェックリストを追加するか、機械検出ルールを入れるか。

優先度は中程度。実害は限定的だが、カタログの完全性は docs-check / inspect-docs の前提になるため、早期に埋める方がよい。再発防止策の有無は backlog-review で判断を分けられる（カタログ修正のみの最小 RU、再発防止は別 RU とする選択も可）。
