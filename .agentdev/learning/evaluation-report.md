# 評価レポート

## メタデータ
- **実行日時**: 2026-09-23 15:17
- **対象エントリ数**: 4件（inbox: 4件, deferred: 130件〔インデックススキャン・候補突合対象。`##` 見出し134件からメタセクション4件を除く〕）
- **問題クラス数**: 4（うち統合クラスタ1つ: inbox エントリ1 + deferred 既存エントリ〔targeted docs guard --root + --files、2026-09-05記録・09-07移動〕）
- **実行特性**: backlog-auto stage 2 learning 系統。前回レポート（2026-09-22）は別の inbox 4件に対するもので本実行で上書き。HEAD 806cf16c 時点で `.agentdev/learning/` はクリーン

## STEP-1 証拠（入力読込・正規化）
- inbox.md 4エントリを全面読込・正規化（全エントリが13フィールド新フォーマットのため旧フォーマット正規化は適用不要）
- deferred.md インデックススキャン（`##` 見出し134件 + タグ行128件抽出。実エントリ130件）→ タグ・見出しトークンによる過剰包含候補選択（直近20エントリを常時含む）→ 候補本文読込。読込済み行範囲と突合結果:
  - エントリ1（#targeted-docs-guard #worktree）: 候補 = L1041（--files 行長上限）、L1736（--root + --files 併用）、L1862（check_distribution_boundary --base-ref 未定義 flag）、L1145（前段ドライバー再開〔#check-changed-docs タグ〕）→ 本文突合の結果、いずれも根本原因が異なり重複なし。L1145 は「--base-ref はコミット済み差分のみ対象」の同族部分言及あり（複合エントリで主題は委譲再開、統合対象外）
  - エントリ2（#textlint #junction #worktree）: 候補 = L1630（junction削除失敗）、L2431（textlint guard project root 外判定）、L2531（write guard project root 外 block）、L1763（契約テスト main repo untracked）、L2410（bun run Module not found）、L1736（targeted docs guard junction）→ targeted docs guard 事例（L1736）と同一問題クラスを形成。L1763 は根本原因（git 管理外実体）が異なるため関連事例参照。guard block 系（L2431/L2531）は根本原因（guard の project root 判定）が異なる
  - エントリ3（#integrity-checker #fixture-test #import-share）: 候補 = L1988（IR-062 copyScripts 規約）、L1621（$PSScriptRoot 一時リポジトリコピー）、L2404（bun run）、L159（check_integrity fixture）、L729（baseline 行移動〔#integrity-checker タグ〕）、L1349（bun install gitignore）→ いずれも根本原因が異なり重複なし。L1988 は fixture copy 規約の存在確認として既存対策照合で参照
  - エントリ4（#agentdev-gh #issue_list #page-limit）: 候補 = L2095（issue_update state 変化〔#agentdev-gh タグ唯一〕）、L1841（pr_create invalid-input）、L1055（gh api REST numeric id）、L2116（case-run PR 検出不能）→ 本文突合の結果、いずれも根本原因が異なり重複なし。issue_list page-limit 系の既存エントリなし（「issue_list」「ページ上限」「safety」grep で 0 件）

## 問題クラス一覧

### 問題クラス1: check_changed_docs.ts --base-ref のヘルプ文言と実挙動の不整合

