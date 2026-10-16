# 評価レポート

## メタデータ

- **実行日時**: 2026-10-16（backlog-auto stage 2 learning 系統。run 開始 2026-10-16T12:24:46+09:00）
- **基準 revision**: 5c78cbf17f62628093196da61574d3c01caffc39（inbox.md は本 revision で capture 済み。実行開始時 HEAD と一致を確認）
- **対象エントリ数**: inbox 8 件、deferred 247 件（見出し251行のうち4行は様式・説明見出し）
- **問題クラス数**: 8（すべて単独1エントリ構成。E1/E2 は deferred pool 内に同クラス先行エントリがあり、意味クラスとしては2エントリ相当として発生件数を導出）
- **Jev**: 分類1評価・8軸6評価（E4/E5、E6/E7 は同一評価にバッチ）・処分区分1評価・昇華可能性1評価・adversarial-review 反映後の再判定1評価（d-e1/d-e5/d-e7/u-e7/e7-反映先明確度、20261016T043301Z-56dc）。finalResult は observation_write で追記済み。evaluator との差異は d-e3/d-e4（project knowledge→deferred）に semantic_disagreement、e2-再利用性/e2-再発可能性/e3-影響度 に水準差を記録。再判定では d-e1 が一致（既存対策の更新）、d-e5（evaluator: rejected→最終: deferred）・d-e7（evaluator: rejected→最終: duplicate）・e7-反映先明確度（evaluator: 5→最終: 4）に semantic_disagreement を記録（各観測 JSON 参照）。発生件数軸は deterministic 境界により機械導出し評価対象外
- **旧 report**: 2026-10-15 実行分（41件対象）のため本レポートで上書き置換
- **extension**: `.agentdev/extensions/skills/agentdev-workflow-learning-promote.yaml` は 5 セクションすべて空（読込実測）
- **旧 resume note**: `.agentdev/learning/learning-promote-2026-10-15-resume.md` は前回 run の中断時履歴として保持（本 run の再構成には使用せず、削除もしない）

## 判定基準

処分はスコアのみで決めず、既存恒久対策の現状、実害、情報の自足性、昇華可能性、既存プールとの関係を併せて評価した。十分な恒久対策により既に網羅されているものだけ duplicate とし、deferred pool に似た記録があるだけでは duplicate にしない。promote（既存対策の更新）は既存恒久手順の具体的 gap を実測（grep・ファイル読取）で確認できた場合に限った。Decision 候補は禁止条件ゲート（`agentdev-decision-guidelines` 除外基準）で全単位除外した。

## 問題クラス一覧

軸順: 発生件数 / 影響度 / 横展開性 / 反映先明確度 / 自動化適性 / プロジェクト固有知識再利用性 / 再発可能性 / 費用対効果。加重合計は満点40（/40）。E番号は inbox 見出しの出現順（E1〜E8）。

### C1: agentdev_gh Custom Tool が plugin ホスト環境でのみ gh を無出力・非ゼロ終了させる障害

- **根本原因**: 未特定（opencode plugin ホスト〔長時間稼働 bun プロセス〕から spawn された gh のみが無出力・非ゼロ終了。gh 認証・バイナリ・AGENTDEV_GH_REPO は正常確認済み。ホスト再起動で回復する可能性）
- **再発条件**: opencode plugin ホストプロセスの環境から gh を spawn した場合
- **予防策**: runner-cli.ts failFromExec detail へ bash 直叩き分離試験の diagnostic 提案を含める、opencode サーバー再起動を再開 contingency として手順化、stderr 空失敗時の環境差診断出力（機密値除去）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E1 + deferred pool 同現象エントリ（2026-09-25移動、再発4回を統合）の2エントリ構成。再発実績は通算5回 |
| 影響度 | 4/5 | 書込み操作は代替不可で fail-closed 停止。Root Case blocked 停止が通算4回の履歴 |
| 横展開性 | 3/5 | opencode harness 環境固有だが agentdev_gh を使う全 workflow に波及 |
| 反映先明確度 | 4/5 | 知識文書候補・runner-cli.ts・guides・retired REQ-093 と具体。反映先実在も実測済み |
| 自動化適性 | 3/5 | 前置死活チェック・diagnostic detail 拡張は自動化可能。再起動は運用 |
| 再利用性 | 4/5 | agentdev_gh 利用全 workflow の運用知識として再利用価値が高い |
| 再発可能性 | 4/5 | 通算5回再発。ただし発生は harness プロセス状態に条件付き（未特定） |
| 費用対効果 | 4/5 | 死活確認1操作と detail 拡張は低コストで再発時の停止コストを大きく低減 |
| **加重合計** | **28/40** | |

