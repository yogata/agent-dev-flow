# inspect-docs finding 20261011T033142Z

## サマリ

- スキャン対象: 現行 REQ 67件、retired REQ 19件、Decision 55件、Design 182件、guides 14件、README 群、knowledge 30ファイル、Command 13件、Skill 57件、Template 13件。
- 検出事項: 17件（このほか、対象なし確認・観察メモ・既知 defer の状態・検査証拠の採用判断を記録）。
- high severity: 0件。
- 配布物意味診断: 文書群の責務境界・整合を確認。case-auto の Wave 制御記述の不整合、Wave 語彙の残存を検出。
- 推奨経路: 表現是正候補、修正候補、追跡Issue育成、docs-check ルール候補。既知 finding の disposition は変更しない。

## 診断基準と被覆

診断担当間で基準 revision が異なる。REQ 担当は a9535e6a（2026-10-08T00:59:50+09:00）以降、Design 担当は 7e9c3067（2026-10-08T17:52:05+09:00）以降を比較し、Decision/guides 担当は依頼で指定した delta 群を調査した。a9535e6a..7e9c3067 には27 commit があり、Design 担当の比較窓に含まれない Design 変更がある。

指定された広い差分窓との整合のため、Design 担当が調査していない当該帯域の変更ファイルを確認した。artifact-contracts.md、artifact-responsibilities.md、custom-tool-contracts.md、v4-durable-state-and-recovery.md、v4-responsibility-boundaries.md、v4-quality-gate-model.md、command-file-format.md、v3-v4-crosswalk.md の差分を最小限確認した。主な変更は REQ-103 完了表現、covers 宣言、検証記録契約、既存記述の現行化であり、追加の重大な意味矛盾は確認しなかった。document-model.md は現行全文、F-10/F-12/F-15 関連箇所も別途確認した。全担当の完全同一 corpus・同一深度の調査とはみなさない。

REQ の6観点（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）を fan-in で確認した。担当間の矛盾は現行 REQ > 承認済み Decision > Design > guides の順で評価した。複数の ADF-COVERS edge だけでは責務重複と判定せず、本文上の所有範囲と正規 policy を確認した。scope を明記した複数 edge は、それ自体では重複責務の証拠としない。

## 機械検査証拠の採用判断

| 証拠 | 判定 | 根拠 |
|---|---|---|
| check_integrity.out | 採用 | root は repo root。REQ 67、Skill 57、Command 13、Guides 14、Specs 182、RetiredREQ 19。NG 0、Info 131。 |
| check_command_format.out | 参考採用 | exit 0、「OK」。root/population の表示がなく、母集団の独立検証はできない。 |
| check_extensions.out | 不採用 | repoRoot が scripts cwd。workflow/capability extension の検出0件は、実在する `.agentdev/extensions/skills/` 29件と矛盾する。`ok: true` は採用しない。 |
| check_autogen_freshness.out | 採用 | 索引6件、鮮度違反0件。 |
| lint_skills.out | 採用 | Skill 57件、AG-005 NG 3件。description 長は adopted-conventions 827、artifact-semantics 701、workflow-case-auto 638文字で各上限600文字を超過。 |
| check_distribution_boundary.out | 不採用 | scripts cwd、zero-targets、scanned_files 0。無効実行。 |
| check_distribution_boundary2.out | 採用 | repo root、scanned_files 444、IR-046/047/048 の hit 0、failures 0。 |
| check_templates.out | 採用 | Template 13件、OK 81、NG 0。 |
| check_content_corruption.out | 採用 | scanned_files 406、heading、code block、link、Unicode 等の違反0。 |

lint_skills の Warning 8件は explainer / explainer-book / first-reader / yomiyasu の trigger 記述に関するもの。third-party 由来の非 agentdev Skill への warning であり、policy 上の根拠を確認せず契約違反へ格上げしない。

## 検出事項リスト