- **根本原因**: checker ヘルプ文言（check_changed_docs.ts L54-55「コミット前（worktree 上での検証）= --base-ref」を標準と案内）が、(1) 実挙動（L215 `git diff --name-only baseRef...HEAD`、L589「--base-ref 時は baseRef...HEAD の committed range を見る」＝コミット済み差分のみ・未コミット変更非対象）(2) 恒久契約 Design 正典（docs/designs/integrity/targeted-docs-guard-implementation.md L25-26「--base-ref: 実行はコミット後・push 前に限定する（コミット前の worktree では未コミット差分が検出されず、files_checked 空の検査見逃しを生む）」、L37「コミット前は untracked ファイルを含む --files による明示指定を標準とする」、L163 空 files_checked の確認促しに「--base-ref の実行タイミング違反（コミット前実行）」を列挙）、(3) case-run STEP-S3-4（single.md L130）と worktree-operations.md L181 の正規手順、の3面すべてと矛盾する誤案内であること
- **再発条件**: ヘルプ文言を読んで case-run worktree でコミット前に targeted docs guard を --base-ref で実行した場合
- **予防策**: checker ヘルプ文言と実挙動・正規手順の整合（ヘルプ文言の修正は req-define が実現面として判断）。正規手順側は既に整備済みであることを本実行で機械確認

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単発（PR #3074 case-run 実測）。同族の部分言及が deferred 複合エントリ1件にあるが主題が委譲再開で別問題クラス |
| 影響度 | 2/5 | 対象 0 件 warning で docs 品質検査が空振りするが、実行者が自力で気づきコミット後再実行で回収。手戻り小・実害なし |
| 横展開性 | 4/5 | check_changed_docs.ts を使用する全 workflow（case-run / case-close / docs-check）でヘルプを読む全利用者が同様に誤用し得る |
| 反映先明確度 | 4/5 | ヘルプ文言の位置（L54-55、usage L188-190）を本実行で機械特定。正規手順側は既存のため反映先が checker ヘルプ文言に一元化 |
| 自動化適性 | 3/5 | ヘルプ文言修正はコード変更。実行タイミングの機械 guard は既存手順への依存が続く |
| プロジェクト固有知識再利用性 | 3/5 | checker CLI 契約と実挙動の整合という固有知見 |
| 再発可能性 | 4/5 | 誤案内（ヘルプ文言）が現状存続し、コミット前実行は case-run の高頻度経路。PR #3074 実測では正規手順が存在してもヘルプ文言に従って誤用が発生 |
| 費用対効果 | 4/5 | ヘルプ文言数行の修正と相互参照補強で高頻度誤用を予防 |
| **加重合計** | **25/40** | |

- **推奨処分案**: 処分区分5（既存対策の更新: fix gap — checker ヘルプ文言の誤案内）→ 採用。adversarial-review F-B2 の追加証拠で docs/designs/integrity/targeted-docs-guard-implementation.md（CLI 引数表 L25-26、モード使い分け L37、空 files_checked の確認促し L163）に「--base-ref はコミット後・push 前に限定、コミット前は --files 明示指定標準」の正典契約が既存であることを機械確認。正典 Design・case-run STEP-S3-4・worktree-operations.md L181 の3面すべてに対し、checker ヘルプ文言（L54-55、usage L188-190）が正反対の案内をしており、残るギャップはヘルプ文言の表記不整合に一元化される。inbox の想定反映先の1つ「case-run STEP-S3-4 手順の実行タイミング明記」は既に整備済み。ヘルプ文言修正は checker 実装面の変更候補であり、req-define が実現面として判断する（反映先候補の記録にとどめる）

#### エントリ一覧
- 2026-09-23: targeted docs guard の --base-ref はコミット前 working tree 未コミット変更を検出しない [inbox]

### 問題クラス2: worktree で junction 系実体（skill scripts・plugins gate）に依存する検査・gate の main root 実体 + 指定による代替（統合クラスタ: inbox 1件 + deferred 既存1件）

- **根本原因**: worktree への `.opencode/` 配下 junction 未伝播（既知の構造的制約）により、junction 系実体（.opencode/skills/agentdev-* 配下 scripts、.opencode/plugins 配下 gate.ts〔実体 src/opencode/plugins/agentdev-textlint-guard/gate.ts〕）が worktree に存在せず、worktree 側からの直接実行が失敗する
- **再発条件**: worktree で junction 系実体に依存する検査・gate を直接実行する場合（textlint gate 全般、targeted docs guard 等の skill scripts 検査）
- **予防策**: main root 実体 + 検査対象指定（--root 等）による代替実行の汎用手順明文化。REQ-018-005 と worktree-operations.md L172-202「main root 実体 + --root 指定による読取系 checker 実行手順」は既存だが対象は「junction 系 skill scripts」（実行例: targeted docs guard、traceability check、契約テスト）に限定され、textlint gate 等 plugins 配下 junction 実体は未カバー

