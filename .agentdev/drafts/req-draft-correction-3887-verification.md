# 要件doc draft: Case #3887 完了報告の訂正と未達検証の正規経路での履行

- topic: correction-3887-verification
- 作成日時（実測）: 2026-11-02T11:44:56+09:00（初版）/ 2026-11-02T11:53:42+09:00（監督者照合の7検討事項を反映した修正の commit 実測時刻）
- source_type: external
- source_reference: 元の利用者指示（Case #3887 継続と全検証・修正再検証の依頼）および監督者による独立照合所見（2026-11-02、第2報の受理否・訂正経路指示・修正7検討事項）
- 入力となる一次記録: 元 RU-0255（commit 2cf279980）、定義案（commit 87621f165）、Issue #3887 コメント第1報（6567119588）・第2報（6567591949）、検証記録（C:/WINDOWS/TEMP/opencode/ru0255-verify-records/）、検証 branch verification/ts-3887（b05b37c20 / 6139cd739 / e007d5d4b）

## 入力の区別

- 利用者による元指示: Case #3887 の未完了条件について既存の実行と証拠を保持して継続し、実行可能な未検証項目を実行する。不一致は承認範囲内で正規工程により修正・再検証する。元条件を弱めず、必要な検証が全部成立するまで Issue を完了としない
- 監督者による照合所見（技術的判断の提供）: 第2報の全条件 pass・クローズは受理できない。独立確認済みの具体的不一致 5 点（公開入口でない工程駆動・部品呼出しの Local 版・採否記録の誤帰属・手動実行の実経路同一扱い・根拠不足のクローズ）、cleanup 記録の食い違い、および修正7検討事項
- 本 draft の合意内容は上記の入力から、新しい要求や評価基準を追加せず、RU-0255 の元条件（RU1-AC1〜AC7、TS-001〜007、4 区分・検証種別区別・証拠規律）を変更・免除せずに整理したものである

## 既存の実行と証拠の棚卸し（再利用と失効の区別）

### 再利用できる証拠

- main 630522bcd 上の機械検査（pin tests 0 fail、トレーサビリティ gate pass=11 fail=0、配布依存境界 gate、textlint、check_changed_docs、分割③の pre-existing 機械受理）: 実装 commit d108fe27a に対する部品試験・構造検査として有効
- 第1報の合格判定: 条件 6 のうち REQ・Design 保存系の実経路該当分（REQ-004 再読取・verbatim inclusion・引用識別子実在・AUTOGEN 差分なし・マージ後再検証）と条件 9（4 区分記録義務）。ただし条件 6 は RU1-AC5 の一部（Decision 作成・更新を含まない）であり、AC5 全体の pass とはしない
- 検証 branch 上の機械検査結果（PyYAML 実パース、check-req-row-existence / check-entry-existence / check-frontmatter-consistency、git diff、commit b05b37c20 / 6139cd739 / e007d5d4b）: 手動実行に対する部品試験・機械証跡として維持

### 失効する判定（第2報の誤り）

- TS-001〜TS-004 / TS-006 の「pass（実経路）」判定: 実行は正規 workflow の手順に沿った手動実行であり、公開入口・正規経路の指定がある命題の証明として不適格
- TS-007 工程駆動の「pass」: 公開コマンド phase-artifacts-update への投入実行でなく手順に沿った手動書込み・個別検査。GitHub 反映も検証 branch のローカル commit のみ
- TS-007 Local 版の「pass」: 部品 driver からの直接呼び出しであり plugin 公開入口を通過していない。ローカル課題（e007d5d4b）は pr_merge 未実行で Git 取り込み突合が未完了
- TS-005 の「Decision 実例で強化」判定: DEC-063 CREATE は検証 branch 上の手動保存であり、RU1-AC5 の Decision 作成・更新の正規保存経路（Definition 保存内部責務）での実行ではない。AC5 の Decision 部分は未達のまま
- 第2報の「完了条件 9/9 成立」全体とそれに基づくクローズ: 根拠不足

### 誤記（訂正対象）