### RQ03
- category: 参照様式（第一参照導線の ID 化不足）
- target: `docs/requirements/REQ-009.md:25`、`docs/requirements/REQ-088.md:23`
- evidence: REQ-009-004 は「v5 の移行要件」、REQ-088-006 は「v5 の成果物確定要件」と記し、REQ-109 / REQ-105 への ID 参照を含まない。REQ-088-006 の実行確認行は23行目（診断担当報告の27行目から補正）。
- severity: low
- confidence: medium
- source_of_truth: REQ-109、REQ-105
- recommended_route: 表現是正候補。対象 REQ への明示参照を検討する。
- ng_classification: 今回修正対象候補（両行は今回の delta で変更された）。
- notes: 行番号を固定しない REQ 番号参照を意図している可能性がある。

### RQ04
- category: superseded Decision への無注記参照
- target: `docs/requirements/REQ-006.md:38`
- evidence: 「Definition 保存工程（case-ready / case-revise 内部責務。DEC-029）」と記載。同 REQ の他箇所は DEC-033 を参照し、DEC-029 は DEC-033 に supersede されている。
- severity: medium
- confidence: high
- source_of_truth: accepted DEC-033
- recommended_route: 表現是正候補。DEC-033 へ更新するか、DEC-029 が supersede 済みであることを明記する。
- ng_classification: 今回修正対象候補（対象行は今回の delta で変更された）。
- notes: DEC-029 が導入した境界の歴史的引用を意図した可能性はある。

### RQ07
- category: DRIFT（用語の孤立残存）
- target: `docs/requirements/REQ-061.md:52`
- evidence: REQ-061-033 に「missing-design」が残る一方、REQ-012-047、REQ-021-024、REQ-061-023 は「設計根拠対応の欠落」等へ統一されている。
- severity: medium
- confidence: high
- source_of_truth: REQ-012-047、REQ-021-024
- recommended_route: 表現是正候補。用語を統一するか、check の識別子なら Design 側の定義を明示する。
- ng_classification: 今回修正対象候補（同一変更 wave 内の用語統一漏れ）。
- notes: `missing-design` が機械検査の finding 識別子である可能性があり、実装との照合が必要。

### DS01
- category: Design 宣言と本文実体の乖離、責務境界の観察
- target: `docs/designs/foundations/v4-traceability-model.md:10-11`、`docs/designs/skills/agentdev-traceability.md:9,11`、`docs/designs/commands/case-revise.md:9`
- evidence: v4-traceability-model の implementation covers 注記は REQ-106/107 の構成実体を同 Design の v5 語義更新節が所有するとする。しかし REQ-106 の差分影響設計は agentdev-traceability の impact 拡張節に、利用側接続は case-revise に記述される。各ファイルの design covers には scope 修飾がない。
- severity: medium
- confidence: high（本文実体の所在）、medium（意図的な多面所有の可能性）
- source_of_truth: REQ-106、REQ-107、REQ-103-014
- recommended_route: 表現是正候補。covers の REQ-106 範囲を本文実体に合わせるか、設計面の分担を明示する。
- ng_classification: 今回修正対象候補（関連 covers 宣言は今回の delta で追加された）。
- notes: 複数 edge の存在だけを責務重複の根拠にしていない。主根拠は REQ-106 implementation 宣言の注記と実際の本文所在の乖離。scope を明記した複数 edge は本リポジトリの通常パターンであり、重複と断定しない。

### DS02
- category: covers 宣言不整合、将来計画の参照
- target: `docs/designs/workflows/v4-standard-lifecycle.md:9-10`、`docs/designs/foundations/v4-operating-model.md:13`
- evidence: v4-standard-lifecycle は本文に v5 接続節を持たないまま REQ-108-001〜012 の design/implementation covers を宣言し、implementation 注記で構成実体を「RA-007 が後続 OU で所有する」とする。v4-operating-model:13 も RA-003/RA-004 の「後続 OU」を参照する。
- severity: medium
- confidence: high（宣言・本文の不一致）、medium（当該 Case の合意表現の可能性）
- source_of_truth: REQ-108-012、REQ-105-004
- recommended_route: 表現是正候補。covers の範囲を本文に合わせ、RA の Case と現行到達先を明示するか将来参照を除く。
- ng_classification: 今回修正対象候補（covers 宣言は今回の delta で追加された）。
- notes: RA-007/RA-003/RA-004 が実在 Case の allocation を指す可能性は未確認。