- **推奨処分案**: promote（5 既存対策の更新）〔adversarial-review 反映で 4 project knowledge から変更〕。初期評価の「恒久対策不在」は review で反証された: REQ-052-014（環境起因識別 detail の恒久契約）・REQ-052-015（known-issues 運用文書保持契約）と運用文書 `issue-operation-recovery.md`（2026-10-09 作成・基準 revision 祖先で実在）が診断手順・harness 再起動回復・再開手順・gh exit 66 例外手順まで既に規定する。残る真の gap は（1）診断手順に 2段分離試験〔bash 直叩き + bun CliRunner 直接実行による runner 契約と実行環境の正常性の分離〕の明記欠落、（2）failFromExec detail 文言への分離試験提案欠落。E1 の新知見は既存運用文書の更新候補として自足的に引き渡せる（通算5回目の再発・pool の知識文書化再評価指示は根拠として維持）
- **既存対策照合**: 対策あり・ギャップ: fix gap（診断手順の分離試験明記欠落・detail 提案欠落）。REQ-052-014/015 実在（`docs/requirements/REQ-052.md` L34-35）、`issue-operation-recovery.md` 実在（再起動回復 L29-32、委譲前疎通確認 L53、gh exit 66 例外手順 L56。`git log --follow` で 489b2522 2026-10-09 作成、基準 revision の祖先を確認）。runner-cli.ts failFromExec（L188-210）は envHint と AGENTDEV_GH_REPO/auth 確認を含み、予防策候補の「stderr 空失敗時の環境差診断出力」は REQ-052-014 で既に充足済みと訂正。分離試験提案と再起動 contingency の detail 明記は未実装
- **エントリ一覧**
  - agentdev_gh Custom Tool 経由の gh が exit 66 で失敗し bash 直叩きは成功する [inbox]
  - agentdev_gh がハーネスプロセス内で gh exited with 66（無出力）で全系操作失敗 [deferred・L2347]

### C2: 配布物本文への正規成果物 concrete ID 直書きが配布依存境界 checker に検出される

- **根本原因**: REQ 行との対応関係の正本は traceability sidecar であり、配布物本文への ID 直書きは配布依存境界違反になるという契約の再適用場面（契約不備ではない）
- **再発条件**: references 等の配布物本文へ REQ ID を追記した場合
- **予防策**: 参照是正系変更時の checker 実行前置（既存運用どおり）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 2/5 | E2 + deferred pool 同内容エントリ（2026-10-13移動・PR #3669 事例）の2エントリ構成 |
| 影響度 | 1/5 | checker が設計どおり検出し即修正。実害なし |
| 横展開性 | 3/5 | 配布物編集全般で起こり得るが checker が常時担保 |
| 反映先明確度 | 4/5 | 内容は自足的。ただし対応不要（既存契約どおり） |
| 自動化適性 | 5/5 | 予防策は既に checker として完全自動化済み |
| 再利用性 | 3/5 | 規律自体は恒久契約に存在し、learning としての追加価値は中程度 |
| 再発可能性 | 3/5 | 直書き自体は再発し得るが checker が検出して実害化しない |
| 費用対効果 | 4/5 | 追加対策コスト不要 |
| **加重合計** | **25/40** | |

- **推奨処分案**: duplicate。同等の内容が既存の恒久契約（REQ-029 配布依存境界・check_distribution_boundary.ts 配布恒久 checker）と pool 先行記録（2026-10-13移動エントリ）で十分にカバーされている。事象は契約どおりの検出・是正の実践記録であり、新しい恒久成果物を生成しない
- **既存対策照合**: 対策あり・ギャップなし
- **エントリ一覧**
  - 配布 closure の src 側本文への concrete REQ ID 直書きは配布依存境界 checker の検知対象である [inbox]
  - 配布物（workflow reference 等）への REQ ID 直記は配布境界 concrete-id 検出で違反になる [deferred・L4511]

