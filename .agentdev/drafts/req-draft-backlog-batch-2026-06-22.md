---
draft_type: req_draft
topic_slug: backlog-batch-2026-06-22
status: spec_saved
created_at: 2026-06-22T18:50:00+09:00
saved_at: 2026-06-22T19:30:00+09:00
spec_saved_at: 2026-06-22T20:00:00+09:00
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
  - RU-0005
  - RU-0006
  - RU-0007
  - RU-0008
  - RU-0009
  - RU-0010
  - RU-0011
  - RU-0012
  - RU-0013
  - RU-0014
  - RU-20260622-03-hitl-boundary-promote-cleanup
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  2026-06-22 時点の backlog 15件の RU を関心領域ごとに4グループへ統合し、
  docs-check/integrity 運用是正（G1）・docs-check/integrity 検出設計改善（G2）・
  実行契約・委譲・プロセス設計（G3）・文書化規律・HITL 境界（G4）の4 REQ として要件定義した。
  Oracle 相談の結果（bg_4bf0be55, High 確信度）、3つの ADR 候補 RU（RU-0008/0010/20260622-03）は
  いずれも ADR 不要（運用手順・workflow 定義・文書化の範囲）と判定済み。
  artifact_actions は req 4件（新規作成）+ spec 4件（既存更新）。
  1回の case-auto で全 OU が処理可能な構造。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-G1-001
    content: |
      docs-check 機械検出による既知 NG（廃止REQ履歴マークなし参照・workflow否定表現残存・
      RFC2119マーカー残存・日本語品質違反・skill-category-gap未マッピング・backlog-reviewコマンド一覧漏れ・
      REQ範囲陳腐化）を横断是正し、docs-check ノイズを低減する（RU-0001）。
  - id: AG-G1-002
    content: |
      check_integrity.test.ts の fixture 経年劣化（既存5件赤 + valid fixture 7件 NG）を是正し、
      copyScripts 本採用環境下で fixture drift を自動検出するフックを要件化する（RU-0002）。
  - id: AG-G1-003
    content: |
      正規化 PR（#1014 Step再編・#1022 誤分類修正）のスコープ外残滓（QG-3/QG-4 references 旧Step番号・
      case-close G17/G19/G23 旧Step番号・Sisyphus-Junior(ulw-loop) 誤分類表記残存3箇所）をクリーンアップし、
      SPEC↔source 同期検査の恒久ルール化を行う（RU-0004）。
  - id: AG-G1-004
    content: |
      .agentdev/integrity/reports/ の .gitignore 未記載を是正し、README 設計判断と実装の乖離を解消する（RU-0007）。

  - id: AG-G2-001
    content: |
      IR-044 運用改善として、8REQ（0101/0104/0108/0114/0124/0126/0131/0136）の SPEC 詳細混入を解消し、
      委譲キーワードマッチの境界ケース（SPEC詳細内の委譲キーワード免除）を精緻化する（RU-0003）。
  - id: AG-G2-002
    content: |
      integrity-rule-catalog.md へ catalog↔実装双方向同期運用手順と docs-check 設計判断
     （項目役割範囲・対象ファイル設計・NGルール間依存関係マップ）を明文化し、
      repo-agentdev-integrity SKILL へ新カテゴリ追加判定フローを追加する（RU-0006）。
  - id: AG-G2-003
    content: |
      IR-050/051 の確定事項（語彙レジストリ確認・補充、「一定文字距離内」の具体閾値確定、
      3層検出構造責務分担の整理）を解消し、draft SPEC 参照リスト陳腐化を是正する（RU-0013）。
  - id: AG-G2-004
    content: |
      docs-check 偽陽性2件（case-run references checker のコンテキスト依存参照誤判定・
      worktree source-projection-sync 偽陽性）と完了条件 grep パターン設計ギャップ
      （否定文脈・anti-pattern 例示の捕捉）を是正する（RU-0014）。

  - id: AG-G3-001
    content: |
      oh-my-openagent CLI 起動スクリプト例の prompt 引数仕様を位置引数必須に正規化し、
      標準入力パイプ使用を禁止し、委譲プロンプト雛形へ Findings/Capture候補テンプレートを埋め込む（RU-0005）。
  - id: AG-G3-002
    content: |
      case-auto/open/close 工程間状態管理を整備する: case-open の draft/RU削除commit後即時push、
      case-auto 委譲契約 MUST NOT DO の精密化（実質的SPEC/REQ/ADR内容編集禁止・lifecycle状態遷移draft→acceptedは除く）、
      case-close の squash merge 後ローカル先行commit検出→reset 手順、git-common-procedures.md の squash merge 後分岐手順（RU-0008）。
  - id: AG-G3-003
    content: |
      委譲契約の実行主体分類表（adapter skill / command / subagent / harness）を req-define の必須項目化し、
      3層検出構造（機械=docs-check+IR / 意味=inspect-skills / 査読=doc-writing）の責務分担を SPEC 化し、
      agentdev-doc-writing SKILL へ査読観点横断適用指針を追加する（AG-014機能変更禁止準拠・文書化のみ）（RU-0010）。
  - id: AG-G3-004
    content: |
      Epic Wave における前工程完了度（完全完了/検証のみ/補完あり）3段階分類を定義し、
      case-open で子Issue本文に属性を埋め込み、subagent-protocol で属性応答振る舞い指針を明示する（RU-0011）。
  - id: AG-G3-005
    content: |
      command-authoring SKILL へ「サブセクション化 vs リスト1行追記」判断基準を明示し、
      バッチIssue運用でOUごとの完了判定追跡性を改善する（sub-issue分離または完了判定表）（RU-0012）。

  - id: AG-G4-001
    content: |
      artifact-responsibilities SPEC（またはdocument-model SPEC）へ SKILL↔command 同一ルール重複の
      許容条件・一方向参照切替基準・同期ルール（正の情報源・参照先明示）を追加し、
      AGENTS.md 編集ガードレールへ新旧REQ適用運用ルールを追記する（RU-0009）。
  - id: AG-G4-002
    content: |
      promote/review 系コマンド（learning-promote/intake-promote/backlog-review）の HITL を「判断の確定」に限定し、
      判断確定後の保存・移動・prune・削除・commit/push は条件明確時自動実行する。
      ただし破壊的変更・未コミット変更・矛盾解消・要件仕様スコープ変更・古い単発レアケース削除は明示承認を維持する（RU-20260622-03）。