#### 8軸評価スコア（クラスタ2件: inbox 1件 + deferred 既存1件）

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | inbox 1件（textlint gate、PR #3074 実測）+ deferred 既存1件（targeted docs guard --root + --files、2026-09-05記録・出現2回） |
| 影響度 | 2/5 | 両事例とも main root 実体からの代替実行で完遂。docs 品質最終 gate の実行不能は一時的で手戻りなし |
| 横展開性 | 4/5 | worktree で junction 系実体に依存する gate/check 全般（textlint gate は case-run / case-close / case-ready で高頻度） |
| 反映先明確度 | 4/5 | REQ-018-005 と worktree-operations.md 構造的制約節の追記位置を本実行で機械特定 |
| 自動化適性 | 3/5 | 手順明文化が主体（既存手順節への plugins 系適用追記） |
| プロジェクト固有知識再利用性 | 4/5 | 本プロジェクト固有の junction/worktree 構造の知見 |
| 再発可能性 | 4/5 | worktree での gate・検査実行は高頻度経路。同族3事例目の発生 |
| 費用対効果 | 5/5 | 既存手順節への数行追記で高頻度の gate 実行失敗を予防 |
| **加重合計** | **28/40** | |

- **推奨処分案**: 処分区分5（既存対策の更新: fix gap — REQ-018-005 汎用手順の適用範囲欠落）→ 採用。worktree-operations.md L172-202 の手順節が「junction 系 skill scripts」限定で textlint gate（plugins 配下）を未カバーであることを本実行で機械確認（REQ-018-005 の grep、L172-202 本文確認、gate.ts 実体 glob 確認）。統合クラスタ2件目（deferred targeted docs guard エントリ）は duplicate 判定（下記重複判定参照）として prune する

#### エントリ一覧
- 2026-09-23: worktree では textlint gate 実体が junction 未伝播のため main root gate.ts 実行 + --root 指定で代替する [inbox]
- 2026-09-05: worktree 内変更の targeted docs guard は main repo から --root + --files 併用で検査できる [deferred]

### 問題クラス3: 自己完結 checker への実装共有と fixture 進行テスト構成の前提衝突（同一形式リーダー複製 + 対決テストで機械担保）

- **根本原因**: fixture 進行テスト構成（checker を一時 fixture へ copy して実行する copyScripts 既存規約）と、checker への絶対パス静的 import による決定的実装共有の前提衝突。copy された fixture 内で静的 import の参照先が解決できず全テストが起動不能になる
- **再発条件**: 自己完結 checker（.opencode/skills/repo-* 配下）に他 skill 配下の決定的実装を静的 import で共有する場合
- **予防策**: 「同一形式リーダー複製（抽出ロジック文字列レベル同一・データ単一情報源は動的読込で維持）+ 対決テスト（実リポジトリデータ + 合成パターンで両リーダー出力の同値性を機械検証）」パターンの手順・規約としての文書化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単発（PR #3075 case-run 実測）。fixture copy 規約系の既存 deferred（IR-062 copyScripts）は設計知見で別問題クラス |
| 影響度 | 2/5 | fixture テスト全起動不能を検知・委譲内で設計変更（リーダー複製 + 対決テスト）し解決済み |
| 横展開性 | 3/5 | repo-local checker 系（.opencode/skills/repo-*）の決定的実装共有全般。copyScripts 規約自体は本 repo 固有 |
| 反映先明確度 | 3/5 | 予防策・実装・テスト・単一情報源契約の構成は揃っているが、反映先が docs/knowledge/ と repo-agentdev-integrity 実装規約の複数候補で絞り切れていない（最終選択は下流） |
| 自動化適性 | 4/5 | パターン自体が機械検証（対決テスト）による担保であり、実装時の規約参照で適用できる |
| プロジェクト固有知識再利用性 | 4/5 | copyScripts fixture 規約と静的 import の衝突は本 repo の固有構造の落とし穴。実装パターンとして再利用価値が高い |
| 再発可能性 | 3/5 | checker 追加・改修で決定的実装共有が必要になる機会は散発的だが、fixture copy 規約が標準である限り衝突条件は存続 |
| 費用対効果 | 4/5 | 規約・ガイドへの追記で済み。パターンは PR #3075 で実装・機械検証済み |
| **加重合計** | **24/40** | |