### DS03
- category: REQ-108-011/012 の設計対応範囲の明確化
- target: `docs/designs/workflows/v4-standard-lifecycle.md:9`、`docs/designs/workflows/v4-collaboration-loop.md:10`、`docs/designs/commands/backlog-auto.md:8`、`docs/designs/commands/case-auto.md:16`、`docs/designs/foundations/references/v4-v5-crosswalk.md:8`
- evidence: REQ-108-011/012 は複数 Design が covers する。backlog-auto、case-auto、collaboration-loop、crosswalk はそれぞれ接続面や棚卸し面を本文で説明する一方、v4-standard-lifecycle の全行 covers は範囲を限定していない。
- severity: low
- confidence: high（宣言分散）、medium（scope の重なり）
- source_of_truth: REQ-108-011/012、REQ-103-014
- recommended_route: 表現是正候補。v4-standard-lifecycle の blanket 宣言に設計面の scope を付す。
- ng_classification: 今回修正対象候補（covers 宣言は今回の delta で追加された）。
- notes: 複数の接続節があること自体を違反とはしない。実際の本文は面ごとの所有を説明しており、重複責務の確定ではなく無修飾の blanket 宣言を指摘する。

### DS04
- category: 宣言不整合
- target: `docs/designs/workflows/v4-delegation-contracts.md:252,263`
- evidence: 252行目は実行主体分類表の正規所有を宣言し、263行目は REQ-108 接続を「所有する」とするが、同ファイルの ADF-COVERS 宣言に REQ-108 は含まれない。252行目の crosswalk「分類スキーマ」への redirect も、実際の crosswalk 節が処遇分類を扱うため対象範囲が一致しない。
- severity: low
- confidence: high（covers 不在）、medium（redirect の意図）
- source_of_truth: `agentdev-traceability` covers 宣言契約、`v4-v5-crosswalk.md:21-32`
- recommended_route: 表現是正候補。REQ-108 covers を追加するか「所有する」を弱め、redirect 先を実際の実行主体分類の所有者へ合わせる。
- ng_classification: 今回修正対象候補。
- notes: crosswalk の将来改訂を見越した前置きである可能性がある。

### DS05
- category: Design 内矛盾
- target: `docs/designs/commands/case-auto.md:77-79,214,218`
- evidence: 77-79行目は現 Wave の収束を待って次 Wave を開始するとする一方、214/218行目は依存条件の充足のみを開始条件とし、Wave 収束を前提としないスロット型キューを定める。
- severity: medium
- confidence: medium
- source_of_truth: DEC-051、DEC-055、REQ-108-008
- recommended_route: 修正候補。旧記述をスロット型キューの現行契約に更新するか、歴史的・限定的な記述であることを明示する。
- ng_classification: pre-existing（DEC-051 wave 由来）。
- notes: Wave 反復制御節が Epic Issue 指定時の限定記述として残された可能性はある。v4-v5-crosswalk は runtime 制御契約節を現行記述として参照している。

### DS06/GR01
- category: Wave 用語の現行性乖離
- target: `docs/designs/workflows/v4-standard-lifecycle.md:24,73`、`docs/guides/glossary.md:75`
- evidence: v4-standard-lifecycle と glossary は Wave を「実行スケジューリング単位」と現在形で記述する。DEC-055 は Wave を意味的な依存関係のまとまりとする。glossary は上位 Decision の置換内容と不一致であり、v4-v5-crosswalk は lifecycle の用語統合を後続処理として記録している。
- severity: medium
- confidence: medium
- source_of_truth: DEC-055、REQ-108-008、v4-v5-crosswalk の REQ-035-006 処遇記録
- recommended_route: 表現是正候補。glossary を現行化するか移行期注記を付し、lifecycle の残存語彙は crosswalk の棚卸しと同期する。
- ng_classification: glossary は今回修正対象候補、lifecycle の語彙は pre-existing（crosswalk 管理下）。
- notes: REQ-108-012 の移行期実行契約維持により、用語定義の更新時期には判断余地がある。DS05 の制御矛盾とは別の対象である。

### DS08
- category: Inventory の列挙漏れ
- target: `docs/designs/foundations/system.md:104,121-139`
- evidence: 104行目は公開 Command 13件を掲げるが、Inventory 表には12公開 Command と内部 lifecycle 5段階があり、`/agentdev/third-party-sync` の行がない。同ファイルには別節（365行目）で third-party-sync の記述がある。
- severity: low
- confidence: high
- source_of_truth: root README の13コマンド索引、コマンドリファレンス一覧
- recommended_route: 修正候補。Inventory 表に third-party-sync を追加する。
- ng_classification: pre-existing（今回の delta は用語置換）。
- notes: 文書全体での記述欠落ではなく Inventory 表の欠落。