artifact_actions:
  # ===== REQ 操作（4件・新規作成） =====
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:docs-check-integrity-remediation
    source_items: [AG-G1-001, AG-G1-002, AG-G1-003, AG-G1-004]
    content: |
      ## 目的

      docs-check 機械検出により継続報告されている既知 NG を横断是正し、
      check_integrity.test.ts fixture 経年劣化を解消し、正規化 PR のスコープ外残滓をクリーンアップし、
      .agentdev/integrity/reports/ の git 管理状態を README 設計判断と一致させることで、
      docs-check ノイズを一括低減し検証基盤の信頼性を回復する。

      ## 要件

      | ID | 要件 |
      |----|------|
      | REQ-NEW-001 | 現行文書は廃止 REQ を履歴マーキングなしに参照しない（REQ-0101-016 準拠の徹底） |
      | REQ-NEW-002 | 現行文書に workflow 否定表現（"not X" 形式）を含めない（REQ-0112 廃止 6状態否定表現の除去） |
      | REQ-NEW-003 | 現行文書に RFC2119 マーカー（MUST/SHOULD 等）を含めない（REQ-0122 廃止準拠） |
      | REQ-NEW-004 | docs 配下の日本語品質は REQ-0101-061・REQ-0140-003 に準拠する（英語混じり・不適切カタカナ語・文体不統一の排除） |
      | REQ-NEW-005 | check_integrity.ts の category-to-check-pattern map は定義済み category を全て網羅する（skill-category-gap の解消） |
      | REQ-NEW-006 | docs/specs/system.md のコマンド一覧は全 agentdev コマンドを網羅する（backlog-review 含む） |
      | REQ-NEW-007 | docs/guides/*.md の REQ 範囲表記は実 REQ 最大番号に追従する（REQ-0143 時点まで反映） |
      | REQ-NEW-008 | scripts/tests/check_integrity.test.ts の fixture は最新 check_integrity.ts ルールに追従する（既存5件赤 + valid fixture 7件 NG の解消） |
      | REQ-NEW-009 | copyScripts 本採用環境下で fixture drift を自動検出する仕組みが存在する |
      | REQ-NEW-010 | QG-3/QG-4 references（qg-3-implementation-deviation.md・qg-4-final-acceptance.md）は現行 case-run Step 番号を参照する |
      | REQ-NEW-011 | case-close.md ガードレール（G17/G19/G23）は現行 Step 番号を参照する |
      | REQ-NEW-012 | 文書に "Sisyphus-Junior(ulw-loop)" 形式の誤分類表記を含めない（/ulw-loop は command であり skill ではない） |
      | REQ-NEW-013 | SPEC↔source 同期検査は "Sisyphus-Junior\(ulw-loop\)" パターンを恒久的に検出する |
      | REQ-NEW-014 | .agentdev/integrity/reports/ は git 管理対象外である（.gitignore で除外） |

      ## 適用範囲

      **対象**: docs/ 配下の文書是正、AGENTS.md の REQ 範囲表記、scripts/tests/check_integrity.test.ts fixture、.gitignore、QG-3/QG-4 references、case-close.md ガードレール、docs/specs/system.md コマンド一覧
      **対象外**: check_integrity.ts 本体の機能変更（G2 で扱う）、新規検出ルールの設計（G2 で扱う）、retired REQ の復活

  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: new:docs-check-integrity-detection-design
    source_items: [AG-G2-001, AG-G2-002, AG-G2-003, AG-G2-004]
    content: |
      ## 目的

      IR-044 運用の成熟（既存REQ SPEC詳細混入の解消・境界ケース精緻化）、
      integrity-rule-catalog.md への設計判断・運用手順の明文化、
      IR-050/051 の確定事項（語彙レジストリ・閾値・3層検出構造責務分担）の解消、
      docs-check 偽陽性の是正により、機械検出の精度と設計透明性を向上する。

      ## 要件

      | ID | 要件 |
      |----|------|
      | REQ-NEW-001 | 現行 REQ（REQ-0101/0104/0108/0114/0124/0126/0131/0136）は Step 番号・fixture・enum 等 SPEC 詳細を要件行に混入させない（IR-044 基準の徹底） |
      | REQ-NEW-002 | IR-044 の委譲キーワードマッチは SPEC 詳細記述内の委譲キーワードを境界ケースとして免除する（false negative の抑制） |
      | REQ-NEW-003 | docs/specs/integrity-rule-catalog.md は catalog↔実装双方向同期運用手順（削除時・復活時の baseline_status 変更ルール）を含む |
      | REQ-NEW-004 | docs/specs/integrity-rule-catalog.md は docs-check 項目役割範囲（バックエンド対象 vs skill定義対象）・対象ファイル設計（.mdのみ・正当使用例外）・NG ルール間依存関係マップを明文化する |
      | REQ-NEW-005 | repo-agentdev-integrity SKILL は新カテゴリ追加判定フロー（既存 NG への副作用評価→追加可否）を含む |
      | REQ-NEW-006 | IR-050（load_skills 誤指定検出）・IR-051（実行主体 skill 表記誤認検出）は語彙レジストリの存在確認・補充後に適用される |
      | REQ-NEW-007 | IR-051 の「一定文字距離内」は具体閾値（文字数・行数）が確定されている |
      | REQ-NEW-008 | IR-050/051 の機械的検出・意味的診断（inspect-skills）・査読時観点（doc-writing）の3層検出構造責務分担が SPEC 化されている |
      | REQ-NEW-009 | draft SPEC（agentdev-doc-writing.md・agentdev-inspect-skills.md）の参照リストは実ファイル references 構成に追従する |
      | REQ-NEW-010 | case-run references checker はコンテキスト依存参照（スキル内 references 等）を正しく解決する（reference-path-existence 偽陽性の解消） |
      | REQ-NEW-011 | 完了条件 grep パターンは否定文脈・anti-pattern 例示を「未達」として捕捉しない（除外条件・スコープ段階化） |

      ## 適用範囲

      **対象**: integrity-rule-catalog.md、IR-044/050/051、case-run references checker、完了条件 grep パターン、draft SPEC 参照リスト、8REQ の SPEC 詳細移行先
      **対象外**: check_integrity.ts 本体の機能変更（RU-0006 は文書化のみを宣言）、既存 REQ の個別 SPEC 詳細移行作業（case-run で対応）

  - id: ACT-REQ-003
    artifact: req
    operation: create
    target: new:execution-contract-delegation-process
    source_items: [AG-G3-001, AG-G3-002, AG-G3-003, AG-G3-004, AG-G3-005]
    content: |
      ## 目的

      oh-my-openagent CLI 引数仕様正規化、case-auto/open/close 工程間状態管理の構造的改善、
      委譲契約分類表の SPEC 化、Epic Wave 前工程完了度の導入、バッチ Issue 運用改善により、
      実行契約・委譲・プロセス設計の信頼性と追跡性を向上する。

      ## 要件

      | ID | 要件 |
      |----|------|
      | REQ-NEW-001 | references/oh-my-openagent.md の起動スクリプト例は prompt 位置引数形式を使用する（標準入力パイプ禁止） |
      | REQ-NEW-002 | references/oh-my-openagent.md の委譲プロンプト雛形は「## Findings / Capture候補」（### intake / ### learning）テンプレートを含む |
      | REQ-NEW-003 | case-open は draft/RU 削除 commit 後に即時 push する（case-run 引き継ぎでの pull 失敗防止） |
      | REQ-NEW-004 | case-auto 委譲契約 MUST NOT DO は「実質的 SPEC/REQ/ADR 内容編集禁止（lifecycle 状態遷移 draft→accepted は除く）」である |
      | REQ-NEW-005 | case-close は squash merge 後ローカル先行 commit を検出し、内容重複確認後に reset する（git pull --ff-only 失敗の防止） |
      | REQ-NEW-006 | git-common-procedures.md は squash merge 後分岐ハンドリング手順（log/diff/reset）を含む |
      | REQ-NEW-007 | req-define は実行主体分類表（adapter skill / command / subagent / harness）を必須項目として含む |
      | REQ-NEW-008 | 3層検出構造（機械=docs-check+IR / 意味=inspect-skills / 査読=doc-writing）の責務分担が SPEC 化されている |
      | REQ-NEW-009 | agentdev-doc-writing SKILL は査読観点の横断適用指針を含む |
      | REQ-NEW-010 | epic-wave-model.md は OU 属性「前工程完了度: 完全完了/検証のみ/補完あり」3段階分類を定義する |
      | REQ-NEW-011 | case-open は子 Issue 本文に「前工程完了度」属性を埋め込む |
      | REQ-NEW-012 | subagent-protocol.md は前工程完了度に応じた振る舞い指針（検証のみでも acceptance criteria 順位検証は必須等）を明示する |
      | REQ-NEW-013 | command-authoring SKILL は「サブセクション化 vs リスト1行追記」の判断基準（情報量・独立性・将来拡張見込み）を明示する |
      | REQ-NEW-014 | バッチ Issue 運用は OU ごとの完了判定追跡性を確保する（sub-issue 分離または Issue 本体の完了判定表） |

      ## 適用範囲

      **対象**: delegation-contracts.md、case-open/case-close/case-auto command SPEC、epic-wave-model.md、subagent-protocol.md、command-authoring SKILL、agentdev-doc-writing SKILL、references/oh-my-openagent.md、git-common-procedures.md
      **対象外**: case-run 実行モデル本体（ADR-0128）、subagent 起動方式の変更（task()委譲モデル不変）、QG-3/QG-4 Gate 仕様の変更

  - id: ACT-REQ-004
    artifact: req
    operation: create
    target: new:documentation-discipline-hitl-boundary
    source_items: [AG-G4-001, AG-G4-002]
    content: |
      ## 目的

      SKILL↔command 同一ルール重複許容基準と新旧 REQ 適用運用ルールを文書化し、
      promote/review 系コマンドの HITL 境界を「判断の確定」に限定して後処理を自動化することで、
      文書化規律の整合性と promote 系コマンドの自走性を向上する。

      ## 要件

      | ID | 要件 |
      |----|------|
      | REQ-NEW-001 | artifact-responsibilities SPEC（または document-model SPEC）は SKILL↔command 同一ルール重複の許容条件・一方向参照切替基準・同期ルール（正の情報源・参照先明示）を定義する |
      | REQ-NEW-002 | AGENTS.md 編集ガードレールは「新ガイドライン（要件行記述基準・HOW除去等）は新規 REQ から適用・既存 REQ は別途整備 Issue がない限り現状維持」の運用ルールを含む |
      | REQ-NEW-003 | promote/review 系コマンド（learning-promote/intake-promote/backlog-review）は HITL を「判断の確定」に限定する |
      | REQ-NEW-004 | 判断確定後の保存・移動・prune・削除・commit/push は、対象範囲・保存先・除外条件・証跡保存条件が明確な場合、自動実行する |
      | REQ-NEW-005 | 破壊的変更・未コミット変更・矛盾解消・要件仕様スコープ変更・古い単発レアケース削除は明示承認を維持する |
      | REQ-NEW-006 | learning-promote は判定・処分承認後、staged/rejected/duplicate を追加確認なしで prune する（staged は根拠が採用済み成果物に保存済み、duplicate/rejected は判定理由が記録済みを条件とする） |
      | REQ-NEW-007 | learning-promote は deferred/未処理を prune しない |
      | REQ-NEW-008 | intake-promote は分類承認後の promoted 保存・archive 移動・commit/push を追加確認なしで実行する（分類未確定・修正中は進まない） |
      | REQ-NEW-009 | backlog-review は矛盾なしの場合、統合・分割判定承認を RU 生成承認として扱い、矛盾検出時のみ追加判断を求める |

      ## 適用範囲

      **対象**: artifact-responsibilities SPEC、AGENTS.md 編集ガードレール、learning-promote/intake-promote/backlog-review command SPEC
      **対象外**: case-close の docs/SPEC 確認削減、case-run の worktree cleanup 確認削減、inspect-promote --auto の挙動変更、learning-capture の自律保存挙動変更、古い単発レアケース prune の自動化、deferred/未処理 item の自動削除

  # ===== SPEC 操作（4件・既存更新） =====
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/workflows/delegation-contracts.md
    source_items: [AG-G3-002, AG-G3-003, AG-G3-004]
    content: |
      ## delegation-contracts.md 更新内容

      ### case-auto 委譲契約 MUST NOT DO 精密化
      case-auto の MUST NOT DO を「実質的 SPEC/REQ/ADR 内容編集禁止（lifecycle 状態遷移 draft→accepted は除く）」へ精密化。
      状態遷移に該当する操作の列挙（draft frontmatter status 更新等）と、内容編集に該当する操作の列挙を判定表として明記。

      ### 実行主体分類表テンプレート（必須項目化）
      req-define 委譲契約セクションに実行主体分類表（adapter skill / command / subagent / harness）を必須テンプレートとして組み込む。
      ADR-0107 の成果物種別（command/skill/template/script）とは直交する分類軸である旨を明記。

      ### case-open push タイミング手順
      case-open の draft/RU 削除 commit 後に即時 push する手順を追加。

      ### 前工程完了度属性
      case-open が子 Issue 本文に「前工程完了度: 完全完了/検証のみ/補完あり」を埋め込む手順を追加。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/integrity-contracts.md
    source_items: [AG-G2-002, AG-G2-003, AG-G3-003]
    content: |
      ## integrity-contracts.md 更新内容

      ### 3層検出構造の責務分担明文化
      機械的検出（docs-check + IR）・意味的診断（inspect-skills）・査読時観点（doc-writing）の3層検出構造の責務分担を明文化。
      各層が何を検出し、何を他層に委ねるかを整理。

      ### IR-050/051 適用条件
      IR-050（load_skills 誤指定検出）・IR-051（実行主体 skill 表記誤認検出）の適用条件（語彙レジストリ確認後）と閾値（文字距離・行数）を記載。

      ### catalog↔実装双方向同期運用
      catalog 定義削除時（実装も削除 or baseline_status resolved）・実装削除時（catalog baseline_status resolved）・実装復活時（catalog baseline_status new）の同期ルールを記載。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/workflows/epic-wave-model.md
    source_items: [AG-G3-004]
    content: |
      ## epic-wave-model.md 更新内容

      ### 前工程完了度3段階分類
      OU 属性「前工程完了度」を追加:
      - 完全完了: req-save/spec-save 前工程で実施済み・追加作業不要
      - 検証のみ: 前工程完了を前提・acceptance criteria 順位検証のみ実施
      - 補完あり: 前工程に残余あり・補完実装の可能性

      既存 Issue 状態 enum（pending/ready/running/completed/blocked/failed）とは直交分類として追加。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/artifact-responsibilities.md
    source_items: [AG-G4-001]
    content: |
      ## artifact-responsibilities.md 更新内容

      ### SKILL↔command 同一ルール重複許容基準
      SKILL↔command 間で同一ルールを両方に記載することが正当な場合の許容条件:
      - 両方の利用者が独立して参照する場合
      - 片方の削除でもう片方が参照不能になる場合

      一方向参照に切り替える基準（正の情報源・参照先明示）と、許容時の同期ルールを記載。

conflict_resolutions:
  - id: CR-001
    conflict: 15件の RU を1つの要件 doc に統合すると要件行数が SPLIT 閾値（51行）を超える肥大化リスク
    resolution: |
      4グループに統合し各グループを1 REQ（14/11/14/9 要件行）として作成。
      各 REQ の SPLIT シグナルは要件行数 0-50（+0）または関心分類 2+（+1）の範囲に収まり、
      合計シグナル 0-1 で APPEND 許容範囲内。ユーザー合意（選択肢4 + auto-case 全処理）に基づく。
  - id: CR-002
    conflict: RU-0008/0010/20260622-03 が ADR 候補（Step 5-4 ADR要否確認ゲート）
    resolution: |
      Oracle 相談（bg_4bf0be55, High確信度）の結果、3RU とも ADR 不要と判定。
      RU-0008: 運用手順 + 委譲契約内容精密化（ADR-0127/0128委譲モデル不変）。
      RU-0010: 明示的に文書化のみ（実装変更なし）。
      RU-20260622-03: retired ADR-0010 廃止理由（workflow方針・技術判断不含）が直接適用、REQ-0104 + SPEC対応。
  - id: CR-003
    conflict: AGENTS.md の REQ 範囲表記（〜REQ-0142）と実ファイル最大（REQ-0143）の乖離
    resolution: |
      Step 4-1 定量的データ検証で検出。本乖離は RU-0001（REQ範囲陳腐化）の対象として G1 REQ-A REQ-NEW-007 に含める。
      新規 REQ は REQ-0144 から採番（max+1=143+1=144）。AGENTS.md の範囲表記更新は G1 の case-run で対応。

operation_units:
  - ou_id: OU-001
    source_ru: [RU-0001, RU-0002, RU-0004, RU-0007]
    target_req: new:docs-check-integrity-remediation
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs: [REQ-0144]
      req_doc_paths: [docs/requirements/REQ-0144.md]
      req_title: "docs-check/integrity 運用是正"
      artifact_action_mapping:
        ACT-REQ-001: REQ-0144
      source_ru_mapping:
        RU-0001: { target_req: REQ-0144, source_item: AG-G1-001 }
        RU-0002: { target_req: REQ-0144, source_item: AG-G1-002 }
        RU-0004: { target_req: REQ-0144, source_item: AG-G1-003 }
        RU-0007: { target_req: REQ-0144, source_item: AG-G1-004 }
      operation_result: created

  - ou_id: OU-002
    source_ru: [RU-0003, RU-0006, RU-0013, RU-0014]
    target_req: new:docs-check-integrity-detection-design
    target_spec: docs/specs/integrity-contracts.md
    operation: create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_reqs: [REQ-0145]
      req_doc_paths: [docs/requirements/REQ-0145.md]
      req_title: "docs-check/integrity 検出設計改善"
      artifact_action_mapping:
        ACT-REQ-002: REQ-0145
      source_ru_mapping:
        RU-0003: { target_req: REQ-0145, source_item: AG-G2-001 }
        RU-0006: { target_req: REQ-0145, source_item: AG-G2-002 }
        RU-0013: { target_req: REQ-0145, source_item: AG-G2-003 }
        RU-0014: { target_req: REQ-0145, source_item: AG-G2-004 }
      pending_spec_save:
        - artifact_action: ACT-SPEC-002
          target_spec: docs/specs/integrity-contracts.md
      operation_result: created

  - ou_id: OU-003
    source_ru: [RU-0005, RU-0008, RU-0010, RU-0011, RU-0012]
    target_req: new:execution-contract-delegation-process
    target_spec: [docs/specs/workflows/delegation-contracts.md, docs/specs/workflows/epic-wave-model.md]
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs: [REQ-0146]
      req_doc_paths: [docs/requirements/REQ-0146.md]
      req_title: "実行契約・委譲・プロセス設計"
      artifact_action_mapping:
        ACT-REQ-003: REQ-0146
      source_ru_mapping:
        RU-0005: { target_req: REQ-0146, source_item: AG-G3-001 }
        RU-0008: { target_req: REQ-0146, source_item: AG-G3-002 }
        RU-0010: { target_req: REQ-0146, source_item: AG-G3-003 }
        RU-0011: { target_req: REQ-0146, source_item: AG-G3-004 }
        RU-0012: { target_req: REQ-0146, source_item: AG-G3-005 }
      pending_spec_save:
        - artifact_action: ACT-SPEC-001
          target_spec: docs/specs/workflows/delegation-contracts.md
        - artifact_action: ACT-SPEC-003
          target_spec: docs/specs/workflows/epic-wave-model.md
      operation_result: created

  - ou_id: OU-004
    source_ru: [RU-0009, RU-20260622-03-hitl-boundary-promote-cleanup]
    target_req: new:documentation-discipline-hitl-boundary
    target_spec: docs/specs/artifact-responsibilities.md
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs: [REQ-0147]
      req_doc_paths: [docs/requirements/REQ-0147.md]
      req_title: "文書化規律・HITL境界"
      artifact_action_mapping:
        ACT-REQ-004: REQ-0147
      source_ru_mapping:
        RU-0009: { target_req: REQ-0147, source_item: AG-G4-001 }
        RU-20260622-03-hitl-boundary-promote-cleanup: { target_req: REQ-0147, source_item: AG-G4-002 }
      pending_spec_save:
        - artifact_action: ACT-SPEC-004
          target_spec: docs/specs/artifact-responsibilities.md
      operation_result: created

case_open_hints:
  epic_needed: true
  decomposition: |
    4 OU（4 REQ + 4 SPEC 更新）。case-open は4 REQ を自動 Epic 化し、
    depends_on に基づく Wave 構成で子 Issue を配置する。
    OU-001/OU-003/OU-004 は depends_on 空で独立（Wave 1 候補）。
    OU-002 は OU-001 に依存（Wave 2 候補・G1 是正後に G2 設計改善を適用する方が安全）。
  wave_hints:
    - wave: 1
      ous: [OU-001, OU-003, OU-004]
      rationale: "独立 OU（depends_on 空）。docs-check是正・実行契約設計・HITL境界は並列実行可能"
    - wave: 2
      ous: [OU-002]
      rationale: "OU-001（G1是正）完了後に実施。IR-050/051 適用前に既存NGを解消するため"

spec_save:
  consumed_at: 2026-06-22T20:00:00+09:00
  consumed_artifact_actions:
    - id: ACT-SPEC-001
      target: docs/specs/workflows/delegation-contracts.md
      operation: update
      result: consumed
    - id: ACT-SPEC-002
      target: docs/specs/integrity-contracts.md
      operation: update
      result: consumed
    - id: ACT-SPEC-003
      target: docs/specs/workflows/epic-wave-model.md
      operation: update
      result: consumed
    - id: ACT-SPEC-004
      target: docs/specs/artifact-responsibilities.md
      operation: update
      result: consumed
```

# summary

2026-06-22 backlog 15件の RU を関心領域で4グループに統合した要件定義。

- **G1（docs-check/integrity 運用是正）**: RU-0001/0002/0004/0007 → REQ-A（14要件行）
- **G2（docs-check/integrity 検出設計改善）**: RU-0003/0006/0013/0014 → REQ-B（11要件行）
- **G3（実行契約・委譲・プロセス設計）**: RU-0005/0008/0010/0011/0012 → REQ-C（14要件行）
- **G4（文書化規律・HITL境界）**: RU-0009/20260622-03 → REQ-D（9要件行）

Oracle 相談（bg_4bf0be55）で ADR 候補3件（RU-0008/0010/20260622-03）は全て ADR 不要と判定（High確信度）。retired ADR-0010 の廃止理由（workflow方針・技術判断不含）が直接適用される。

1回の case-auto で OU-001/003/004（Wave 1・並列）→ OU-002（Wave 2）の順で全処理可能。
