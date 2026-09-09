---
draft_type: req_draft
topic_slug: textlint-corpus-correction-campaign
status: saved
created_at: 2026-09-09T20:24:13+09:00
---

# draft-data

```yaml
work_type: maintenance

summary: >-
  docs/ と src/ 配下の全配布 Markdown（node_modules と歴史記録を除く504ファイル）を対象に、textlint 品質契約（REQ-053、
  DEC-028、textlint 品質基盤 Design）に従った規則校正・正式初期判定・是正・最終HEAD再検証の完全形キャンペーンを実行する。
  あわせて検査対象を src 配布物すべて（plugins・tools・opencode-local の9ファイル追加）へ恒久拡張し、
  歴史記録（docs/requirements/retired/ 11件・docs/reports/ 27件）を対象解決の機構固定除外（node_modules と同じ既定除外枠組み、加算優先）として
  恒久除外する契約整備（REQ-053 更新・Design 更新・DEC-028 範囲明確化）を含む。

# auto_gate 上書き記録: 2026-09-09T20:32+09:00 ユーザーが case-auto（最大自走モード）を明示指定し「自走を強行する」を選択。
# 元 stop_reasons の取扱い: (1) Wave 単位の実行管理は case-auto 自身の Wave 反復制御で実現する。
# (2) blocked 時のユーザー判断は実行時停止条件として維持し、blocked 発生時に停止して判断を求める。
# 監査用に元 stop_reasons 本文をコメントで保全する（スキーマ解釈に影響しない）:
#   - "大規模多段キャンペーン（契約整備→校正→正式初期判定→是正→最終検証）であり、Wave 単位の実行管理が適するため case-auto 自走の対象としない"
#   - "是正で意味を一義的に復元できない箇所の blocked 記録が生じた場合はユーザー判断が必要（REQ-053-013）"
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      textlint 確認・是正を規則校正から最終検証までの完全形で実行する。対象全体（対象解決後の全ファイル）で実測と誤検出確認による
      規則校正を行い、規則ごとの option と severity（拒否対象／助言対象）を確定して規則と依存版を固定した後、正式初期判定を行う。
      正式初期判定以降は同じ規則で是正と最終判定を行い、規則緩和による既知違反の合格扱いは行わない（REQ-053-037/038、
      Design「規則校正と移行検証」準拠）。拒否対象への規則昇格は DEC-001 決定4の7条件の証拠に基づいて判定し、
      証拠を欠く規則は昇格しない。助言対象のまま残す規則の指摘は是正完了の必須条件としない（完了条件は拒否対象違反ゼロのみ）。
      本リポジトリの現行ベースライン（2026-09-09 実測）は解決対象533ファイル、拒否対象違反ゼロ、助言対象指摘9,559件／484ファイルである。
  - id: AG-002
    content: >-
      textlint 検査対象を src 配布物すべてへ恒久拡張する。追加対象は src/opencode/plugins/**/README.md（4件）、
      src/opencode/tools/**/README.md（2件）、src/opencode-local/**/*.md（3件）の9ファイルであり、
      ADF 本体設定（.agentdev/config/plugins/agentdev-textlint-guard.yaml の additional_targets）への列挙型 glob 加算と、
      Design「Plugin 設定」の ADF 本体追加設定記述の更新で対応する。node_modules 配下（src 配下に487 Markdown ファイル）は
      依存成果物として対象解決の機構側既定除外とし、対象解決後の総数は504ファイルである。
      ルート直下の README.md と AGENTS.md はユーザー指示の対象範囲（docs/ と src/ 配下）に含まれないため対象外とする。
  - id: AG-003
    content: >-
      歴史記録（docs/requirements/retired/ 配下11ファイル、docs/reports/ 配下27ファイル）を textlint 検査対象・是正対象から
      恒久除外する。除外はプロジェクト設定の新設ではなく対象解決の機構固定の既定除外パターン（node_modules と同じ枠組み）として
      Design が列挙を所有し、加算設定が既定除外に優先する解決順を定める。これに伴い Design「規則校正と移行検証」の
      「歴史文書は対象から除外せず」方針を転換し、校正 corpus から歴史記録を除外する。REQ-053 は歴史記録の扱いを新規要件行として
      定義し、歴史記録は事実と識別子を保持し是正しない（REQ-053-036 との整合）。REQ-053-013 の「既存配布物」は
      src/opencode 配下の配布物であり docs の歴史記録を含まないため、REQ-053-013/029 の文言変更は不要である。
      DEC-028（proposed）の「拒否対象の違反を持つ既存文書」の範囲も今回の明確化に合わせて更新する。
  - id: AG-004
    content: >-
      是正は文章表層品質のみとし、REQ-053-013 の変更禁止事項（責務・振る舞い・処理順序・状態遷移・入出力契約・API/CLI 契約・
      ファイル形式・識別子・状態値・停止条件・安全制約・外部依存の変更禁止）を遵守する。意味を一義的に復元できない箇所は
      推測で修正して合格扱いにせず、blocked として記録しユーザーの判断を得る。是正編集はファイル単位で完結させ、
      中間状態で拒否対象違反を残さない編集粒度で行う。AUTOGEN ブロック内の文が違反を含む場合は当該ブロックを直接編集せず
      生成側（index 自動生成）を修正する。Windows 環境の文字コード安全手順（edit ツール優先、PowerShell 標準 cmdlet による
      既存 UTF-8/LF ファイル一括読み書き禁止、REQ-057-021）を遵守する。
  - id: AG-005
    content: >-
      完了判定は REQ-053-014〜021 の完了証拠契約に従う。最終 HEAD から読み直した実ファイル全文を gate.ts（単独実行入口）で
      再検証し、解決対象全件の拒否対象違反ゼロ（終了コード0）を確認する。ファイル単位の完了証拠（ファイルパス、初期判定、修正有無、
      確認した品質観点、最終判定、残存不備、blocked の判断必要事項）を全対象分保持し、初期状態と最終状態の
      不合格ファイル数・既知不備数・決定的破損数の比較を含める。移行結果と測定証拠は実行記録として docs/reports/ へ保存し、
      設計本文へ実測値を混在させない。配布物 Markdown を変更するため IR-055 既知 delta baseline の鮮度確認と
      再生成（REQ-057-024）を完了判定に含める。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-053.md
    source_items: [AG-002]
    content: |
      適用範囲「対象」欄の更新（「ADF 配布 command と skill の本文」を次の文言へ一般化する）:
      「ADF 配布物の Markdown（command、skill、plugin、tool、ローカル版の本文と README）」
      これに伴い docs/reports/ の実行記録保存（AG-005）は検査対象外の歴史記録領域への保存であり、
      検査対象とはしない旨を「対象外」欄に追記する:「docs/requirements/retired/ と docs/reports/ の歴史記録（REQ-053 の新規行による定義に基づく）」
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-053.md
    source_items: [AG-003]
    content: |
      新規要件行（req-save が採番する。本文案）:
      「歴史記録（廃止済み要件 docs/requirements/retired/ 配下と監査・実行記録 docs/reports/ 配下）は文章表層品質検査の対象外とし、
      是正対象としないこと。歴史記録は事実と識別子を保持する（REQ-053-036）。除外は対象解決の機構固定の既定除外として
      Design が所有し、プロジェクト設定の加算が既定除外に優先すること」
  - id: ACT-DEC-001
    artifact: decision
    operation: update
    target: docs/decisions/DEC-028.md
    source_items: [AG-003]
    content: |
      DEC-028（status: proposed のため直接更新可）の「結果と影響」節にある
      「拒否対象の違反を持つ既存文書は固定した規則の下で是正が必要になる。」に続けて範囲を明確化する一文を追記する:
      「検査対象は現行文書と配布物の Markdown であり、歴史記録（廃止済み要件と監査・実行記録）は対象外とする。」
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/quality/textlint-quality-runtime.md
    target_area: プロジェクトと対象の解決
    source_items: [AG-002, AG-003]
    content: |
      「プロジェクトと対象の解決」節に対象解決の既定除外を追記する:
      対象解決は機構固定の既定除外パターン（**/node_modules/**、docs/requirements/retired/**、docs/reports/**）を
      標準対象と追加対象の解決結果から除外する。node_modules は依存成果物として、歴史記録サブツリーは ADF の文書配置規約
      （廃止済み要件と Report の分離）に基づく歴史記録として除外する。追加対象（加算設定）は既定除外に優先し、
      導入先が同じパスを現行文書として使う場合は明示的な加算で検査対象に含められる。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/quality/textlint-quality-runtime.md
    target_area: Plugin 設定
    source_items: [AG-002]
    content: |
      「Plugin 設定」節の ADF 本体の追加設定を次へ更新する:
      src/opencode/commands/**/*.md、src/opencode/skills/**/*.md、src/opencode/plugins/**/README.md、
      src/opencode/tools/**/README.md、src/opencode-local/**/*.md。
      この違いを Plugin 内のリポジトリ判定分岐や Skill extension に書かない方針は維持する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/quality/textlint-quality-runtime.md
    target_area: 規則校正と移行検証
    source_items: [AG-003]
    content: |
      「規則校正と移行検証」節の「歴史文書は対象から除外せず、事実を保持できる規則条件と severity を校正段階で扱う。」を
      次の方針へ転換する:
      「歴史記録（廃止済み要件と監査・実行記録）は対象解決の既定除外により検査対象から除外する。校正 corpus は対象解決後の
      現行文書と配布物で構成する。歴史記録は事実と識別子を保持し是正しない。」

conflict_resolutions:
  - id: CR-001
    conflict: 現行の拒否対象（hard）違反は既にゼロのため、「是正」の実質が助言9,559件の扱いで決まる
    resolution: >-
      完全形（規則校正→正式初期判定→是正→最終検証）を採用（ユーザー合意 2026-09-09）。根拠は REQ-053-037/038 と
      Design「規則校正と移行検証」。完了条件は拒否対象違反ゼロのみとし、助言指摘の是正を必須にしない。
  - id: CR-002
    conflict: src 配下の対象範囲（現行契約は commands と skills のみ）
    resolution: >-
      src 配布物すべて（plugins・tools・opencode-local の9ファイル追加）を恒久対象化（ユーザー合意 2026-09-09）。
      additional_targets 加算と Design 更新で対応。node_modules 487ファイルは機構側既定除外。
  - id: CR-003
    conflict: Design は「歴史文書は対象から除外せず」と明記（accepted、2026-09-09）
    resolution: >-
      歴史記録（retired 11件・reports 27件）を恒久除外（ユーザー合意 2026-09-09）。機構固定の既定除外として実装し、
      Design の方針転換と REQ-053 新規行で契約を更新する。除外機構のプロジェクト設定スキーマ拡張（excluded_targets）は
      REQ-053-029・fail-closed・設定スキーマ最小主義と緊張するため不採用。運用のみの除外は REQ-053-032/038 の
      完了判定と構造的に衝突するため不採用（アーキテクチャ助言 2026-09-09、方式(b) 採用）。
  - id: CR-004
    conflict: ルート直下 README.md・AGENTS.md を追加対象に含めるか（助言の確認事項）
    resolution: >-
      対象外。ユーザー指示が「docs/ および src/ 配下」に明示限定されているため、指示文言に従う。

operation_units:
  - ou_id: OU-001
    target_req: REQ-053
    target_design: docs/designs/quality/textlint-quality-runtime.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      規則校正の実行記録を確認する。規則ごとの option・severity・誤検出確認結果・拒否対象へ昇格した規則の7条件の証拠が
      すべて残っていること。校正完了時点の規則構成と依存版の固定記録、正式初期判定の実行記録、最終検証の実行記録を突合し、
      初期判定と最終検証が同一規則で実行されていることを確認する。
    pass_criteria: |
      全採用規則について校正記録（option・severity・誤検出確認・7条件証拠のいずれか）が存在し、
      昇格規則すべてに7条件の証拠があること。正式初期判定と最終検証の規則構成ハッシュ（または版記録）が一致すること。
    on_failure: |
      fix-and-reverify。証拠を欠く昇格規則は助言対象へ戻して校正をやり直す。規則が初期判定後に変わっていた場合は
      最終検証を同一規則で再実行する（REQ-053-037 違反の是正）。
  - id: TS-002
    target_item: AG-001
    verification: |
      最終 HEAD から bun run src/opencode/plugins/agentdev-textlint-guard/gate.ts --root . --json を実行する。
      終了コードと解決対象全件の拒否対象違反数を確認する。初期状態（2026-09-09 ベースライン: 解決対象533ファイル・
      拒否対象違反ゼロ・助言9,559件）と最終状態の不合格ファイル数・既知不備数・決定的破損数を比較する。
    pass_criteria: |
      終了コード0、解決対象全件の拒否対象違反ゼロ。初期に不合格があった項目は減少して最終ゼロ、初期ゼロの項目はゼロを維持
      （REQ-053-020/038）。
    on_failure: |
      fix-and-reverify。残存違反ファイルを是正して再検証する。検査不能（fail-closed 不合格）は原因解消後に再実行する。
  - id: TS-003
    target_item: AG-004
    verification: |
      ファイル単位の完了証拠（ファイルパス、初期判定、修正有無、確認した品質観点、最終判定、残存不備、blocked の判断必要事項）が
      解決対象504ファイルの全件分そろっていることを確認する。blocked 記録はユーザー判断に回す前提で記載漏れがないか確認する。
    pass_criteria: |
      全対象ファイルについてファイル単位の結果が個別に確認でき、集計値がファイル単位結果と一致すること（REQ-053-019）。
      blocked 項目すべてに判断必要事項の記録があること。
    on_failure: |
      fix-and-reverify。証拠欠落ファイルは再判定して証拠を補完する。blocked の判断必要事項漏れは記録を補い、
      ユーザー判断を求める（判断結果まで待って合格へ変更しない）。
  - id: TS-004
    target_item: AG-002
    verification: |
      gate.ts --json の解決対象リストで対象数と構成を機械確認する。追加9ファイル
      （src/opencode/plugins/**/README.md 4件、src/opencode/tools/**/README.md 2件、src/opencode-local/**/*.md 3件）が
      含まれ、node_modules 配下487ファイルと歴史記録38ファイル（docs/requirements/retired/ 11件・docs/reports/ 27件）が
      含まれないことを確認する。
    pass_criteria: |
      解決対象総数が504ファイル（docs 264 + src 配布物 240）であり、追加9ファイルの含有と除外525ファイル
      （node_modules 487 + 歴史記録 38）の非含有が機械的に確認できること。
    on_failure: |
      fix-and-reverify。対象解決（lib/targets.ts の既定除外・additional_targets）を修正して再確認する。
  - id: TS-005
    target_item: AG-003
    verification: |
      既定除外を対象解決に実装した agentdev-textlint-guard のテスト（bun test、cwd: src/opencode/plugins/agentdev-textlint-guard）で
      除外パターンの動作を確認する。pre-write hook と gate.ts 単独実行の両入口が同一の対象解決・同一判定を返すこと、
      加算設定が既定除外に優先すること（docs/reports/**/*.md を additional_targets に加算したテストケースで再包含されること）を確認する。
    pass_criteria: |
      除外パターン（node_modules・retired・reports）のテストが全て合格し、両入口の同一判定一致性テストが合格すること。
      加算優先のテストケースが合格すること（REQ-053-031 準拠）。
    on_failure: |
      fix-and-reverify。lib/targets.ts とテストを修正して再実行する。
  - id: TS-006
    target_item: AG-004
    verification: |
      是正差分が契約意味を保存していることを機械検査で確認する。docs-check、integrity suite、traceability 検証、
      AUTOGEN ブロック鮮度 gate を全て実行する。IR-055 既知 delta baseline の鮮度確認と再生成を行う（REQ-057-024）。
      是正差分（git diff）に識別子・状態値・コードブロック・テンプレート変数・契約文言の意味変更が混入していないことを抽出確認する。
    pass_criteria: |
      既存検査群がすべて新規違反ゼロで合格すること。AUTOGEN 対象の再生成結果がマッチすること。
      IR-055 baseline が最終状態に再生成され既知 delta が現行と一致すること。
    on_failure: |
      fix-and-reverify。新規違反は該当ファイルを修正して再検査する。AUTOGEN 由来の違反は生成側を修正して再生成する。
      意味変更の混入は差分を戻して表層修正のみやり直す。
  - id: TS-007
    target_item: AG-005
    verification: |
      完了報告の件数・ファイル単位結果と最終 HEAD の実ファイル内容が一致することを確認する。合格としたファイルから
      抽選（最低20ファイル）して gate.ts を再実行し、違反が再現しないことを確認する。
    pass_criteria: |
      報告値と実ファイル再検証結果が完全に一致し、抽選再検証で違反ゼロであること（REQ-053-021）。
    on_failure: |
      fix-and-reverify。不一致は実ファイルを正として報告と証拠を再構成する。違反再現時は最終検証全体を不合格とし
      該当ファイルを是正して最初から再検証する。
  - id: TS-008
    target_item: AG-005
    verification: |
      是正対象全ファイルの文字コード・改行コードを機械検査する（UTF-8 BOM なし、LF）。Windows 環境の
      文字コード安全手順（REQ-057-021）に沿った編集が行われたことを確認する。
    pass_criteria: |
      是正対象504ファイルすべてで UTF-8（BOM なし）と LF が維持され、cp932 由来の文字化け・CRLF 混入がゼロであること。
    on_failure: |
      fix-and-reverify。破損ファイルは正規表現・文字コード安全な手段で修復し、再検査する。

realization_actions:
  - id: RA-001
    concern: agentdev-textlint-guard の対象解決へ既定除外を実装
    responsibility: >-
      対象解決（lib/targets.ts）に機構固定の既定除外パターン（**/node_modules/**、docs/requirements/retired/**、
      docs/reports/**）を実装し、加算設定が既定除外に優先する解決順を定める。pre-write hook と gate.ts の両入口が
      同一の対象解決を共有することをテストで固定する。
    ownership_hints:
      - src/opencode/plugins/agentdev-textlint-guard/lib/targets.ts
      - src/opencode/plugins/agentdev-textlint-guard/ のテスト群（bun test）
      - docs/designs/quality/textlint-quality-runtime.md「プロジェクトと対象の解決」
    intent: >-
      歴史記録と依存成果物を検査対象から恒久除外しつつ、プロジェクト設定のスキーマ拡張を伴わず
      REQ-053-029（標準対象の無効化禁止）・fail-closed・設定スキーマ最小主義を維持する。
    verification_refs: [TS-004, TS-005]
    source_items: [AG-002, AG-003]
  - id: RA-002
    concern: ADF 本体設定の追加対象拡張
    responsibility: >-
      .agentdev/config/plugins/agentdev-textlint-guard.yaml の additional_targets へ
      src/opencode/plugins/**/README.md、src/opencode/tools/**/README.md、src/opencode-local/**/*.md を追加する。
    ownership_hints:
      - .agentdev/config/plugins/agentdev-textlint-guard.yaml
      - docs/designs/quality/textlint-quality-runtime.md「Plugin 設定」
    intent: src 配布物すべてを恒久検査対象化し、対象抜けを恒久的に防止する。
    verification_refs: [TS-004]
    source_items: [AG-002]
  - id: RA-003
    concern: 規則校正（corpus 校正段階）の実行と規則固定
    responsibility: >-
      対象解決後の対象全体で実測と誤検出確認を行い、規則ごとの option と severity を確定する。
      拒否対象への昇格は7条件の証拠を伴うこと。校正完了後に規則と依存版を固定し、正式初期判定を実行して
      初期不合格ファイルを記録する。既定除外（node_modules・歴史記録）適用後の解決対象504ファイルで行う。
    ownership_hints:
      - docs/designs/quality/textlint-quality-runtime.md「規則校正と移行検証」
      - docs/decisions/DEC-028.md（7条件・正式初期判定後の規則緩和禁止）
      - src/opencode/plugins/agentdev-textlint-guard/gate.ts（--json による実測）
    intent: >-
      誤検出を拒否対象に昇格させず、正式初期判定以降の同一規則による判定（REQ-053-037）を保証する基盤を作る。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001]
  - id: RA-004
    concern: 是正実行（ファイル単位の表層是正）
    responsibility: >-
      初期不合格ファイルをファイル単位で表層是正する（REQ-053-013 の変更禁止リスト遵守）。編集はファイル単位で完結させ、
      中間状態で拒否対象違反を残さない粒度で行う。意味を一義的に復元できない箇所は blocked として記録する。
      Windows の文字コード安全手順（edit ツール優先、PowerShell 標準 cmdlet の一括読み書き禁止）を遵守する。
      AUTOGEN ブロック内の違反は生成側を修正する。大量編集は docs 系・src 系に分割して実行する。
    ownership_hints:
      - docs/**（歴史記録除外後 264ファイル）
      - src/opencode/**（240ファイル）
      - docs/knowledge/windows-powershell-bulk-io-corruption.md
      - docs/designs/integrity/index-auto-generation.md（AUTOGEN）
    intent: 表層品質のみを修正し、契約意味・事実・識別子を保存したまま拒否対象違反をゼロにする。
    verification_refs: [TS-003, TS-006, TS-008]
    source_items: [AG-001, AG-004]
  - id: RA-005
    concern: 最終検査・完了証拠・実行記録
    responsibility: >-
      gate.ts で最終 HEAD 全文再検証（終了コード0）を行い、ファイル単位の完了証拡と初期/最終比較を整える。
      IR-055 baseline の鮮度確認・再生成（REQ-057-024）、AUTOGEN 鮮度確認を完了判定に含める。
      移行結果と測定証拠の実行記録を docs/reports/ へ保存する（検証完了証拠 REQ-057 体系に従う）。
    ownership_hints:
      - src/opencode/plugins/agentdev-textlint-guard/gate.ts
      - docs/reports/（実行記録の保存先）
      - docs/designs/integrity/distribution-boundary.md（IR-055 baseline）
    intent: REQ-053-014〜021 の完了証拠契約を満たし、導入完了時の検査対象全体拒否対象違反ゼロ（REQ-053-038）を立証する。
    verification_refs: [TS-002, TS-006, TS-007]
    source_items: [AG-005]

case_open_hints:
  epic_needed: true
  decomposition: >-
    契約整備（REQ-053 更新・Design 更新・DEC-028 更新・plugin 対象解決実装・設定 yaml 拡張）を先頭 Wave とし、
    校正・初期判定・是正・最終検証を後続 Wave とする。是正 Wave は docs 系・src 系に分割する。
  wave_hints:
    - "Wave 1 契約整備: REQ-053 更新（ACT-REQ-001/002）、Design 更新（ACT-DESIGN-001/002/003）、DEC-028 更新（ACT-DEC-001）、plugin 既定除外実装（RA-001）、設定 yaml 拡張（RA-002）"
    - "Wave 2 規則校正・規則固定: 実測・誤検出確認・severity 確定・7条件証拠・規則固定・正式初期判定（RA-003）"
    - "Wave 3 是正（docs 系 264ファイル、RA-004）"
    - "Wave 4 是正（src 系 240ファイル、RA-004）"
    - "Wave 5 最終検証・証拠: 最終 HEAD 再検証・ファイル単位証拠・初期/最終比較・IR-055 baseline 再生成・AUTOGEN 鮮度・実行記録保存・DEC-028 の状態整合（proposed 権威引用ねじれの解消、case-close の Design 確定工程と整合させる）"
```

# summary

docs/ と src/ 配下の全配布 Markdown（対象解決後504ファイル）へ textlint 確認・是正を行う要件。現行拒否対象違反はゼロのため、実務の中心は規則校正（誤検出確認つき severity 確定）→ 正式初期判定 → 拒否対象の是正 → 最終 HEAD 再検証の完全形（REQ-053-037/038・Design「規則校正と移行検証」準拠）。あわせて src 配布物9ファイルの恒久対象化と、歴史記録38ファイルの機構固定除外（加算優先）という契約整備を含む。基盤（plugin・gate・契約文書）は本日時点で全て存在しており、本要件はその履行キャンペーンと契約の方針転換である。
