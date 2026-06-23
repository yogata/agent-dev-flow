# ADR-0131 link mode 移行に伴う SPEC/guide/integrity-rule の旧用語残留 4 点一括整形

## 観測内容

ADR-0131（accepted, 2026-06-23「ローカル版導入方式を link mode へ統一し生成方式を廃止」）が ADR-0126（superseded）の生成方式（generate-and-place）を廃止した。Wave 4 の PR #1101（squash a225893cb22a8ca2536ed6e10687d36826f49499, Issue #1097 REQ-0141 UPDATE）は REQ-0141-004 を更新して case-schema を agentdev-gh-cli 配下へ吸収したが、その変更が波及するはずの 4 箇所に ADR-0126 時代の用語・構成が残っている。各発生源は同一 Epic #1093 Wave 4 case-close Step 10 Capture（F-003〜F-006）。

- F-003 IR-047 stale: `docs/specs/integrity-rule-catalog.md` L983-1000（IR-047）。description が「`src/opencode-local/` はローカル版生成時ソース領域」と書き、許容ディレクトリとして `case-schema/` を top-level に列挙。`triage_action` も「生成時ソース領域の構成に復元」と旧前提のまま。出典: `inbox/2026-06-23-epic1093-wave4-f003-ir047-req0141-004-stale.md`。
- F-004 DOC-MAP 旧用語: `docs/DOC-MAP.md` L53 の REQ-0141 coverage 列。「ローカル版生成方式、src/opencode-local/ 生成時ソース領域、変換プロンプト、生成安全性制約」と旧用語で記述。link mode、agentdev-gh-cli 差し替え、unlink/relink が未反映。出典: `inbox/2026-06-23-epic1093-wave4-f004-docmap-req0141-old-terms.md`。
- F-005 glossary 旧構成: `docs/guides/glossary.md` L91 の `src/opencode-local/` 定義。「ローカル版生成時ソース領域」と記述し、構成要素として `case-schema/` を top-level に列挙（実際は agentdev-gh-cli/ 配下）。出典: `inbox/2026-06-23-epic1093-wave4-f005-glossary-src-opencode-local-old-config.md`。
- F-006 consumer-project-setup 旧用語: `docs/guides/consumer-project-setup.md` L76, L117 が「ローカル版生成時ソース領域」「生成時ソース領域の実行エントリポイント」など旧用語を使用。link mode 導入方式への更新が必要。出典: `inbox/2026-06-23-epic1093-wave4-f006-consumer-project-setup-old-terms.md`。

4 点すべて Wave 4 PR #1101 と同一起源（REQ-0141 UPDATE、case-schema 吸収、link mode 統一）で、ADR-0126 から ADR-0131 への移行がコード・要件側で完了した後に文書側が取り残された状態。

## 影響

- 整合性検査の誤検知: IR-047 が `case-schema/` を top-level 許容ディレクトリとして残すため、`/repo/docs-check` が現行の正しい構成（case-schema は agentdev-gh-cli 配下）を違反として報告する恐れがある。
- 用語の二系統化: ADR-0131 が link mode（`.opencode/` 配下を src 配下へ接続）に統一したのに対し、ガイド類が生成方式（変換プロンプト、`generated_by` 保護、全削除再生成）を説明し続ける。読者がどちらが現行か判断できなくなる。
- 構成説明の不整合: glossary L91 と integrity-rule-catalog L983-1000 が `case-schema/` の位置を旧構成で記述するため、新規参加者が現物と文書を突き合わせたときに矛盾に直面する。
- DOC-MAP カバレッジの信頼性低下: ADR-0110 が DOC-MAP を採用判断の SSoT とするが、REQ-0141 行が旧用語では現在の SPEC 状態を反映しない。

影響範囲は自己ホストリポジトリ内の文書 4 ファイルと、それらを参照する docs-check / inspect-docs の検出結果。外部 consumer は link mode で導入するため、旧用語ガイドに従うと誤った手順を踏む可能性がある。

## 課題

ADR-0131 の link mode 統一と REQ-0141-004 の case-schema 吸収が確定したあとも、整合性ルール・ガイド・用語集・DOC-MAP の 4 箇所に ADR-0126 時代の「生成時ソース領域」「変換プロンプト」「`case-schema/` top-level」が残っている。文書側を ADR-0131 の語彙と構成へ一括で追従させること。

## 既存要件との関連

- ADR-0131（accepted）: link mode 統一、生成方式廃止、`generated_by` 保護廃止を決定。supersedes ADR-0126。
- ADR-0126（superseded by ADR-0131）: 生成方式と生成安全性制約を定義。文書側は本決定を前提とした記述のまま残置。
- REQ-0141-004: case-schema を agentdev-gh-cli 配下へ吸収する構成を定める（PR #1101 で更新済み）。文書側が未追従。
- REQ-0101（文書・REQ 管理基準）: 文書の現行根拠性を要求。017-026 が frontmatter・配置・整合性の基準。
- REQ-0108（docs-check / Validation）: 整合性ルールカタログと docs-check の検出設計。IR-047 の現行不整合は docs-check の健全性そのものを損なう。
- ADR-0110（DOC-MAP 採用判断）: DOC-MAP を採用判断の現行 SSoT とする。REQ-0141 行の旧用語は SSoT 性を損なう。
- SPEC `docs/specs/runtime-package-boundary.md`, `docs/specs/local-generation.md`, `docs/specs/local-transform.md`: ADR-0131 決定 #4 で transform/generation-flow 廃止候補と明記。文書側の旧用語はこれら SPEC の改廃判断にも影響する。

不足: ADR-0131 link mode 語彙への文書追用手順を明文化した SPEC・ガイドラインが存在しない。本件で得た語彙移行パターンを inspect-docs 検出辞書へ反映する検討も未実施。

## 整形の方向性

単一 RU として一括処理を推奨。4 点は同じ起源・同じ語彙移行・同じ検証方法（docs-check で再検出されないこと）を共有するため、分割すると手戻りとレビュー負荷が増える。

想定する RU 働き:

- 種別: docs_chore（文書の語彙・構成追従）。実装は文書編集のみ。
- 受入基準候補:
  - `docs/specs/integrity-rule-catalog.md` L983-1000 IR-047 を link mode 語彙へ書き換え、`case-schema/` を agentdev-gh-cli 配下として再記述、`triage_action` を現行構成へ更新。
  - `docs/DOC-MAP.md` L53 REQ-0141 coverage 列を link mode / agentdev-gh-cli 差し替え / unlink-relink で再記述。
  - `docs/guides/glossary.md` L91 `src/opencode-local/` 定義を link mode 表現に更新、`case-schema/` を agentdev-gh-cli 配下として記載。
  - `docs/guides/consumer-project-setup.md` L76, L117 を link mode 導入方式で再記述。
  - `/repo/docs-check` 実行で当該 4 箇所が再検出されないことを確認。
- 検証: docs-check と inspect-docs の両方で現行整合性が pass すること。
- 優先度目安: 中。docs-check の誤検知リスク（IR-047）と外部 consumer の誘導ミス（consumer-project-setup）を含むため、Wave 4 完了後の早期解消が望ましい。
- 後続展開: 本 RU 完了後、ADR-0126 系の SPEC（local-generation, local-transform）の廃止判断を別 RU で扱うこと。本 RU では SPEC 廃止には踏み込まない。