### C3: 一時 Git リポジトリ（テスト fixture）が親の .gitattributes を継承しない

- **根本原因**: git init で生成される一時リポジトリは属性ファイルを親から引き継がない（git の一般挙動）
- **再発条件**: autocrlf=true 等の環境差がある Windows 環境で一時 Git fixture テストを実行した場合
- **予防策**: fixture 雛形テンプレートへの .gitattributes 同梱

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | 警告 633 件のみ。テスト失敗なし。対応済み |
| 横展開性 | 5/5 | autocrlf 環境の一時 Git fixture を使う任意プロジェクトで発生し得る一般挙動 |
| 反映先明確度 | 2/5 | 反映先は「fixture 追加時の留意」で特定文書を名指さない |
| 自動化適性 | 4/5 | fixture 雛形への同梱は機械的 |
| 再利用性 | 3/5 | fixture 作成時の一般知識として中程度の価値 |
| 再発可能性 | 4/5 | 新規 fixture 追加のたびに再発し得る |
| 費用対効果 | 4/5 | 対策コストは極小 |
| **加重合計** | **24/40** | |

- **推奨処分案**: deferred。単発1件・実害は警告のみで既に対応済み・反映先が曖昧（特定文書なし）。Jev は project knowledge を最上位候補としたが、出現1件・影響軽微・自足性が不足しており living pool で再評価する（semantic_disagreement で記録）。再評価条件: 同種警告の再発時、fixture 雛形テンプレート化の機会発生時
- **既存対策照合**: 対策なし（本現象を扱う恒久契約・知識文書は未確認）。反映先実在性確認: `.opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher-fixture.ts` 実在を実測（find で確認）。消滅していないため現行化不要
- **エントリ一覧**
  - 一時 Git リポジトリ（テスト fixture）には親リポジトリの .gitattributes が継承されない [inbox]

### C4: lint_skills 環境差判定の検出条件は distributed layout に限定される

- **根本原因**: 構造制約（テスト fixture の構造）による設計上の限定
- **再発条件**: projection 構成変更時に判定規約を更新しなかった場合
- **予防策**: projection 構成変更時の checker 判定規約の追随確認

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 1/5 | 実運用影響なし（設計知識の記録） |
| 横展開性 | 2/5 | 本リポジトリの projection 規約に固有 |
| 反映先明確度 | 4/5 | lint_skills.ts と条件（判定規約変更時）を明示 |
| 自動化適性 | 3/5 | projection 変更時チェックに組込み可能 |
| 再利用性 | 2/5 | lint_skills 保守者に限定される知識 |
| 再発可能性 | 2/5 | projection 構成変更時のみ発火する条件付き |
| 費用対効果 | 3/5 | 追随確認コストは小さいが発火機会も稀 |
| **加重合計** | **18/40** | |

- **推奨処分案**: deferred。実運用影響なし・将来条件付き（projection 構成変更時のみ有意）・単発。Jev は project knowledge を最上位候補としたが、発火条件が将来の構成変更に限定され現時点で昇華すべき具体的変更を伴わないため living pool で保持する（semantic_disagreement で記録）。再評価条件: projection 構成（repo- 接頭辞規約等）の変更時
- **既存対策照合**: 対策なし。反映先実在性確認: `.opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts` 実在を実測（ls で確認。初期記載の `src/common/skills/...` パスは不存在を review で指摘され訂正。lint_skills.ts L471-477/L524 は distributed layout 制限を in-code 自己文書化）
- **エントリ一覧**
  - lint_skills 環境差判定の検出条件は distributed layout に限定される [inbox]

### C5: 一括是正スイープ Issue が「対象実測 0 件」で完了する形態（委譲時の前提扱い禁止）