- **推奨処分案**: 処分区分4（project knowledge — プロジェクト固有の実装パターン知見）→ 採用。対応実装は完了済み（git commit e4264eb9〔PR #3075〕の commit message に「抽出形式は alloc-req-number.ts の extractKnownGapNumbers と同一（単一情報源は numbering-policy.md、対決テストで機械検証）」明記、check_integrity.test.ts L17「REQ-087-004 対決テスト用」・L5166 同値性検証テスト、check_integrity.ts L560-562 単一情報源維持コメントを機械確認）だが、パターンの手順・規約文書は repo-agentdev-integrity の SKILL.md・references・guides に不在（配下 grep で対決テスト言及は test.ts と check_integrity.ts のみを機械確認）。対応完了済みでも残課題（パターン文書化）があるため昇華余地あり。反映先候補（情報候補・実現先の最終選択は下流）: docs/knowledge/ 知識文書（再利用可能な判断知識）、repo-agentdev-integrity 実装規約

#### エントリ一覧
- 2026-09-23: 自己完結 checker への実装共有は fixture 進行テスト構成と衝突するため同一形式リーダー複製 + 対決テストで担保する [inbox]

### 問題クラス4: agentdev_gh issue_list の大規模 population 全件列挙と labels 論理値/物理ラベル混同

- **根本原因**: (1) closed Case 群は repo の累積 population として大規模で、filter を指定しない全件列挙は Tool の安全ページ上限（10 ページ × 100 件）に達する。custom-tool-contracts.md L53「issue_list は Tool 内部で必要なページをすべて取得し完全一覧として返す」契約に対する上位層の絞り込み規律が文書化されていない (2) labels 引数は tracking 論理値（role/kind/trackingState）の物理マッピング入力であり、Case Issue に付く物理ラベル（enhancement 等）とは名前空間が異なる（role = agentdev-tracking は追跡Issueのみ付与）という運用上の注意が agentdev-issue-management・agentdev-issue-tracking Design に明記されていない
- **再発条件**: issue_list に search を付けず state: closed 等の広範 filter で実行した場合、または Case 物理ラベル名を labels に渡した場合
- **予防策**: issue_list の closed 検索には必ず search（冪等キー語・REQ 番号等）を併用する手順化。labels 引数は tracking 論理値専用であり Case 物理ラベルと混同しない旨の明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単発（Case #3077 case-open 実測、git commit c6ef2503 で capture 記録実在） |
| 影響度 | 2/5 | operation-failed で確認が一時停止したが contingency（gh CLI 手動読取）で解消。誤判定・破壊なし |
| 横展開性 | 4/5 | closed 含む広範 population での issue_list 実行は case-open 冪等検出・case-ready 横断依存検査・issue 操作で高頻度。累積 population で必ず上限に達する構造 |
| 反映先明確度 | 4/5 | 反映先候補（agentdev-issue-management、agentdev-issue-tracking Design）特定済み。custom-tool-contracts L53 との接続点も本実行で機械確認 |
| 自動化適性 | 3/5 | 運用手順の文書化が主体。Tool 契約変更は対象外（エントリ明記） |
| プロジェクト固有知識再利用性 | 3/5 | labels 論理値/物理ラベルの名前空間差は本 Tool 固有の契約知見 |
| 再発可能性 | 4/5 | search 無し実行は累積 population 増加により毎回上限到達。labels 混同は自然に起こる誤用 |
| 費用対効果 | 4/5 | 手順文書化・明記のみで低コスト |
| **加重合計** | **25/40** | |

- **推奨処分案**: 処分区分5（既存対策の更新: fix gap — issue_list 安全使用手順と labels 区別の運用文書不在）→ 採用。custom-tool-contracts.md L53 は完全一覧契約のみで運用規律の文書不在（grep 機械確認）、agentdev-issue-management SKILL.md・references に search 絞り込み規律不在（labels 記載は issue_create/update の引数規則のみを機械確認）、agentdev-issue-tracking Design L41 に物理写像表は既存だが labels 引数と Case 物理ラベルの名前空間差の運用上の注意は明記されず（本文確認）。Tool 操作契約の変更は対象外であり、運用側手順文書の整備が主体

#### エントリ一覧
- 2026-09-23: agentdev_gh issue_list は closed 全件検索で安全ページ上限に到達するため search 絞り込みが必須（labels 指定は物理ラベル不一致で 0 件になる） [inbox]

