# agentdev-gh-cli SPEC の draft → accepted 昇格判断

## 観測内容

`docs/specs/skills/agentdev-gh-cli.md`（SPEC）は現在 `status: draft`。発端は PR #1098（squash f5454154, Issue #1094 REQ-0149, Epic #1093 Wave 1, 2026-06-23 merge）。同 PR は agentdev-gh-cli を I/O hub + 操作契約 + references 分離で実装し、12 ファイルを委譲、9 手続きを提供、ADR-0130 の 6 決定事項を反映した。これにより SPEC 内容が実装によって検証された。出典: `inbox/2026-06-23-epic1093-wave1-agentdev-gh-cli-spec-promotion-deferred.md`。

case-close Step 3-2 SPEC 確定フロー (c) で見送りが記録された。見送り理由は「Wave 2 (#1095 ローカル版 agentdev-gh-cli) が当該 SPEC に直接依存して実装されるため、SPEC 昇格が Wave 2 実装と競合しないか慎重評価が必要」。Step 3-2 は本来ユーザー承認を要する判断であり、本 case-close では判断を次工程へ先送りした。

Wave 2（#1095 / PR #1099）はその後クローズ済み。見送り理由（Wave 2 との競合懸念）の前提が消滅したため、SPEC の `status: draft → accepted` 昇格が改めて判断時点に来ている。

## 影響

- SPEC 権威の保留: SPEC が draft のままでは、agentdev-gh-cli の I/O 契約・9 手続き・references 分離を現行根拠として参照する文書（FILE 2 の inspect-skills 検証、各 command/skill の委譲実装）が、暫定仕様を引き続き引用する形になる。
- 後続 Wave の根拠薄: Wave 3 以降で agentdev-gh-cli 前提を利用する作業（ローカル版 install、case-schema 吸収、FILE 4 の install-script local mode）が、確定 SPEC を前提に進んでいるにもかかわらず、SSoT 文書は draft のまま残る。
- 意思決定の宙吊り: case-close Step 3-2 で明示的に「後続 Wave で再評価」と記録されたため、判断を放置するとトレーサビリティ上も未解決案件として残り続ける。

影響範囲は agentdev-gh-cli SPEC を参照する全作業と、SPEC lifecycle 運用の記録一貫性。

## 課題

`docs/specs/skills/agentdev-gh-cli.md` を `status: draft` から `status: accepted` へ昇格させる。Wave 2 クローズによって case-close Step 3-2 で記録された見送り理由が解消したため、改めて SPEC 確定判断を行う。

## 既存要件との関連

- REQ-0149（agentdev-gh-cli 手続き委譲基盤）: 本 SPEC の要件。-005 references 分離完了条件は PR #1098 で [x] 達成済み、SPEC 改訂自体も完了。
- ADR-0130（accepted）: agentdev-gh-cli を I/O 境界として確立。SPEC は本 ADR の 6 決定事項を反映済み。
- ADR-0123（SPEC lifecycle と spec-save の導入）: SPEC の draft → accepted 昇格手続きの根拠。
- REQ-0101（文書・REQ 管理基準）: SPEC frontmatter の `status`, `updated` 取扱い。
- ADR-0131（link mode 統一）: ローカル版 agentdev-gh-cli が link 先差し替えで構成されることを前提とする。SPEC の accepted 化は link mode 運用の根拠整備でもある。

不足: 昇格に先立ち、SPEC 本文が Wave 2 (#1095) の実装結果（ローカル版 agentdev-gh-cli）を反映しているか、frontmatter `updated` 日付の更新ルールの確認が必要。

## 整形の方向性

種別は docs_chore（SPEC frontmatter 更新と本文微修正）。小作業だが SPEC lifecycle の完結点上で高優先。

想定する RU 働き:

- 昇格判断: ユーザー承認を経て `docs/specs/skills/agentdev-gh-cli.md` frontmatter を `status: draft → accepted`、`updated` を現日付へ更新。
- 本文確認: Wave 2 実装結果（ローカル版 agentdev-gh-cli、link 先差し替え）が SPEC に反映されているか確認。不足があれば本 RU で補う。
- 受入基準候補:
  - frontmatter の `status: accepted` への切替と `updated` 日付更新が完了。
  - SPEC 本文が ADR-0130 の 6 決定事項・REQ-0149 全完了条件・Wave 2 実装結果と矛盾しない。
  - DOC-MAP の当該 SPEC 行が accepted を反映（FILE 1 の DOC-MAP 更新と整合）。
- 優先度目安: 高。判断先送りの前提（Wave 2 競合）が消滅しており、これ以上の draft 保留は SPEC lifecycle 違反の恐れ。
- バンドル: 単独処理。FILE 1（DOC-MAP 等）と同時実行してもよいが、本件は SPEC frontmatter と ADR-0130 反映が主眼で主題が異なるため独立 RU を推奨。