- **根本原因**: AG-005「検出時都度進行」運用が複数 Case で自然に機能し、起票から実行までの間に債務が解消した（本件は規律どおりの正常動作記録）
- **再発条件**: 起票時実測に依存した対象一覧を委譲し、実行時点の実測を省略した場合（本件では省略は発生していない）
- **予防策**: 実施時実測の必須化を委譲プロンプトへ明記（既存の AG 条項どおり・既に存在し適用済み）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ（pool の同型記録は根本原因が別 Process と判断し同一クラスに数えない） |
| 影響度 | 1/5 | 誤った是正は発生していない（実測優先が機能） |
| 横展開性 | 3/5 | backlog 統合・一括是正系の委譲フロー一般で起こり得る |
| 反映先明確度 | 4/5 | 既存 AG 条項と learning-capture 委譲計画条項を明示 |
| 自動化適性 | 4/5 | 実施時実測の必須化は手順明記で容易 |
| 再利用性 | 3/5 | 委譲運用の一般知識として中程度 |
| 再発可能性 | 2/5 | 規律が機能しているため実害の再発は低い |
| 費用対効果 | 4/5 | 追加対策コスト不要（既存条項で担保） |
| **加重合計** | **22/40** | |

- **推奨処分案**: deferred〔adversarial-review 反映で duplicate から変更〕。初期評価の duplicate 根拠（恒久的委譲規律の被覆）は review で実在確認できず: REQ-003 に実測必須化条項なし（grep 実測 0 件）、AG 条項（AG-004/005/006）は Case #3729 固有の実行時条項で恒久成果物に非ず、learning-capture SKILL に委譲計画条項なし。pool L953 は根本原因が別のため同一クラスに数えない（初期レポート内の記述不整合〔同一クラスと数えない宣言と duplicate 根拠使用の矛盾〕を訂正）。実害なし・正常動作の実践記録で新規恒久成果物は不要だが、恒久契約による完全被覆も確認できないため判定基準どおり living pool で保持する。再評価条件: 同型スイープ Issue の再発時、委譲時実測を恒久化する機会発生時
- **既存対策照合**: 対策あり（Case 固有の AG 条項が本件実行を担保）・ギャップ: 恒久規律への未昇格（実施時実測必須化を恒久条項として規定する文書は未確認）
- **エントリ一覧**
  - 一括是正スイープ Issue が「対象実測 0 件」で完了する形態がある [inbox]
  - backlog 統合バッチの旧スナップショット分析から生成した Issue が作成時点で解消済みになる [deferred・L953・同型参照]

### C6: 同一ファイルの軽微な行重複は GitHub squash merge が CONFLICTING にならず auto-resolve し得る

- **根本原因**: GitHub の merge 機構が同一変更内容の行を畳み込む（trivial 重複の auto-resolve。platform 挙動の知見）
- **再発条件**: 同一ファイルへの並列変更 PR を直列化せず連続マージした場合（CLEAN 判定でも意味的重複の危険は残る）
- **予防策**: 同一ファイル接触 PR の merge 後重複検査を case-close の取り込み確認手順に明記

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 2/5 | 本件実害なし。ただし無音の重複混入リスクを内在 |
| 横展開性 | 4/5 | GitHub 並列 PR 運用一般に適用し得る platform 挙動知見 |
| 反映先明確度 | 4/5 | pr-merge-and-conflict.md を具体名指し |
| 自動化適性 | 4/5 | merge 後の重複行実検査は機械的 grep で容易 |
| 再利用性 | 3/5 | case-close 運用知識として中程度 |
| 再発可能性 | 3/5 | 直列化運用が現行のため発生は条件付き |
| 費用対効果 | 4/5 | 検査追加は低コスト |
| **加重合計** | **25/40** | |

- **推奨処分案**: promote（5 既存対策の更新）。既存恒久手順に具体的 gap を実測で確認: `pr-merge-and-conflict.md` の GitHub 版 STEP-4 は mergeable ポーリング・CONFLICTING 分岐・STEP-4-4/4-5 を規定するが、同一ファイル接触 PR の直列マージ後の重複行実検査の規定がない（rebase 解消編集の取り込み確認〔L104〕とローカル版の意味突合〔L112〕のみ）。無音 auto-resolve の platform 挙動と前置検査の明記候補を自足的に引き渡せる。review の補足を反映: 最も近い既存の merge 後確認は STEP-4-4 L89「内容重複確認」（ローカル先行 commit vs remote squash・`git pull --ff-only` 失敗予防目的）であり、新規検査条項はこれと区別して明記する必要がある
- **既存対策照合**: 対策あり・ギャップ: fix gap（取り込み確認手順のカバレッジ欠落）
- **エントリ一覧**
  - 同一ファイルの軽微な行重複は GitHub squash merge が CONFLICTING にならず auto-resolve し得る [inbox]