### 未分類
- なし（全4エントリが問題クラス1〜4に分類。問題クラス2 は deferred 既存エントリとの統合クラスタ）

## 重複判定（既存昇華済み成果物・deferred との突合）

- 問題クラス1: deferred 候補4件（L1041 行長上限、L1736 junction 断絶、L1862 CLI 契約差異、L1145 委譲再開）は根本原因が異なる。L1145 の「--base-ref はコミット済み差分のみ」部分言及は同族知見だが複合エントリで統合対象外。L1862（check_distribution_boundary.ts への --base-ref 誤用）は E1 の関連事例として採用済み成果物の既存対策確認に参照記録する（adversarial-review F-B1）。promoted は空のため突合対象なし。duplicate なし
- 問題クラス2: deferred L1736（targeted docs guard --root + --files）と同一問題クラス（統合クラスタ）。当該 deferred エントリの内容（main repo から --root + --files 併用で実行）は **worktree-operations.md L186-187 に実行例として正典化済み**（PR #3073〔git commit cec91c9b〕で追加、本実行で機械確認）であり、同等の内容が既存の配布物で十分にカバーされている → **duplicate 判定として prune 対象**。L1763（契約テスト untracked 実体）は根本原因（git 管理外実体の未投影）が異なるため関連事例参照のみ。前回実行（2026-09-22）の traceability check 事象は durable state に不在（成果物 revert 済み）のため本実行の突合対象外
- 問題クラス3: deferred 候補6件（copyScripts 規約、$PSScriptRoot、bun run、fixture categoryMap、baseline 行移動、bun install gitignore）はいずれも根本原因が異なる。duplicate なし
- 問題クラス4: deferred 候補4件（issue_update state 変化、pr_create invalid-input、REST numeric id、PR 検出不能）は根本原因が異なる。issue_list page-limit 系の既存エントリなし。duplicate なし

## promote 時prune結果（STEP-6 実行後確定）

- **対象エントリ数**: 4件（inbox 由来の deferred 追記分）
- **prune実施**: あり（staged 4件〔問題クラス1〜4の inbox エントリ。採用済み成果物「元learning item / 根拠」セクションへ全文保存後に除去〕+ duplicate 1件〔deferred 既存 targeted docs guard エントリ、worktree-operations.md 正典化済み〕。deferred.md 追記・検証後に除去）
- **prune候補**: 5件
- **prune却下**: 0件
- **promote 内部分析フェーズ時 prune**: 実施しない（既存 deferred エントリの棚卸しは本実行のスコープ外）

## 全体傾向

- 4件中3件が処分区分5（既存対策の更新）に収束し、ギャップはいずれも「正規契約・手順は既存だが、それと矛盾する案内・未カバー領域・運用文書不在が残存」という共通構造（問題クラス1: ヘルプ文言が正規手順と矛盾、問題クラス2: 汎用手順が plugins 系を未カバー、問題クラス4: 完全一覧契約に対する運用規律文書不在）
- PR #3073（worktree 構造的制約の main root 実体 + --root 指定手順整備）による前回是正後に、未カバー領域（textlint gate〔plugins 系〕）と矛盾する案内（--base-ref ヘルプ文言）が新規学びとして検出された。既存対策の「適用範囲」の検証が実効性を決める構造
- 問題クラス3のみ処分区分4（project knowledge）。対応完了済みでも「パターンの文書化不在」が残課題という形で昇華価値が成立
- worktree × junction 系は deferred 既存を含め3事例に蓄積し本実行の最高スコア（28/40）
- Jev 先行評価は5呼出（昇華判定4 + 発動条件1）全て成功。処分区分・8軸評価・問題クラス分類・昇華可能性の全判断で Jev と LLM 最終判断が一致（unchanged）

## Decision候補除外記録