### GR02
- category: README 導線の現行性
- target: `docs/README.md:8`、`docs/guides/README.md:18`
- evidence: 両導線は「第4世代（v4）の現在像」を定義する正規文書を案内し、accepted な v5 基盤 REQ-104〜109 / DEC-053〜056 への導線を含まない。
- severity: medium
- confidence: medium
- source_of_truth: accepted DEC-053〜056、REQ-104〜109
- recommended_route: 表現是正候補。v5 基盤への導線を追加するか、移行期の v4 実行契約維持と v5 基盤確定を併記する。
- ng_classification: 今回修正対象候補（v5 delta 由来）。
- notes: DEC-055 は v5 実現確定まで現行実行契約を維持する。v4 文書の実行上の正当性と v5 基盤への導線欠落は分けて扱う。

### GR03
- category: README 索引内容過多（既知 F-21 の範囲拡大）
- target: `docs/README.md:141,142,145,152`
- evidence: DEC-033/034/037/044 の行に superseded_by の詳細説明がタイトル列へ埋め込まれた。これらは部分置換で status: accepted を維持する Decision。既知 F-21 の対象に加えて4行へ拡大した。
- severity: medium
- confidence: high
- source_of_truth: decision-lifecycle の部分置換規約（status: accepted 維持）
- recommended_route: F-21 の既存処分を維持し、再評価対象に4行を加える。
- ng_classification: pre-existing（既知 F-21 と同根、今回の delta で範囲拡大）。
- notes: F-21 の disposition は変更しない。

### GR04
- category: guides の出典非明示
- target: `docs/guides/command-selection.md:48-56`
- evidence: case-ready の Definition 確定について `artifact_actions` による分岐や case-ready を省略しない条件を記すが、節内に REQ/Decision/Design の出典がない。
- severity: low
- confidence: medium
- source_of_truth: REQ-061、DEC-026
- recommended_route: 表現是正候補。関連する正規文書への参照を追加する。
- ng_classification: pre-existing。
- notes: 入口案内としての補足範囲に収まるか判断余地がある。

### GR05
- category: guides の出典非明示
- target: `docs/guides/consumer-project-setup.md:220-244`
- evidence: deleteBranchOnMerge を必須導入条件とし、case-open preflight の警告と停止条件を説明するが、節内に DEC-045/DEC-050 の参照がない。
- severity: low
- confidence: medium
- source_of_truth: DEC-045、DEC-050
- recommended_route: 表現是正候補。節に出典参照を加える。
- ng_classification: pre-existing。
- notes: REQ-009 系の導入要件の説明として許容される可能性がある。既知 GR-05（supervisor-credential-bridge の実測記録）とは別件。

### GR06
- category: Decision Map の案内精度
- target: `docs/decisions/README.md:214-255`
- evidence: Decision Map の最終行は DEC-052→DEC-044。frontmatter にある DEC-054→037、DEC-055→033、DEC-056→034 の supersedes 関係は未掲載。
- severity: low
- confidence: high
- source_of_truth: 各 Decision の frontmatter `relations`
- recommended_route: 追跡Issue育成または表現是正候補。掲載基準を明確化し、後継関係の案内を更新する。
- ng_classification: pre-existing（以前の置換関係にも未掲載があり、今回3件が加算）。
- notes: Decision Map は網羅宣言のない手動セクションだが、project-docs-and-specs.md:46 は後継関係の参照点として案内する。

### LINT01
- category: 配布 Skill の description 上限超過
- target: `.opencode/skills/agentdev-adopted-conventions/SKILL.md`、`.opencode/skills/agentdev-artifact-semantics/SKILL.md`、`.opencode/skills/agentdev-workflow-case-auto/SKILL.md`
- evidence: lint_skills AG-005 は個別上限600文字に対し827、701、638文字を検出。description 実長も同値。
- severity: medium
- confidence: high
- source_of_truth: AG-005 / RU-0018 層1
- recommended_route: 修正候補。Skill description を個別上限内へ短縮する。
- ng_classification: 今回の検査で確認された検証不通過（発生時期は本診断では特定しない）。
- notes: Warning 8件の third-party/non-agentdev Skill trigger 欠落は policy 根拠が確認できないため契約違反に数えない。