### C7: 既存 package の型定義解決先を明示せずルートから ad-hoc tsc 実行し失敗を誤認する

- **根本原因**: 型定義解決先（検証対象が依存する package の node_modules/@types）を指定せずルートから ad-hoc 実行したため
- **再発条件**: ルート直下の ad-hoc tsc 実行で型定義未解決を確認した段階で typecheck 不可能と報告した場合
- **予防策**: 型検証の実行手順に、対象が依存する package 配下の型定義明示を必須化

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 2/5 | 誤報告1回。後続委譲が実測で訂正済み |
| 横展開性 | 4/5 | ad-hoc 型検証の誤認は任意の TS package 検証で起こり得る |
| 反映先明確度 | 4/5 | 〔review 反映で訂正〕checker-execution-contracts.md「実行形態規律（集約）」と qg-4-final-acceptance.md L354/L360 を特定文書として名指せる |
| 自動化適性 | 4/5 | 実行手順への明記は容易 |
| 再利用性 | 3/5 | 型検証運用の一般知識 |
| 再発可能性 | 3/5 | ad-hoc 検証は今後も起こり得る |
| 費用対効果 | 4/5 | 手順明記は低コスト |
| **加重合計** | **25/40** | |

- **推奨処分案**: duplicate〔adversarial-review 反映で deferred から変更〕。初期評価の「恒久規定なし」は review で反証された: checker-execution-contracts.md「実行形態規律（集約）」L280（tsc は対象 package 配下を cwd として実行する。2026-10-05 確定）、qg-4-final-acceptance.md L354（tsc 型検証は bun install による @types/bun 等の復元を前提。2026-09-07 確定）、case-run-pre-delegation-staleness-check.md L27（型解決の成否は bun install → bunx tsc --noEmit 相当の実測を要する）が、E7 の予防策（依存 package 配下の型定義明示を必須化）を文字通り恒久規定しており、いずれも事象（Case #3725・PR #3727、2026-10-15 merge）より前に確定済み。ルート直下 ad-hoc 実行は既存契約の再適用場面であり、E2 と同型の契約適用記録として新しい恒久成果物を生成しない
- **既存対策照合**: 対策あり・ギャップなし（既存実行形態規律の適用不履行を後続委譲〔DEL-3725-2〕が実測で訂正済み）。pool 関連記録（L2428/L4338/L4902）は根本原因が別のため分類上は別クラスを維持
- **エントリ一覧**
  - 既存 package に型定義がある場合、ルートの ad-hoc 実行だけで型検証不能と結論しない [inbox]

### C8: record-comments の applySection でセクション置換するとセクション後の HTML コメントが消える

- **根本原因**: applySection の置換範囲は次の「## 」見出しまで（または文書末尾）であり、見出し無しで後に続く HTML コメント群は前セクションの一部として扱われる（`record-comments.ts` L203 実在を実測）
- **再発条件**: 文書末尾のセクション（後続見出しが存在しないセクション）を applySection で置換した場合（case-close STEP-5-2 の本文結果セクション更新で構造的に起こり得る）
- **予防策**: applySection 呼出し前のセクション後コンテンツ保全確認の手順化、または record-comments.ts の境界検出改善（エントリが learning-promote での候補化を明示）

#### 8軸評価スコア

| 軸 | スコア | 判定理由 |
|---|---|---|
| 発生件数 | 1/5 | 単独エントリ |
| 影響度 | 3/5 | 履歴コメント（工程記録）の本文からの消失という実害が1回発生（復元済み） |
| 横展開性 | 1/5 | record-comments.ts とその適用箇所は本配布物に固有 |
| 反映先明確度 | 5/5 | 機構（L203）・再発条件・予防策の2案・反映先手順を自足的に整備 |
| 自動化適性 | 4/5 | 前置保全確認または境界検出改善は機械的 |
| 再利用性 | 3/5 | case-close/STEP-5-2 運用知識として中程度 |
| 再発可能性 | 4/5 | STEP-5-2 の本文更新で後続見出し無しセクション置換は繰り返し起こり得る |
| 費用対効果 | 4/5 | 手順明記または境界改善は低〜中コストでデータ保全を向上 |
| **加重合計** | **25/40** | |