- **対象item**: 問題クラス1（check_changed_docs.ts --base-ref ヘルプ不整合）
- **除外理由**: 仕様変更のみ・運用ルール（checker ヘルプ文言の表記是正と既存手順の相互参照補強で、アーキテクチャ上の決定・技術選定を含まない）
- **根拠事実**: 正規手順（case-run STEP-S3-4・worktree-operations.md L181）は既存で、残るギャップはヘルプ文言の表記不整合のみ（本実行で機械確認）
- **代替反映先候補**: check_changed_docs.ts ヘルプ文言（L54-55、usage L188-190。docs/designs/integrity/targeted-docs-guard-implementation.md の正典契約と整合する文言への修正候補。配布 script 実装面）
- **対象item**: 問題クラス2（worktree textlint gate junction）
- **除外理由**: 運用ルール（検査・gate 実行手順の適用範囲拡張の明文化。技術判断不在）
- **根拠事実**: REQ-018-005 汎用手順が既存で、plugins 系 junction 実体への適用明記の追記のみ
- **代替反映先候補**: worktree-operations.md 構造的制約節（main root 実体 + --root 指定手順）、REQ-018（REQ 行の変更要否は req-define が判断）
- **対象item**: 問題クラス3（checker fixture import 衝突）
- **除外理由**: 仕様変更のみ（確定済み設計判断〔単一情報源契約維持〕の実装パターン文書化であり、新規アーキテクチャ決定・技術選定を含まない。PR #3075 で実施・機械検証済み）
- **根拠事実**: git commit e4264eb9 と対決テスト（check_integrity.test.ts L17・L5166）の実在を機械確認
- **代替反映先候補**: docs/knowledge/ 知識文書、repo-agentdev-integrity 実装規約（skill reference）
- **対象item**: 問題クラス4（issue_list page limit）
- **除外理由**: 運用ルール（Tool 操作の絞り込み規律の明文化。技術判断不在。Tool 操作契約の変更は対象外とエントリ明記）
- **根拠事実**: custom-tool-contracts.md L53 の完全一覧契約は既存で、運用側手順文書の追記のみ
- **代替反映先候補**: agentdev-issue-management references（issue-operation-safety.md 等）、agentdev-issue-tracking Design（labels 論理値と Case 物理ラベルの対応明記）

## Jev 先行評価記録

- **provider**: vercel-ai-gateway / resolvedModel: typesafe-ai/jev
- **呼出**: 5回（問題クラス1〜4の昇華判定4回 + STEP-4 発動条件判定1回。各昇華判定は problem-class choice + 8軸 score×8 + disposition choice + sublimability boolean、問題クラス2 は統合クラスタ2件目の処置 question を追加。発動条件判定は review-trigger boolean）
- **結果**: 5呼出とも成功（outcome: completed）。confidence: 0.88 / 0.95 / 0.96 / 0.95 / 0.92。発動条件判定は true（p=0.92）
- **llmTreatment 集計**: 問題クラス1〜4・発動条件判定の全てで全判断 unchanged（Jev 分布の主峰水準と LLM 最終判断が全軸・全 choice 一致）
- **処分区分**: 4クラスすべてで Jev と LLM 最終判断が一致（区分5 / 区分5 / 区分4 / 区分5）。問題クラス2 の統合クラスタ2件目処置も Jev と LLM が一致（duplicate として prune）
- **observation warning**: 本実行の observation_write は未実施。evaluate 応答に inputs.requestDigest に相当する情報が含まれず、観測 JSON の契約必須項目（requestDigest、sha256 hex）を正当に構成できないため。擬似的な digest の生成は契約違反（擬似再生成）にあたるため行わない。評価自体は Jev 結果を LLM 最終判断の追加情報として正常に機能した。観測ループ（DEC-027）への観測欠損として本報告に warning を明示する

## adversarial-review 記録（STEP-4）