### MECH01
- category: 機械検査の母集団無効
- target: `.agentdev/tmp/inspect-docs-20261011/check_extensions.out`、`check_distribution_boundary.out`
- evidence: 両出力の repoRoot は scripts cwd。boundary は zero-targets で0ファイル。extensions は0件だが、`.agentdev/extensions/skills/` に29件実在する。boundary2 は repo root で444件を走査し0 hit。
- severity: low
- confidence: high
- source_of_truth: 実在する repository corpus と検査出力の root/population
- recommended_route: 検査実行手順の是正。repo root を明示して再実行する。
- ng_classification: 今回の検査実行で確認。
- notes: 無効な成功結果は採用せず、boundary2 の有効結果で代替した。extensions 検査は有効な母集団での成功を確認できていない。

## 6観点 fan-in 結果

| 観点 | 結果 |
|---|---|
| SPLIT | 対象なし。REQ-104〜109 の分割境界は確認済み。 |
| MERGE | 対象なし。REQ-012-027 と REQ-107-001/002 は機構と原則の2層として許容。 |
| MOVE | 対象なし。確認した移管記録は移管元・移管先で整合。 |
| DUPLICATE | RQ-008-030/REQ-030-024 等は観察。DS01 は covers edge 数ではなく REQ-106 実体注記と本文所在の乖離を指摘。 |
| RETIRE | REQ-103 の完了後処遇を観察（RQ06）。 |
| DRIFT | REQ-061-033 の用語残存（RQ07）、Wave 語彙（DS06/GR01）。 |

横断矛盾では case-auto の Wave 収束待機記述（DS05）と glossary の Wave 定義（GR01）を上位 Decision/REQ に照らした。REQ-035 本文の Wave 意味は更新済みであり、guides と Design の残存語彙を検出した。REQ-006 の DEC-029 参照は accepted DEC-033 と整合せず、注記のない superseded 参照として記録した。

## 既知 defer / false-positive 照合

既存の disposition は変更せず、今回確認できた状態のみを記録する。

| 既知項目 | 今回の状態 |
|---|---|
| F-07 | 今回の結果から対象箇所の状態変化を特定できず。既存 disposition を維持。 |
| F-10（旧） | README と command-file-format の将来拡張余地の重複記述が継続。変化なし。 |
| F-11（旧） | docs/README.md:23-26 の欠番説明が継続。悪化なし。 |
| F-12 | v3-v4-crosswalk の検証対象列挙漏れが継続。状態変化なし。 |
| F-14 | vocabulary-registry の v4-standard-lifecycle 行参照ずれが継続し、参照先の実行範囲との差がわずかに拡大。処分維持。 |
| F-15 | v4 系 Design の「後続 Sequence」記述が継続。v3-v4 全行実行済みの一方、v4-v5 棚卸しとの多義性が増加。処分維持。 |
| F-21 | docs/README.md の superseded 注記埋め込みが4行拡大（GR03）。既存 defer を維持し、再評価対象へ追加。 |
| F-23 | artifacts-and-state の状態モデル制約に出典なし。変化なし。 |
| F-24 | intake-learning-backlog-flow の13項目形式に出典なし。変化なし。 |
| F-25 | multi-host-operations の日付付き実測が継続。再生成手順の緩和も維持。 |
| GR-05（既知） | supervisor-credential-bridge の実測記録が継続。変化なし。 |

REQ-003.md:56、REQ-082.md:12、retired/REQ-013.md:28/47 の旧帯参照は自己説明付きで変化なし。現行 REQ 行への真の dangling reference は確認されなかった。REQ-030-024 と REQ-008-030 の content 完全性記述は既知 deferred の範囲で維持され、悪化は確認されなかった。

## 配布物整合性診断と docs-check route 候補