- **推奨処分案**: promote（5 既存対策の更新）。既存恒久手順に具体的 gap を実測で確認: case-close references（docs-and-design-promotion.md、issue-resolution-and-qg4.md ほか全文 grep）に applySection 適用前のセクション後コンテンツ保全確認の規定は存在しない。データ喪失実害1回、修復コスト実績、entry 自身の候補化明示を根拠に自足的な更新候補として引き渡せる
- **既存対策照合**: 対策あり（Issue 更新時の前後比較〔agentdev-issue-management SKILL L23・issue-operation-safety.md〕）・ギャップ: fix gap。review の補足を反映: `cleanup-and-capture.md` L41 の STEP-5-2 条項「既存セクションの順序と内容は保持する」が内容保持の意図を既に宣言しており、gap の性格は「規定不在」よりも「この条項と applySection の末尾セクション境界挙動（endIndex 初期値 `lines.length` で後続見出し無しコンテンツを消費）との不整合」。反映先候補は手順明記に加え script 境界改善（record-comments.ts）を第一候補として併記
- **エントリ一覧**
  - record-comments の applySection でセクション置換するとセクション後の HTML コメントが消える [inbox]

### 未分類

- なし。8件すべて問題クラス C1〜C8 へ帰属（各クラス1エントリ）。Jev 分類評価も全件同一帰属（confidence 0.99、観測 20261016T040823Z-35a5）。入力正規化: 8件すべて新13フィールド形式相当であり旧フォーマット正規化の適用はなかった。元 inbox は変更していない

## promote 時 prune 結果（実績）

- **対象エントリ数**: inbox 8件（全件 deferred 移動対象。原子的操作で移動と prune を同時適用）
- **prune実施**: あり（2026-10-16。STEP-5 判定確定と同時に承認済み〔hitl-and-persistence.md STEP-6 手順4〕。メモリ完結→全検証→一括原子書込の機械実行規律に従い、読戻し検証で内容一致を確認）
- **prune実施**: 5件（promote 3〔E1/E6/E8。採用済み成果物の「元learning item/ 根拠」セクションへ証拠保存済み〕+ duplicate 2〔E2/E7〕）
- **prune却下（deferred 残置）**: 3件（E3/E4/E5。移動日 2026-10-16 と処分判定を付して living pool へ追加）
- **既存 pool への追加 prune**: 実施せず（任意運用のため保守的に残置。pool 247件→250件〔見出し254行〕）
- **C1 統合記録**: deferred pool 同現象エントリ〔2026-09-25移動・再発4回統合〕へ「追記（2026-10-16 統合・5回目再発）」を適用し、promoted 成果物への昇華と統合を記録
- **検証結果**: 見出し251行→254行、移動日 2026-10-16 ×3、文字化け 0、BOM/CRLF なし、pruned 5タイトル不在・retained 3タイトル各1件、inbox ヘッダーのみ、読戻し一致
- 既存 pool（247件）への追加 prune は本 run では実施しない（任意運用のため。並列 run 下では保守的に残置）

## 全体傾向

- **高頻出・高影響**: agentdev_gh plugin ホスト環境障害（C1）が通算5回の再発で最大の反復課題。恒久化が retired REQ-093 廃止後に不在のまま
- **横展開性が高い**: C3（git 一般挙動）、C7（TS 型検証一般）はプロジェクト外でも起こり得る知見
- **自動化適性が高い**: C2（既に checker で自動化済み）、C6/C8（機械的検査・境界改善で自動化可能）
- **全体的な観察所見**: 本 batch は Case #3725 クローズ由来の記録が中心で、実害が軽微かつ対処済みの実践記録が多い（C2/C7 は duplicate 適正、C5 は正常動作記録として deferred）。恒久手順の gap が具体実測できた C6/C8 と、反復実害があり既存運用文書の明記欠落が確認できた C1 が昇華価値の中心。1件（C8）は配布物改良（script 境界改善）と手順明記の両候補を含む

## Decision 候補除外記録

- **対象 item**: C1〜C8 全単位
- **除外理由**: 技術判断不在 / command仕様 / 運用ルール
- **根拠事実**: 全単位が運用・検証・手順の知見であり、アーキテクチャ上の決定、技術選定、設計判断の新規確定を含まない（C1 は恒久化の再評価候補だが Decision 新規確定ではなく REQ 再評価の情報候補）
- **代替反映先候補**: REQ/Design/配布skill references/guide/knowledge（各クラスの反映先候補は採用済み成果物の「反映先候補」参照）