- **発動条件判定**: 発動（default-on。Jev review-trigger true〔p=0.92〕。skip 条件〔inbox 1件のみかつ既存対策との重複確実、または inbox 空〕非該当 — inbox 4件・問題クラス4つ。evaluation-report 反映済み。不可逆処理未実行を確認）
- **レビュー戦略**: 対象 = evaluation-report.md の処分判定（区分5/5/4/5）、8軸評価、統合クラスタ構成、duplicate 判定（deferred targeted docs guard の prune）、既存対策照合。目的 = (a) 誤採用・誤廃棄 (b) 誤統合・誤分離 (c) duplicate 判定の妥当性 (d) 既存対策照合の照合漏れ (e) 自律確定可否の取り逃しの検出。立場 = 保守者（living pool 保全・過剰昇華の検出）、運用者（後続 workflow〔req-define・backlog-review〕観点・成果物品質）。証拠 = targeted-docs-guard-implementation.md、worktree-operations.md、docs/knowledge/ 見出し12件、REQ-018、custom-tool-contracts.md、deferred 実エントリ、git log/commit message、checker 実装本文。戦略メタ反証 = docs/knowledge/ 配下が照合対象から漏れていたため追加照合を実施（checker CLI 系・worktree 系知識文書12件の見出し確認。本実行の4問題クラスに該当する知識文書なし、照合漏れなし）
- **challenge（2系統の独立 stream。初期 finding 生成完了前に兄弟 stream の finding 非共有）**:
  - stream-A（保守者立場・過剰昇華と prune 濫用の批判）: F-A1 deferred targeted docs guard エントリの duplicate 判定と prune は規約上安全か（→ 検証の結果解消: prune 規約の duplicate 定義〔既存の恒久契約、知識、配布物で十分にカバー〕に機械適合。当該エントリ内容は worktree-operations.md L174-193 に正典化済み〔PR #3073、移動日 2026-09-07 の残置判断時点では正典化前で矛盾なし〕。技術知識の正典側存在確認済みで、prune 記録に根拠と出現履歴を残すことで情報保全）／F-A2 textlint gate と targeted docs guard の統合は誤統合では（→ 撤回: 根本原因〔.opencode/ 配下 junction 未伝播〕・再発条件〔worktree で junction 系実体に依存する実行〕・予防策〔main root 実体 + 対象指定の汎用手順明文化〕の3要素が本質的に同じ。plugins 系と skills 系の実体配置差は成果物の対象記述で解消）／F-A3 対応完了済み・単発・最低スコアの E3 採用は過剰では（→ 撤回: 前回 rejected 判例〔Jev SDK criteria〕は構造的検知網が知見を機械化済みで文書化必要性が消えたケース。E3 はパターン自体の規約・文書が不在で機械化されておらず、情報自足的で断片的でないため「昇華の余地なし」不成立）／F-A4 影響度 2 は docs gate 空振りの検査見逃しを過小評価（→ 不成立: 軸定義「発生時の被害、手戻りの大きさ」に対し即回収・実害なし・手戻り小の実測で妥当）
  - stream-B（運用者立場・照合漏れと成果物品質の批判）: F-B1 E1 の同種誤用事例（check_distribution_boundary --base-ref 誤用、deferred L1862）の照合が浅い（→ 部分合意: L1862 を E1 成果物の既存対策確認に関連事例として記録〔根本原因は checker 間契約推測流用で異なる〕）／F-B2 CLI 契約の Design 正典（targeted-docs-guard-implementation.md）への照合漏れ（→ **成立**: L25-26・L37・L163 に「--base-ref はコミット後・push 前に限定、コミット前は --files 標準」の正典契約が既存。checker ヘルプ文言はこの Design 正典と正反対の案内であり、E1 の既存対策照合を修正・強化し、ギャップを「checker ヘルプ文言1点」に一元化。評価 STEP-2 への戻し反映済み）／F-B3 E4 の fix gap は agentdev-issue-tracking Design L41 物理写像表の既存内容と重複しないか（→ 部分合意: fix gap は維持〔issue_list 操作面の運用注意は不在。実測で誤用が発生〕、成果物に「既有内容の運用面への明確化」を記録）／F-B4 対応完了済み部分と残ギャップの区別が成果物に出るか（→ accepted: 各成果物の制約セクションに対応済み事実〔PR #3074/#3075、c6ef2503、e4264eb9 等〕を記録し req-define の再調査対象を限定）