構文・参照の証拠では check_content_corruption が406ファイルを走査し違反0、Template 検査は13件・OK 81、distribution-boundary2 は444ファイルを走査して concrete ID/path/URL/metadata hit 0だった。README の公開コマンド13件とコマンドリファレンス13件は整合し、主要リンクの broken link は確認されなかった。文意保持の機械項目も違反0。意味・責務整合は DS01〜DS06 の本文確認で評価し、DS05 を実質的な緊張として記録した。

BOM 付き UTF-8 と単一ファイル内の CRLF/LF 混在は、採用した機械検査の出力から直接確認できない。既存 checker の検査範囲を拡張する候補とする。

docs-check ルール候補:
- Decision の部分置換語彙と下位文書の現在形記述を照合する検査（GR01、DS06、GR08）。
- REQ-061-033 の旧用語等、正規語彙の残存を検出する検査（RQ07）。
- ADF-COVERS の複数 edge を単純重複扱いせず、未修飾宣言と本文 scope の不一致を確認する検査（DS01〜DS03）。
- system Inventory の件数宣言と列挙行の差を確認する検査（DS08）。
- Decision frontmatter の supersedes relations と Decision Map の差分を確認する検査（GR06）。
- 配布物の BOM および CRLF/LF 混在を確認する検査。
- check_extensions を repo root から有効母集団で実行したことを確認する実行契約。

## 未処理 artifact 確認

- `.agentdev/inspect/inbox/` には既存 finding 11件があり、既知の分類待ち・deferred を含む。今回それらの分類・削除・promote は行わない。
- `.agentdev/inspect/promoted/` は空、`.agentdev/backlog/req-units/` は空、`.agentdev/drafts/` は空。未処理 RU / draft は確認されなかった。

## 推奨アクション

- RQ04、RQ07、DS01〜DS04、GR02、GR03、LINT01 の表現・宣言是正を各正規 owner に委譲する。
- DS05 は case-auto Design の Wave 制御記述を調停する。
- DS06/GR01 は DEC-055 と v4-v5-crosswalk の移行扱いに合わせて語彙を整える。
- GR04/GR05 は正規出典への導線を追加するか、案内文としての範囲を再評価する。
- F-21 の既存 disposition は維持し、今回拡大分を再評価対象へ加える。
- inspect-promote の分類後に必要なものを backlog-review へ渡す。今回 req-define 入力案は作成しない。

## 観察メモ

- RQ05: REQ-088/103 の v4 冠タイトルは REQ-108-012 と crosswalk が移行期境界を管理する。README 基準構造節への説明追記は将来検討。
- RQ06: one-off REQ-103 の完了後処遇を完了判定時に検討する。RQ08: REQ-060 のタイトルは実装詳細風だが本文は Design 委譲済み。
- RQ09/RQ10: REQ-008 の session RU frontmatter/operation 値と REQ-061-044 の extension path は Design 委譲を含む境界上の契約。明確な分離違反とは断定しない。
- RQ11/RQ12: REQ-012-027 と REQ-107-001/002 は機構と原則、REQ-008-030 と REQ-030-024 は生成と適用の2段契約として解釈可能。
- RQ13/RQ14: frontmatter 日付引用符は規約で固定されていない。Case 状態値域等は v5 crosswalk 棚卸し対象として扱う。
- DS07: F-15 は継続し、多義性が増加。DS09/DS10 は判定時参照と references/ crosswalk 書式の観察。DS11 は system.md と case-close の REQ-032-029 covers 重複候補だが、system 側の根拠節を特定できず保留。
- GR07〜GR10: トピック別 Decision view の選択掲載、DEC-039 の Wave scheduling 用語、Knowledge の実測対照表、DEC 本文関係節の様式差は観察。既知方針と現行規約に照らして違反とは断定しない。
- docs/decisions/README.md の accepted 46件 / proposed 0件は frontmatter scan と一致。部分置換8件は accepted 維持・superseded_by・supersede_note を備える。v5 新規 Design の宣言と対象 REQ 行の整合、traceability sidecar と inline ADF-COVERS の不整合は確認されなかった。

## 対象外（Out of Scope）

- 診断対象文書・配布物の修正。
- 既存 finding の分類、採用、削除、promote。
- Issue/PR 作成、Intake/Learning/RU 処理。
- 無効な check_extensions 実行の修復そのもの。再実行は検査手順の route 候補として記録。
- 機械検査の再実装、または担当間で窓・深度を完全一致させた全面再診断。
