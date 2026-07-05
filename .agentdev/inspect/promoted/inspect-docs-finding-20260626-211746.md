---
title: "inspect-docs finding: 前回検出事項の解決状況確認と Finding 1 残存記述評価"
command: inspect-docs
generated_at: 2026-06-26T21:17:46+09:00
generator: Sisyphus-Junior (inspect-docs 再実行)
spec: docs/specs/commands/inspect-docs.md
scope: docs/requirements/, docs/adr/, docs/specs/, docs/guides/, docs/DOC-MAP.md, README.md, .opencode/
source_of_truth_priority: 現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides
previous_finding: .agentdev/inspect/inbox/inspect-docs-finding-20260626-200650.md (commit ef82f6ec)
phase_context: |
  前回 inspect-docs（commit ef82f6ec、12件検出）の修正経過確認。
  修正 commits: 09ea5fae (RU-0005 case-auto で Finding 1/3/4/5/6/7/8 一部是正),
  e291dd45 (Finding 9/11/2 直接修正), 8ebe0e98 (Finding 1 追加修正: ### Plugin-future セクション削除)。
  本診断は前回12件の resolved/still-open/false-positive を確定し、Finding 1 残存記述の判定を下す。
---

# inspect-docs 検出事項: 前回解決状況確認と Finding 1 残存記述評価

## 目的

`docs/specs/commands/inspect-docs.md` Step 1-16 に従い再実行し、前回12件の検出事項の解決状況を確認する。特に Finding 1（runtime-package-boundary.md）の残存記述（L11/L130/L156 の REQ-0103-064 参照を含む注記）について、SPEC 分離基準（REQ-0101-068）、安定契約例外（REQ-0101-069）、SPEC 責務境界（document-model.md）、REQ-0101-060 の4観点から violation / accepted-exception / false-positive を明確に判定する。

## 診断サマリ

| 項目 | 値 |
|------|-----|
| 前回検出事項 | 12 件（HIGH 3 / MEDIUM 5 / LOW 4） |
| 今回判定: resolved | 9 件（Finding 2, 3, 4, 5, 6, 7, 8, 9, 11） |
| 今回判定: partial-resolved（主たる問題解決・残存 minor concern） | 1 件（Finding 1） |
| 今回判定: still-open | 2 件（Finding 10, 12） |
| 今回判定: false-positive | 0 件 |
| 新規検出事項 | 1 件（Finding 13: IR 群 regression_test "(追加予定)" 残留、21件以上） |
| 今回検出事項合計 | 4 件（partial-resolved 1 + still-open 2 + new 1） |

### 前回12件との差分（resolved / still-open / new）

| Finding | 前回 | 修正 commit | 今回判定 | 根拠 |
|---------|------|-------------|----------|------|
| 1 | HIGH (SPEC 将来内容残留) | 09ea5fae + 8ebe0e98 | **partial-resolved**（HIGH → LOW 残存懸念） | L17/L98-100 削除済み。L11/L130/L156 に REQ-0103-064 参照注記残存。主たる問題（独立セクション・テーブル行）は解決、minor concern 残存 |
| 2 | LOW (IR-053/054 "(追加予定)") | e291dd45 | **resolved** | L15 が "(未実装)。" に修正済み（両ファイル） |
| 3 | HIGH (REQ-0114-024 Step 直接参照) | 09ea5fae | **resolved** | "case-open の RU 削除工程と同一条件" へ機能名参照化済み |
| 4 | MEDIUM (REQ-0102-074 スキーマフィールド) | 09ea5fae | **resolved** | "REQ-0101-069 安定契約例外: 他コマンドとの接続契約。フィールドスキーマ詳細は SPEC 参照" 明記済み |
| 5 | MEDIUM (REQ-0108-100 enum 値一覧) | 09ea5fae | **resolved** | "REQ-0101-069 安定契約例外: 利用者に見える分類体系" 明記済み |
| 6 | MEDIUM (REQ-0108-153 enum 値一覧) | 09ea5fae | **resolved** | 同上 |
| 7 | LOW-MEDIUM (REQ-0148-007/009/018 実装パラメータ) | 09ea5fae | **resolved** | 3行とも "REQ-0101-069 安定契約例外: 安全境界" 明記済み |
| 8 | LOW (REQ-0144-013 regex パターン) | 09ea5fae | **resolved** | "REQ-0101-069 安定契約例外: 公開入口。誤分類表記の恒久検出識別子" 明記済み |
| 9 | HIGH (project-docs-and-specs.md REQ 範囲) | e291dd45 | **resolved** | "REQ-0101 から REQ-0156 までの 48 件" へ修正済み |
| 10 | LOW (consumer-project-setup.md L130 歴史的記述) | （見送り） | **still-open**（前回見送り継続: guide 案内層で許容範囲、LOW） | L130 同内容で残存。「旧 integrity skill」「配布対象外となった」は歴史記述だが、後半「docs-check は `repo-agentdev-integrity` ... 本体リポジトリでのみ実行される」は現状説明も兼ねるため、guide 案内層の範囲内と判断（前回見送り継続） |
| 11 | LOW (DOC-MAP.md L121 セクション見出し) | e291dd45 | **resolved** | "基盤 SPEC（`specs/` 配下サブディレクトリ）" へ修正済み |
| 12 | HIGH (未処理 artifact 蓄積) | （別セッション予定） | **still-open**（悪化） | intake inbox 23→25件、learning inbox.md 行数増、learning/promoted/ 0→1、backlog/req-units/ 0→1。artifact lifecycle 処理が未実施 |

## Finding 1 残存記述の詳細評価

### 対象（runtime-package-boundary.md の現状）

- L9 見出し: `## 4 種のリポジトリ種別（Repo Type）`（前回「5 種」→「4 種」に修正済み）
- L11: `> 将来の plugin/npm/package 配布形態（\`plugin-future\`）は現在未対応であり、REQ-0103-064 を参照のこと。`（blockquote 注記）
- L130: `| Plugin / npm / package | 未対応 | — | REQ-0103-064 参照 |`（導入方式ポリシー表の1行）
- L156: `> 将来の plugin 配布形態（\`plugin-future\`）は現在未対応（REQ-0103-064 参照）。`（blockquote 注記）
- 削除済み: L17（旧 plugin-future 行）、L98-100（旧 `### Plugin-future（将来）` 独立セクション）

### 4観点からの評価

#### (a) SPEC 分離基準（REQ-0101-068）

REQ-0101-068 は「**REQ 要件行**が スキーマフィールド、enum 値一覧...を主たる文意とする場合」に SPEC 等への移管を求める基準。本基準の対象は「REQ 要件行」であり、SPEC ファイルの記述に対する直接の基準ではない。runtime-package-boundary.md は SPEC であるため、REQ-0101-068 は直接適用外。**SPEC 分離基準（REQ-0101-068）違反ではない。**

#### (b) 安定契約例外（REQ-0101-069）

REQ-0101-069 は「REQ 要件行候補がパラメータ、分類、値の形式をとる場合であっても、公開 command 名...安全境界...等のいずれかに該当する場合は REQ に要約として記述できる」という REQ 側の例外規定。これも「REQ に記述できる」例外であり、SPEC 側の記述を直接許容する規定ではない。ただし REQ-0103-064（実在、REQ-0134.md L27 に配置）が「plugin/npm/package 化は将来の選択肢として扱い...現在の要件の対象外とすること」と要約しており、runtime-package-boundary.md の L11/L130/L156 はこの REQ 側の要約を SPEC から参照する導線として機能している。**安定契約例外の趣旨（REQ 側で安定契約を要約し、SPEC はそれを参照）を補完する導線として機能しており、違反ではない。**

#### (c) SPEC 責務境界（document-model.md L339-345, REQ-0101-060）

- L343: 「SPEC に新規要件を置かない。将来要件は REQ に記述する」
- L344: 「SPEC は現在仕様、契約記述に限定する」
- L345: 「SPEC は現在システムがどう動作しているかを記述し、どう動作すべきかを記述しない」
- REQ-0101-060: 「docs/specs/\* に過去前提、移行経緯、将来予定、未実装予定、検討過程が混入していないこと」

L130「Plugin / npm / package | 未対応 | — | REQ-0103-064 参照」は現在の導入方式ポリシー表における「未対応」の事実記述であり、SPEC の「現在どう動作しているか」範囲内。REQ-0103-064 参照で REQ 側へ導線。**accepted-exception（現状記述 + REQ 参照）。**

L11/L156 は「将来の plugin/npm/package 配布形態」「将来の plugin 配布形態」という表現と「`plugin-future`」識別子（4種のリポジトリ種別には含まれない）を維持している。「将来」語と将来識別子の維持は REQ-0101-060「将来予定の混入」に見えるが、「現在未対応であり、REQ-0103-064 を参照のこと」と但し書きで REQ 側へ導線を張り、「現在未対応」という現状事実を主たる文意にしている。**完全な違反ではなく、minor concern（確信度 LOW）の残存。** 「将来」「`plugin-future`」語を除去し、「Plugin/npm/package 配布は現在未対応（REQ-0103-064 参照）」のように現状記述に徹するのがよりクリーン。

#### (d) 総合判定

**partial-resolved。主たる問題（独立セクション・テーブル行での将来内容詳細記述）は解決済み。残存記述（L11/L130/L156 の REQ-0103-064 参照注記）は「accepted-exception（L130）+ minor concern（L11/L156）」。**

- SPEC 分離基準（REQ-0101-068）違反: **ではない**（同基準は REQ 要件行向け）
- 安定契約例外（REQ-0101-069）違反: **ではない**（同例外は REQ 側の要約を許容する規定であり、SPEC からの参照導線を補完）
- SPEC 責務境界（document-model.md）/ REQ-0101-060 違反: **L130 は accepted-exception、L11/L156 は minor concern（確信度 LOW）**
- false-positive: **ではない**（前回の HIGH 判定自体は妥当だった。修正により主たる問題は解決）

### 推奨 route（残存 minor concern 対応）

`UPDATE`（L11/L156 の表現整理）。確信度 LOW。
- L11: `> Plugin/npm/package 配布は現在未対応（REQ-0103-064 参照）。`（「将来」「`plugin-future`」語を除去）
- L156: 同上
- 優先度は LOW。前回の推奨 route（MOVE: 詳細セクション削除 + REQ 参照1行への縮退）は達成されており、本残存は表現の完全性向上にとどまる。

## 新規検出事項

### Finding 13: IR 群 regression_test "(追加予定)" 残留（網羅的未解決）

- **観点**: Step 5 SPEC 意味診断（前回 Finding 2 の網羅版）
- **対象**: `docs/specs/integrity/rules/IR-025〜IR-051` の 21 件以上（IR-025, 028, 029, 030, 031, 032, 033, 034, 035, 036, 037, 038, 039, 040, 041, 043, 046, 047, 048, 050, 051, 029 等）
- **確信度**: LOW-MEDIUM
- **根拠**: 各 IR ファイル L15 の regression_test フィールドが `| regression_test | (追加予定) |` または `| regression_test | (追加予定)。... |` の形式で残存。前回 Finding 2 は IR-053/054 のみを指摘し、「(追加予定)」→「(未実装)」へ修正されたが、他の IR 群は未修正のまま残っている。
- **判定**: 前回 Finding 2 と同じ判断基準を全 IR へ適用すると、21 件以上が同様の境界ケース（SPEC の現状記載として許容範囲内だが、表記は "(追加予定)" より "(未実装)" が SPEC 原則に整合）に該当。前回の Finding 2 は「一部抽出」であり、網羅的ではなかった。本診断では IR-053/054 の修正が他の IR へ波及していないことを検出。
- **source-of-truth 判定**: SPEC（integrity-rule-catalog.md および IR-NNN 個別ルール）の記述として、表記の一貫性が失われている。IR-053/054 は "(未実装)"、他は "(追加予定)" と混在。
- **推奨 route**: `UPDATE`（表記統一または運用方針明文化）。全 IR の regression_test フィールド表記を "(追加予定)" から "(未実装)" へ統一するか、IR ルールカタログ（integrity-rule-catalog.md）に regression_test 運用方針（"(追加予定)" と "(未実装)" の使い分け基準、または空欄運用）を明文化し、全 IR をその方針へ整合させる。
- **req-define 入力案**: —（運用改善、要件変更不要。ただし影響範囲が21件以上のため、一括修正 PR を想定）

### Finding 12 更新: 未処理 artifact 蓄積（悪化）

- **観点**: Step 12 未処理 artifact 確認
- **対象**: `.agentdev/intake/inbox/`、`.agentdev/learning/inbox.md`、`.agentdev/inspect/inbox/`
- **確信度**: HIGH（事実確認）
- **前回（commit ef82f6ec 時点）→ 今回の差分**:
  - **intake inbox**: 23 件 → **25 件**（2件増加。新規 item が promote されず蓄積）
  - **intake promoted**: 0 件 → **1 件**（1件のみ promote 処理）
  - **learning inbox.md**: 7 entry → **116 行**（行数ベースで増加。entry 数は要確認だが、少なくとも減っていない）
  - **learning promoted**: 0 件 → **1 件**（1件のみ promote 処理）
  - **backlog/req-units/**: 0 件 → **1 件**（RU が 1 件だけ生成済み。未処理）
  - **inspect inbox**: 5 件 → **6 件**（em-dash 4 件 + inspect-docs-finding-20260625 + inspect-docs-finding-20260626-200650 = 6 件。本 finding 追加で 7 件）
  - **inspect promoted**: 0 件 → **1 件**（1件のみ promote 処理）
- **判定**: 前回 HIGH 判定から悪化。artifact lifecycle 処理（intake-promote / learning-promote / inspect-promote / backlog-review）が一部実施されたものの、新規発生量が処理量を上回り、未処理在庫が増加傾向。本診断の検出事項（前回12件 + 今回4件 = 16件累積）も `inspect-promote` 待ちとなる。
- **潜在的影響**:
  - intake inbox 25 件は新規要件化作業候補。一部は REQ-0140/0144/0145/0148/0151〜0156 体系化で取り込み済みの可能性。`intake-promote` での重複確認と archive 化が必要。
  - learning inbox 116 行は `learning-promote` での恒久契約昇華検討候補。
  - inspect inbox は em-dash 4 件（既存）+ inspect-docs finding 2 件（前回 + 前々回）+ 本 finding（計7件）。`inspect-promote` での採用/却下判定が必要。
- **source-of-truth 判定**: artifact lifecycle（`.agentdev/README.md` 状態表）に従い、各工程の入力として処理されるべき。本診断では処理しない（G04）。
- **推奨 route**: 各 lifecycle command の実行（`intake-promote` / `learning-promote` / `inspect-promote` / `backlog-review`）。本 finding は `inspect-promote` にて採用/却下判定される。前回に引き続き、別セッションでの lifecycle command 一括実行を推奨。

## false positive 記録（本診断で確認）

前回カタログ化済み（FP-1〜FP-5）に加え、本診断で新たに確認した false positive パターン:

### FP-6: SPEC 内の「将来」「未対応」語のメタ記述

- **対象**:
  - `document-model.md` L14, L15, L33, L245, L326, L343（SPEC 責務境界、分類判断ツリー等のルール宣言）
  - `design-principles.md` L51（ADR 判断基準の説明）
  - `patterns.md` L77（REQ 記述ルール）
  - `_template.md` L54（command SPEC テンプレートのルール）
  - `inspect-docs.md` L41（検査観点の説明）
  - `document-type-responsibilities.md` L25（ADR 定義）
  - `case-close.md` L98（「完了条件未対応事項」= 現在の未達項目の事実記述）
- **理由**: これらは「SPEC は将来計画を記述しない」「ADR は将来の設計...を記述する」等のルール自体を宣言するメタ記述、または現在の事実状態（「未対応事項」）の記述。SPEC 対象外の将来内容を記述しているわけではない。

## source-of-truth priority 遵守状況

- G05（現行 REQ > 承認済み ADR > SPEC > DOC-MAP/guides）: 全 finding で遵守。
  - Finding 1 残存評価では、REQ-0103-064（REQ-0134.md L27、現行 REQ）を優先し SPEC（runtime-package-boundary.md）の注記を「REQ への導線」として許容範囲内と判定。
  - Finding 10 では ADR-0106（承認済み）が配布対象外の根拠。
- ADR-0123（SPEC lifecycle）: 全 SPEC status 判定で遵守。基盤SPEC status 追跡は `docs/specs/README.md` の status 列で集約管理（REQ-0154-001）。

## 推奨アクション優先度順

1. **HIGH**: Finding 12（未処理 artifact 処理、悪化）→ 別セッションで lifecycle command（`intake-promote` / `learning-promote` / `inspect-promote` / `backlog-review`）の一括実行
2. **LOW-MEDIUM**: Finding 13（IR 群 regression_test "(追加予定)" 残留 21件以上）→ 一括表記統一 PR または IR ルールカタログへの運用方針明文化
3. **LOW**: Finding 1 残存（L11/L156 の「将来」「`plugin-future`」語）→ 表現整理（「Plugin/npm/package 配布は現在未対応（REQ-0103-064 参照）」へ）
4. **LOW**: Finding 10（consumer-project-setup.md L130 歴史的記述）→ 前回見送り継続。guide 案内層の範囲内で許容するか、ADR-0106 参照のみへ縮退するかは後続 inspect で再判断

## 前回12件の解決状況サマリ

- **resolved**: 9 件（Finding 2, 3, 4, 5, 6, 7, 8, 9, 11）
- **partial-resolved**: 1 件（Finding 1: 主たる問題解決、minor concern 残存）
- **still-open**: 2 件（Finding 10: guide 許容範囲で見送り継続、Finding 12: 悪化）
- **false-positive**: 0 件

## See Also

- [inspect-docs SPEC](../../../docs/specs/commands/inspect-docs.md)
- [前回 inspect-docs finding](inspect-docs-finding-20260626-200650.md)（commit ef82f6ec、12件検出）
- [前々回 inspect-docs finding](inspect-docs-finding-20260625-202639.md)（X-1〜X-7 カタログ）
- [document-model.md SPEC 責務境界](../../../docs/specs/foundations/document-model.md#spec-責務境界)
- [REQ-0103-064（REQ-0134.md L27）](../../../docs/requirements/REQ-0134.md)