1. 採否記録（6139cd739 の .agentdev/phase/adoptions/2026-11-02-req118-measurement-phase-route-1.json）: basis を user-explicit、adoptionBasis を監督者の検証実施指示と記録したが、当該指示は仕様内容（REQ-118-003）の採用判断ではない。試験内の採用入力を実環境の利用者判断として誤記
2. 第1報の cleanup 記録: 「worktree とローカル branch の両方が不存在（実態確認済み）」と記録したが、.worktrees/3887-definition が実在（worktree 登録のみ削除、ディレクトリ残存、clean、HEAD 630522bcd）。.worktrees/suite3-baseline-stdout.log（27 バイト）・suite3-baseline-stderr.log（8300 バイト、分割③ baseline 再現ログ）も残存しており記録と食い違い。いずれも Case #3887 case-close 工程由来
3. #3887 本文の終了日時「2026-11-02T12:05:00+09:00」は実測でない

# draft-data

```yaml
topic_slug: correction-3887-verification

work_type: maintenance

scale: standard

summary: |
  Case #3887（RU-0255）の第2報（全条件 pass・クローズ）が監督者照合で受理否となったため、
  閉鎖済み Case #3887 を再開せず、誤った完了報告の訂正と未達検証の正規経路での履行を本訂正 Case で
  実行する。新しい要求や評価基準は追加せず、RU-0255 の元条件（RU1-AC1〜AC7、TS-001〜007、
  4 区分・検証種別区別・証拠規律）を変更・免除しない。
  主な内容: (1) #3887 への訂正コメント（pass 判定の取り下げと正しい証拠区分への格下げ、
  誤記の訂正。#3887 は closed 維持）、(2) 元 TS の原文が実経路（公開入口・正規経路）を要求する命題の
  正規経路での実行（TS-001 公開入口照合、TS-004 Definition 保存内部責務経路の保存、TS-005 正規保存経路
  〔Decision 作成・更新を含む〕、TS-007 工程駆動・Local 版・隔離検証先での GitHub 版）、(3) 元 TS が
  部品試験・模擬実行を許容する命題（TS-002 照合判断の記録、TS-006 中断再現と正規状態との突合）は
  既存証拠の正しい区分の下で評価、(4) 誤記 3 件の訂正（採否記録・cleanup 記録・終了日時）。
  実経路の検証で不具合が判明した場合は正規工程で対象範囲内の修正・再検証を行う（対象外は追加要求・
  対象範囲の拡大に限る）。docs 正規成果物（REQ・Decision・Design）への追加変更を事前に含めない
  （判明した不具合とその修正のみが対象）。

auto_gate:
  auto_ready: true
  unresolved_questions:
    - id: UQ-C001
      question: "隔離検証リポジトリ（REQ-116 の管理者事前準備対象）の準備の要否と利用可否"
      status: open
      note: "前回確認時点（2026-11-02 10時台）では yogata 配下に検証用 repo なし。実行時に準備の要否を調査する（監督者側で検証用 private repo の準備を検討できることを含む）。独立して実行可能な記録訂正・Local 版検証・その他の実経路検証をこれに先立って実行し、待たせない。実際に権限や保護された操作が拒否された場合のみ根拠を示して停止する"
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-C001
    content: |
      Case #3887 第2報の判定訂正。Issue #3887（closed 維持・再開しない）へ訂正コメントを投稿し、TS-001〜004/006/007 の pass 判定を取り下げて正しい証拠区分（部品試験・模擬実行として維持できる部分と、公開入口・正規経路から未証明の部分）へ格下げる。第1報の合格判定（条件 6 の REQ・Design 保存系実経路該当分・条件 9）が維持されること、その部分証拠を RU1-AC5 全体の pass としないことを明記する。訂正後の最終判定は本訂正 Case が引き取る。時刻は実測を使用し、#3887 本文の終了日時の非実測値も訂正する
  - id: AG-C002
    content: |
      TS-007 工程駆動経路の再実行。公開コマンド phase-artifacts-update への投入実行として実施する（正規 workflow の手順に沿った手動書込み・個別検査を公開入口の証明として扱わない）。検証専用入力の採用は現実の仕様採用と混同せず、採用根拠の記録は試験内入力として区別する。GitHub への反映は対象 repo の正規保存経路で証明する
  - id: AG-C003
    content: |
      TS-007 Local 版経路の再実行。対象 plugin の公開入口（install -LocalMode による junction 差替え後の agentdev_gh tool 呼び出し）を通した実行として実施する（部品 driver からの直接呼び出しを公開経路の証明として扱わない）。ローカル課題の論理 PR 操作は pr_merge（関連コミットのローカル Git 実在確認を含む VERIFY）まで実行し、ローカル記録と実 Git 取り込み結果の突合を完了させる
  - id: AG-C004
    content: |
      GitHub 版の検証は本当に隔離された検証先で実施する。実装対象版（src/common の正本）・配置版（投影・インストール先）・稼働コード（検証先で実際に動く実体）を区別し、公開入口・委譲・実際の保存・再取得を証明する。REQ-116 の管理者事前準備方針と gh-write guard を順守する。隔離検証リポジトリの準備の要否を実行時に調査する（不在それ自体を直ちの停止理由としない。実際に権限や保護された操作が拒否された場合のみ根拠を示して停止する）
  - id: AG-C005
    content: |
      元 TS の原文に照らした命題区分の下での未達検証の実行。原文が実経路を要求する命題は正規経路で実行する: TS-001（公開入口 req-define からの既存REQ照合）、TS-004（Definition 保存内部責務〔case-ready / case-revise 経路〕での保存）、TS-005（正規保存経路での実行。RU1-AC5 の Decision 作成・更新を含む。第1報の REQ・Design 保存系の部分証拠を AC5 全体の pass としない）。原文が部品試験・模擬実行を許容する命題は既存証拠を正しい区分で評価する: TS-002（8 事例の照合・操作分類の実行と記録）、TS-006（中断・再投入の再現と実際の正規状態との突合）。TS-003（req-define 実行による初期判断〜反映先の突合）は req-define workflow の実行として正規経路で行う。全事例で公開入口を通す新たな一律義務は追加しない。通知が保存前に実際に届いたことの証明も実経路の命題とし、模擬実行の範囲では成立扱いとしない
  - id: AG-C006
    content: |
      採否記録の誤記の撤回。検証 branch verification/ts-3887 上の adoptions 記録について、basis・adoptionBasis の誤帰属（監督者の検証実施指示を仕様内容の user-explicit 採用とした誤記）を、branch の履歴を破壊しない形（追記による撤回・訂正記録）で訂正する。誤った採用根拠の撤回と証拠保全を優先する。当該記録は main 未反映であり正規成果物は無汚染である
  - id: AG-C007
    content: |
      cleanup 記録の訂正。.worktrees/3887-definition（worktree 登録削除済み・ディレクトリ残存・clean・HEAD 630522bcd）と .worktrees/suite3-baseline-stdout.log / suite3-baseline-stderr.log の Case #3887 case-close 工程への帰属を確認し、第1報の該当記述を #3887 訂正コメントで訂正する。baseline ログは分割③ pre-existing 判定の証拠であるため削除せず保全する。残存ディレクトリ・ログの cleanup は検証に不要であるため新たな必須完了条件とせず、証拠を損なわない範囲での扱いは実行時に判断する
  - id: AG-C008
    content: |
      判定の時刻は実測を使う。本訂正 Case の検証記録・Issue 記録の時刻はすべてコマンド実行の実測時刻を使用し、切りの良い値の自己申告を記載しない
  - id: AG-C009
    content: |
      RU-0255 の元条件を変更・免除しない。RU1-AC1〜AC7、TS-001〜007、4 区分（pass / fail / blocked / not applicable）、検証種別（構造検査・部品試験・模擬実行・実経路）の区別、証拠不足と実装不備の区別、検証不能の代替禁止を維持する。実経路の検証で不具合が判明した場合は、元の利用者指示（承認範囲内の不適合の修正・再検証）に従い正規工程で対象範囲内の修正を含む。対象外は追加要求・対象範囲の拡大に限る。RU-0254、RU-0256〜0260 は本 Case に混ぜない
rejected_items: []
conflict_resolutions: []
artifact_actions: []
operation_units:
  - id: OU-C001
    description: |
      #3887 第2報の判定訂正コメント投稿（AG-C001）と cleanup 記録の訂正（AG-C007 の記録部分）。#3887 は closed 維持・再開しない
    verification_refs: [TS-C001]
  - id: OU-C002
    description: |
      未達検証の実行（AG-C002〜C005）: TS-007 工程駆動（公開コマンド投入）、TS-007 Local 版（plugin 公開入口・pr_merge 突合込み）、GitHub 版隔離検証先での実行（準備要否の調査を含む）、元 TS の命題区分に基づく TS-001/003/004/005（Decision 作成・更新を含む）の正規経路での実行と TS-002/006 の既存証拠の正しい区分での評価
    verification_refs: [TS-C002, TS-C003, TS-C004, TS-C005]
  - id: OU-C003
    description: |
      誤記の撤回（AG-C006）: 採否記録の誤帰属を branch 履歴を破壊しない形で訂正
    verification_refs: [TS-C006]
test_strategy:
  - id: TS-C001
    concern: "#3887 訂正コメントが第2報の誤りを過不足なく訂正していること"
    verification: |
      訂正コメントの内容を第2報の記載と照合する。取り下げる判定（TS-001〜004/006/007 の pass、9/9 成立、クローズ根拠、TS-005 の Decision 強化判定）、維持する証拠（第1報の合格判定〔条件 6 の部分証拠と AC5 全体でない旨を含む〕、第2報の機械検査結果の部品試験としての位置づけ）、誤記 3 件の各区別が明示されていることを確認する
    pass_criteria: |
      誤判定の取り下げと正しい証拠区分への格下げが全件明示され、維持証拠の範囲が第1報・第2報の一次記録と一致すること。#3887 が closed のまま再開されていないこと。時刻記録が実測であること
    on_failure: |
      fix-and-reverify。訂正コメントを修正して再投稿する
  - id: TS-C002
    concern: "TS-007 工程駆動経路が公開コマンド投入の実行として証明されていること"
    verification: |
      公開コマンド phase-artifacts-update への投入実行の記録（投入・実行・結果の一連）と、対象 repo での実際の保存・再取得の証拠を確認する。採用根拠の記録が試験内入力と実利用者判断を区別していることを確認する
    pass_criteria: |
      公開入口からの実行であること（手動書込み・個別検査の単独では不成立）。所有先判断が共有基準に従属し、実際の保存・再取得が確認できること。RU-0255 の元合格条件（TS-007 の該当部分）を変更しない
    on_failure: |
      fix-and-reverify。実際に権限や保護された操作が拒否された場合のみ根拠を示して停止する（不在それ自体を停止理由にしない）
  - id: TS-C003
    concern: "TS-007 Local 版経路が plugin 公開入口の実行として証明されていること"
    verification: |
      install -LocalMode 適用環境での agentdev_gh tool 呼び出しの実行記録、ローカル課題の起票から pr_merge（関連コミットのローカル Git 実在確認を含む VERIFY）までの操作、ローカル記録と実 Git 取り込み結果の突合を確認する
    pass_criteria: |
      公開入口（tool 呼び出し）を通過していること（部品 driver の直接呼び出しでは不成立）。Git 取り込み突合が pr_merge の VERIFY まで完了していること
    on_failure: |
      fix-and-reverify。実際に権限や保護された操作が拒否された場合のみ根拠を示して停止する
  - id: TS-C004
    concern: "GitHub 版が本当に隔離された検証先で証明されていること"
    verification: |
      隔離検証リポジトリの準備要否の調査結果、実装対象版・配置版・稼働コードの区別、公開入口・委譲・実際の保存・再取得の各証拠を確認する。REQ-116 の管理者事前準備方針と guard の順守を確認する
    pass_criteria: |
      隔離検証先が本 repo（yogata/agent-dev-flow）と分離されており、検証専用の入力と現実の仕様採用が混同されていないこと。RU-0255 の元合格条件を変更しない
    on_failure: |
      fix-and-reverify。実際に権限や保護された操作が拒否された場合のみ根拠を示して停止する
  - id: TS-C005
    concern: "元 TS の命題区分に基づき、実経路必須命題が正規経路で証明され、部品・模擬許容命題が既存証拠で正しく評価されていること"
    verification: |
      元 TS-001〜006 の verification/pass_criteria 原文と照合し、(a) 実経路必須命題（TS-001 公開入口照合、TS-004 Definition 保存内部責務経路の保存、TS-005 正規保存経路〔Decision 作成・更新を含む〕、TS-003 req-define 実行、通知の実経路での届出）が正規経路の実行記録で証明されていること、(b) 部品・模擬許容命題（TS-002、TS-006）が既存証拠を正しい検証種別区分で評価されていることを確認する
    pass_criteria: |
      各命題の区分が元 TS 原文に基づいていること（全事例公開入口という一律義務を追加していないこと）。実経路必須命題の証明が公開入口・正規経路の実行記録であること。RU1-AC5 の Decision 作成・更新が正規保存経路で実行・再取得照合されていること（第1報の部分証拠を AC5 全体の pass としないこと）。元の合格条件を変更しない
    on_failure: |
      fix-and-reverify。証拠不足と実装不備を区別する。実経路の検証で不具合が判明した場合は承認範囲内の修正・再検証を正規工程で行う。実際に権限や保護された操作が拒否された場合のみ根拠を示して停止する
  - id: TS-C006
    concern: "採否記録の誤帰属が履歴を破壊せずに撤回されていること"
    verification: |
      検証 branch verification/ts-3887 上の訂正記録（追記による撤回）の内容を、誤記原文（6139cd739 の adoptions 記録）と照合して確認する。branch の既存 commit 履歴が改変・破壊されていないことを確認する
    pass_criteria: |
      誤った採用根拠（user-explicit と監督者指示の誤帰属）が撤回され、試験内入力であることが明示されていること。既存の commit 履歴が保持されていること（rebase や改変をしていないこと）
    on_failure: |
      fix-and-reverify
review_dispositions: []
case_open_hints:
  epic_needed: false
  wave_hints: []
```