## 実行証跡

- STEP-1: inbox 8エントリ（134行）を読込・正規化。deferred インデックススキャン: 見出し251行（実エントリ247件）。候補選択: タグ一致・見出しトークン一致・直近20件の過剰包含で候補本文を読込（主要候補: L2279/L2347/L3032〔gh 系〕、L4511〔配布境界〕、L953〔スナップショット〕、L2428/L4338/L4902〔型検証〕、L507/L2932/L4638/L1964〔Issue 本文・更新〕、L635/L1952/L4120/L3637/L2831〔merge 系〕、L1799/L2734〔lint_skills〕、L2064/L3595〔鮮度〕）。全面読みフォールバック対象エントリは発生しなかった
- 既存対策の実測: `grep` と正規文書の直接読取で全クラスを確認。C1 = runner-cli.ts L188-208（detail 拡張未実装）+ `docs/requirements/retired/REQ-093.md` 実在。C2 = 配布恒久 checker 実在。C3 = launcher-fixture.ts 実在。C4 = lint_skills.ts 実在。C6 = pr-merge-and-conflict.md L55-106 読取（merge 後重複検査の規定なし）。C8 = record-comments.ts L203 実在 + case-close references 全文 grep（保全確認手順の規定なし）。〔review で判明した初期実測の漏れ: C1 の issue-operation-recovery.md/REQ-052-014/015、C7 の checker-execution-contracts.md「実行形態規律（集約）」/qg-4-final-acceptance.md L354/L360、C5 の REQ-003 実測条項不在確認は初期実測に含まれず、review の反証で補完した〕
- Jev 観測（本 run 生成）: 20261016T040823Z-35a5（分類8問）、20261016T040937Z-5edc（E1 7軸）、20261016T041021Z-f5a9（E2 7軸）、20261016T041102Z-870f（E3 7軸）、20261016T041144Z-8b9b（E4/E5 14軸）、20261016T041238Z-7fd4（E6/E7 14軸）、20261016T041311Z-7ba6（E8 7軸）、20261016T041400Z-aed6（処分区分8問）、20261016T041451Z-1161（昇華可能性8問）、20261016T041820Z-ddfa（review 発動条件1問）、20261016T043301Z-56dc（review 反映後の再判定5問）。全 observation に finalResult を observation_write で追記済み
- 禁止条件フィルタリングゲート: 8単位すべて技術判断不在・command仕様・運用ルール該当で Decision 候補除外（deterministic 適用。review 反映後も再適用し不変）

## STEP-4 adversarial-review

- 発動判定: 発動（Jev boolean true、観測 20261016T041820Z-ddfa。inbox 8件で skip 条件〔空・1件のみで重複確実〕非該当、evaluation-report 反映済み。親判断の最終確定結果が発動条件を満たしたため後続評価を生成）
- review 構成: 独立 challenge stream 2本（explore サブエージェント。相互の finding を非公開で並行実行）。Stream A = C1/C2/C5/C6/C8 の反証、Stream B = C3/C4/C7 と問題クラス分類の反証。Stream B は1回目が provider 障害（network failure 後の fallback model 不在）で失敗し、新規タスクとして再起動して成立（silent skip せず失敗を記録）
- orchestrator（Reviewee）相互反証: 両 stream の決定的反証3点を orchestrator が自ら実測で再検証し、すべて実証した。（1）C1: `issue-operation-recovery.md` 全文読取 + `git log --follow`（489b2522、2026-10-09 作成、`git merge-base --is-ancestor` で基準 revision 祖先を確認）+ REQ-052.md L34-35 読取。（2）C7: checker-execution-contracts.md L280「実行形態規律（集約）」+ qg-4-final-acceptance.md L350-362 読取（L354/L360 は事象前に確定）+ case-run-pre-delegation-staleness-check.md L27。（3）C5: REQ-003.md 全文 grep（実測 0 件）+ learning-capture SKILL 読取（委譲計画条項なし）
- accepted finding 反映（STEP-2 へ戻り STEP-3 を再実行）:
  - C1: 4 project knowledge → 5 既存対策の更新（恒久対策不在の反証受理。issue-operation-recovery.md 診断手順への 2段分離試験追記候補へ性格変更。detail 引用の不正確さ〔envHint 省略〕と予防策第3項の既充足〔REQ-052-014〕を訂正）
  - C5: duplicate → deferred（恒久規律被覆の実在確認不可。レポート内部矛盾〔pool を同一クラスと数えない宣言と duplicate 根拠使用の矛盾〕を訂正）
  - C7: deferred → duplicate（実行形態規律の恒久規定発見。C2 と同型の契約再適用構造。反映先明確度 2/5→4/5、加重合計 23→25 に訂正）
  - C8: 処分維持（cleanup-and-capture.md L41 の既存内容保持条項との不整合という gap 性格の精緻化、record-comments.ts 境界改善の反映先第一候補化を反映）
  - C6: 処分維持（STEP-4-4 L89 近接規定〔内容重複確認〕との区別明記を反映）
  - C4: 処分維持（実在性確認パスの誤記 `src/common/...` → `.opencode/...` を訂正。lint_skills.ts L471-477/L524 の in-code 自己文書化を記録）
  - C2/C3/問題クラス分類: 反証材料なし、維持（分類は triple criterion で合併対なし、発生件数軸も実測と整合）