- **convergence**: 4問題クラスの処分区分（区分5 / 区分5 / 区分4 / 区分5）は対論後も全て維持。統合クラスタ構成と duplicate prune 判定も維持。accepted finding は F-A1〔解消・記録強化〕・F-A2〔撤回〕・F-A3〔撤回〕・F-B1〔部分合意〕・F-B2〔成立・照合修正〕・F-B3〔部分合意〕・F-B4〔accepted〕で、本レポートの問題クラス1・4 の推奨処分案・重複判定・Decision 候補除外記録・promoted 成果物の既存対策確認・制約セクションへ反映済み
- **convergence audit**: 合意候補を prune 規約・分類基準・正典整合で再検査: (1) duplicate prune は prune 規約の duplicate 定義と正典実在〔worktree-operations.md L186-187〕で機械適合 (2) E1 の照合修正は Design 正典 L25-26・L37 の verbatim 事実に整合し、処分区分・8軸スコアは不変 (3) 統合クラスタの3要素（根本原因・再発条件・予防策）一致は deferred エントリ本文で確認済み。新たな本質的争点なし
- **戻しループ**: F-B2 反映により問題クラス1 の既存対策照合の意味内容が補強されたが、問題クラス構成・8軸スコア・処分区分は不変のため STEP-2 への完全な戻しは照合修正のみで完結。再 review 発動条件（新たな本質的争点が生じ得る場合）不成立。停止条件4点〔新しい本質的 finding なし、全 finding 処理済み、ユーザー判断事項なし、再 review 対象の意味変化なし〔判定結果は不変〕〕を満たしループ離脱
- **unresolved**: なし

## 自律確定記録（STEP-5 証跡）

- **問題クラス1**: 確定処置 = promote（採用、処分区分5 fix gap〔範囲: checker ヘルプ文言1点に一元化後〕）。主要根拠: (1) ヘルプ文言 L54-55 が Design 正典（targeted-docs-guard-implementation.md L25-26・L37・L163）・case-run STEP-S3-4・worktree-operations.md L181 の3面すべてと矛盾することを機械確認 (2) 8軸 25/40・再発可能性4（誤案内現存、PR #3074 実測）(3) 反映先が checker ヘルプ文言に一元化。HITL 不要理由: 正典との矛盾箇所を機械特定済みで、処置（採用済み成果物生成・反映先候補記録）が取得可能な根拠から一意に確定できる。実現面の修正要否は req-define の判断事項として記録するのみ
- **問題クラス2**: 確定処置 = promote（採用、処分区分5 fix gap。統合クラスタ構成）。統合クラスタ2件目（deferred targeted docs guard）= duplicate（worktree-operations.md 正典化済み）として prune。主要根拠: (1) REQ-018-005・worktree-operations.md L172-202 が「junction 系 skill scripts」限定で textlint gate（plugins 配下）を未カバーであることを機械確認（gate.ts 実体 glob 確認含む）(2) 8軸 28/40・3事例蓄積・高頻度経路 (3) duplicate 判定は prune 規約の定義と正典実在で機械適合。HITL 不要理由: クラスタ構成・処置・統合クラスタ2件目の処置（duplicate prune）がすべて取得可能な根拠から一意に確定できる
- **問題クラス3**: 確定処置 = promote（採用、処分区分4 project knowledge）。主要根拠: (1) 対応実装・対決テストの証跡を git commit e4264eb9・check_integrity.test.ts L17/L5166・check_integrity.ts L560-562 で機械確認 (2) パターン文書の不在を repo-agentdev-integrity 配下 grep で機械確認 (3) 情報は自足的で断片的でなく、単発でも文書化は一回で足りるため「昇華の余地なし」不成立。反映先候補（docs/knowledge/ と実装規約）は情報候補として両方記録し、実現先の最終選択は下流に委ねる。HITL 不要理由: 学習価値（保存適否）の判定根拠が機械確認済みで、処置が一意に確定できる
- **問題クラス4**: 確定処置 = promote（採用、処分区分5 fix gap）。主要根拠: (1) custom-tool-contracts.md L53・agentdev-issue-management・agentdev-issue-tracking Design L41 に運用規律・操作面注意が不在であることを機械確認 (2) 8軸 25/40・search 無し実行は累積 population で毎回上限到達 (3) Tool 契約変更は対象外（エントリ明記）で運用文書整備のみ。HITL 不要理由: 既存対策照合が機械確認済みで、処置が一意に確定できる
- **破壊的変更**: なし（inbox.md は正規の deferred 移動手続によるクリアのみ。deferred.md 既存130エントリのうち prune するのは duplicate 判定1件のみで、規約適用により STEP-5 判定確定と同時に承認済み）