## 参照（一次記録の所在）

- 元 RU-0255: commit 2cf279980 の .agentdev/backlog/req-units/RU-0255.md（main では削除済み、git 履歴から取得可能）
- 定義案: commit 87621f165（.agentdev/drafts/req-draft-canonical-artifact-management.md、branch 履歴から取得可能）
- 第1報: https://github.com/yogata/agent-dev-flow/issues/3887#issuecomment-6567119588
- 第2報: https://github.com/yogata/agent-dev-flow/issues/3887#issuecomment-6567591949
- 検証記録退避先: C:/WINDOWS/TEMP/opencode/ru0255-verify-records/（ts-001.md、ts-002.md、ts-003-006.md、ts-007.md、local-driver.ts）
- 検証 branch: verification/ts-3887（b05b37c20、6139cd739、e007d5d4b）
- baseline ログ（証拠保全対象・削除しない）: .worktrees/suite3-baseline-stdout.log（27 バイト）、.worktrees/suite3-baseline-stderr.log（8300 バイト、分割③ baseline @3888-baseline での 11 fail 再現ログ）

## 対象外

- 追加要求・評価基準の追加、対象範囲の拡大（RU-0255 の元条件の維持のみ。実経路検証で判明した不具合の承認範囲内修正は対象内）
- RU-0254、RU-0256〜0260（後続の個別 req-define 実行で処理）
- 第1段階全体の検証資料（AC1〜AC8・事例 A〜H）の取得と評価（資料未取得のため未評価を維持）
- baseline ログ・検証 branch 履歴の削除・改変（証拠保全を優先）