- 戻しループ: STEP-2（レポート更新）→ STEP-3（処分再実行。Jev 再判定 20261016T043301Z-56dc）→ STEP-4 発動条件判定（親条件不変: 8件・反映済み）。再 review は「新たな本質的争点が生じ得る場合」に限る: 再判定は両 stream の accepted finding（orchestrator 実測済み）の機械的反映であり、新たに未検証の争点を導入しないため停止条件を満たしてループを離脱した
- unresolved: なし（発見された本質的争点はすべて実測で解決。未解決の規範間優先関係は残存しない）

## STEP-5 自律確定記録

- 自律確定: 8単位すべて自律確定（ユーザー承認なし）。promote 3単位（E1/E6/E8）は既存恒久手順・運用文書の具体的 gap を実測（grep・ファイル読取・git log）で確認できた既存対策の更新であり、正規契約と実測からの導出で一意に確定。duplicate 2単位（E2/E7）は恒久契約・恒久 checker による完全被覆を実測で確認。deferred 3単位（E3/E4/E5）は処分区分6の判定基準（単発・断片的・出現回数少・恒久被覆未確認）への該当を実測で確認
- HITL 不要の理由（人間判断への引き上げ条件1〜5との照合）: （1）ユーザー固有の目的・価値観・優先順位の新規確定を要する事項なし。（2）正規情報源間の未解決規範矛盾なし。（3）対論型レビューの本質的争点は相互反証と実測検証ですべて解決済み。（4）要件・仕様の対象範囲、外部契約、受け入れ条件、恒久規範の新規決定なし〔promote は backlog-review/req-define 向けの提案ステージに限り、実現先の確定・恒久規範の確定は行わない〕。（5）既存の明示的な安全境界が要求する操作の承認なし〔inbox クリアは正規の deferred 移動原子的操作プロシージャであり、prune 5件は本 run 移動分の promote 時 prune で STEP-5 の判定確定と同時に承認済み（hitl-and-persistence.md STEP-6 手順4。破壊的変更の明示承認が必要な「inbox.md 全体強制クリア・大量エントリ一括削除」には該当しない〕
- 判定の変更指示: なし（前回 run とは異なり、本 run は HITL 質問を発生させず STEP-6 へ進む。前回 run の prune 21件への事前承認は大量一括削除相当への配慮であり、本 run の5件はそれに該当しないと判断した）
- 破壊的変更: なし（既存 pool 247件への追加 prune は実施しない。deferred 移動は原子的操作プロシージャ〔メモリ完結→全検証→一括原子書込〕に従う）
- STEP-6 実行記録: `git pull --ff-only` = `Already up to date.`（exit 0、HEAD 5c78cbf1 のまま）。promoted 3件を生成（UTF-8 BOM なし）。deferred 移動 + prune を node によるメモリ完結・全検証・一括原子書込で実行し読戻し一致（見出し251→254、移動日×3、prune 5件、C1 統合追記、inbox クリア）
- git 永続化: 実行せず（並列 serialization 契約により親 orchestrator が commit/push を所有。保留パス一覧と提案 commit message を完了報告へ記載）
