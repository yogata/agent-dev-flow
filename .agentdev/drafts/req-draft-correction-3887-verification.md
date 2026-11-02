# 要件doc draft: Case #3887 完了報告の訂正と未達検証の正規経路での履行

- topic: correction-3887-verification
- 作成日時（実測）: 2026-11-02T11:44:56+09:00
- source_type: external
- source_reference: 監督者による独立照合結果（2026-11-02、Case #3887 第2報の受理否と訂正経路指示）
- 入力となる一次記録: 元 RU-0255（commit 2cf279980）、定義案（commit 87621f165）、Issue #3887 コメント第1報（6567119588）・第2報（6567591949）、検証記録（C:/WINDOWS/TEMP/opencode/ru0255-verify-records/）、検証 branch verification/ts-3887（b05b37c20 / 6139cd739 / e007d5d4b）

## 合意の経過（監督者指示から確定した合意内容）

監督者の独立照合により、Case #3887 第2報（全条件 pass・クローズ）は受理できないと判定された。独立確認済みの具体的不一致 5 点を認め、閉鎖済み Case #3887 を再開せず、本訂正 Case で不足を正規経路で処理する。新しい要求や評価基準は追加せず、RU-0255 の元条件（RU1-AC1〜AC7、TS-001〜007、4 区分・検証種別区別・証拠規律）を変更・免除しない。

## 既存の実装・有効な証拠の再利用（棚卸し）

### 維持できる証拠（再利用）

- 本 Case 実装（main 630522bcd）: 実装 d108fe27a、merge e0710bcd5、post-merge 是正 266a8df2c。pin tests 0 fail、トレーサビリティ gate pass=11 fail=0、配布依存境界 gate、textlint、check_changed_docs — いずれも機械検査として有効
- 第1報の合格判定: 条件 6（TS-005 の実経路該当分: REQ-004 再読取・verbatim inclusion・引用識別子実在・AUTOGEN 差分なし・マージ後再検証）と条件 9（4 区分記録義務）は実経路・記録義務として維持
- 第2報の機械検査結果（検証 branch 上）: PyYAML 実パース、check-req-row-existence / check-entry-existence / check-frontmatter-consistency の実行結果、git diff、commit b05b37c20 / 6139cd739 / e007d5d4b — 手動実行に対する部品試験・機械証跡として維持（公開入口の証明とは区別）

### 失効する判定（第2報の誤り）

- TS-001〜TS-004 / TS-006 の「pass（実経路）」判定: 実行は正規 workflow の手順に沿った手動実行（模擬実行相当）であり、公開入口（コマンド投入）からの実行ではなかった。公開入口の証明として不適格
- TS-007 工程駆動の「pass」: 公開コマンド phase-artifacts-update への投入実行でなく手順に沿った手動書込み・個別検査。GitHub 反映も検証 branch のローカル commit のみ
- TS-007 Local 版の「pass」: 専用 driver からの部品呼び出しであり plugin 公開入口を通過していない。ローカル課題（e007d5d4b）は pr_merge を実行しておらず Git 取り込み突合（pr_merge の VERIFY）が未完了
- TS-005 の Decision 実例「強化」判定: DEC-063 CREATE は検証 branch 上の手動保存であり、本 Case（PR #3888）の実経路には含まれない。第1報の TS-005 pass（実経路該当分）は維持するが、Decision 操作種の実経路証明は未達のまま
- 第2報の「完了条件 9/9 成立」全体とそれに基づくクローズ: 根拠不足

### 誤記（訂正対象）

1. 採否記録（6139cd739 の .agentdev/phase/adoptions/2026-11-02-req118-measurement-phase-route-1.json）: basis を user-explicit、adoptionBasis を「監督者指示 m0086」と記録したが、m0086 は検証実施指示であり REQ-118-003 という仕様内容の採用判断ではない。試験内の採用入力を実環境の利用者判断として誤記
2. 第1報の cleanup 記録: 「worktree とローカル branch の両方が不存在（実態確認済み）」と記録したが、.worktrees/3887-definition が実在（worktree 登録のみ削除、ディレクトリ残存。clean、HEAD 630522bcd）。また .worktrees/suite3-baseline-stdout.log（27 バイト）・suite3-baseline-stderr.log（8300 バイト、分割③ baseline 再現ログ）が .worktrees/ 配下に残存しており「一時ファイル削除済み」記録と食い違い
3. #3887 本文の終了日時「2026-11-02T12:05:00+09:00」は実測でない（切りの良い値を記載した）

# draft-data

```yaml
topic_slug: correction-3887-verification
work_type: maintenance
scale: standard
status: approved
auto_ready: true
stop_reasons: []
important_change_notified:
  notified_before_save: false
  summary: "既存正規成果物（REQ・Decision・Design）への変更を含まないため対象外。#3887 完了報告の訂正と未達検証の履行が対象"
agreed_items:
  - id: AG-C001
    content: |
      Case #3887 第2報の判定訂正。Issue #3887（closed 維持・再開しない）へ訂正コメントを投稿し、TS-001〜004/006/007 の pass 判定を取り下げて正しい証拠区分（模擬実行・部品試験として維持できる部分と、公開入口から未証明の部分）へ格下げする。第2報の機械検査結果が部品試験として残ること、第1報の合格判定（TS-005 実経路該当分・条件 9）が維持されることを明記する。訂正後の最終判定は本訂正 Case が引き取る
  - id: AG-C002
    content: |
      TS-007 工程駆動経路の再実行。公開コマンド phase-artifacts-update への投入実行として実施する（正規 workflow の手順に沿った手動書込み・個別検査を公開入口の証明として扱わない）。検証専用入力の採用は現実の仕様採用と混同せず、採用根拠の記録は試験内入力として区別する。GitHub への反映は対象 repo の正規保存経路で証明する
  - id: AG-C003
    content: |
      TS-007 Local 版経路の再実行。対象 plugin の公開入口（install -LocalMode による junction 差替え後の agentdev_gh tool 呼び出し）を通した実行として実施する（部品 driver からの直接呼び出しを公開経路の証明として扱わない）。ローカル課題の論理 PR 操作は pr_merge（関連コミットのローカル Git 実在確認を含む VERIFY）まで実行し、ローカル記録と実 Git 取り込み結果の突合を完了させる
  - id: AG-C004
    content: |
      GitHub 版の検証は本当に隔離された検証先で実施する。実装対象版（src/common の正本）・配置版（投影・インストール先）・稼働コード（検証先で実際に動く実体）を区別し、公開入口・委譲・実際の保存・再取得を証明する。隔離検証リポジトリは REQ-116 の管理者事前準備方針に従い、実行前に実在確認を行い、不在の場合は管理者への用意依頼を再開条件として停止報告する（検証不能を別手段で代替しない）
  - id: AG-C005
    content: |
      TS-001〜004/006 の再評価。第2報の手動実行を模擬実行として区分した上で、公開入口（req-define コマンド投入）からの実行で証明する必要がある命題を特定して実行する。模擬実行の機械検査結果（PyYAML 実パース、check-* 系、diff、commit）は部品試験として維持し、同一命題の再実行時に再利用できるものは再利用する。通知が保存前に実際に届いたことの証明も模擬実行の範囲では成立しないため、実経路での通知契約の履行として再証明する
  - id: AG-C006
    content: |
      採否記録の誤記訂正。検証 branch verification/ts-3887 上の adoptions 記録について、basis と adoptionBasis の誤帰属（監督者の検証実施指示を仕様内容の user-explicit 採用とした誤記）を訂正する。当該記録は main 未反映のため正規成果物は無汚染であり、branch 上の訂正 commit で対応する
  - id: AG-C007
    content: |
      cleanup 記録の訂正と残存の処理。.worktrees/3887-definition（worktree 登録削除済み・ディレクトリ残存・clean・HEAD 630522bcd）と .worktrees/suite3-baseline-stdout.log / suite3-baseline-stderr.log（分割③ baseline 再現ログ）の Case #3887 case-close 工程への帰属を確認し、第1報の該当記述を #3887 訂正コメントで訂正する。baseline ログは分割③ pre-existing 判定の証拠であるため PR #3888 本文の記録と突合した上で退避し、残存ディレクトリ・ログを実際に cleanup する
  - id: AG-C008
    content: |
      判定の時刻は実測を使う。本訂正 Case の検証記録・Issue 記録の時刻はすべてコマンド実行の実測時刻（date コマンド等の出力）を使用し、切りの良い値の自己申告を記載しない
  - id: AG-C009
    content: |
      RU-0255 の元条件を変更・免除しない。RU1-AC1〜AC7、TS-001〜007、4 区分（pass / fail / blocked / not applicable）、検証種別（構造検査・部品試験・模擬実行・実経路）の区別、証拠不足と実装不備の区別、検証不能の代替禁止を維持する。RU-0254、RU-0256〜0260 は本 Case に混ぜない
rejected_items: []
unresolved_questions:
  - id: UQ-C001
    question: "隔離検証リポジトリの実在と利用可否（REQ-116 の管理者事前準備対象）"
    status: open
    note: "前回確認時点（2026-11-02 10時台）では yogata 配下に検証用 repo なし（adf-ts007-github-verify は削除済み）。本 Case の case-run 実行時に再確認し、不在なら管理者への用意依頼を再開条件として停止報告する（AG-C004 のとおり代替しない）"
artifact_actions: []
operation_units:
  - id: OU-C001
    description: |
      #3887 第2報の判定訂正コメント投稿（AG-C001）と cleanup 記録の訂正（AG-C007 の記録部分）。#3887 は closed 維持・再開しない。docs 正規成果物（REQ・Decision・Design）の変更なし
    verification_refs: [TS-C001]
  - id: OU-C002
    description: |
      未達検証の実行: TS-007 工程駆動（公開コマンド投入、AG-C002）、TS-007 Local 版（plugin 公開入口・pr_merge 突合込み、AG-C003）、GitHub 版隔離検証先での実行（AG-C004）、TS-001〜004/006 の公開入口からの再実行（AG-C005）。実行前提の環境・権限確認を含む
    verification_refs: [TS-C002, TS-C003, TS-C004, TS-C005]
  - id: OU-C003
    description: |
      誤記訂正と cleanup の実行: 採否記録の訂正 commit（AG-C006、branch verification/ts-3887 上）、残存ディレクトリ・ログの退避と cleanup（AG-C007 の実行部分）
    verification_refs: [TS-C006]
test_strategy:
  - id: TS-C001
    concern: "#3887 訂正コメントが第2報の誤りを過不足なく訂正していること"
    verification: |
      訂正コメントの内容を第2報の記載と照合する。取り下げる判定（TS-001〜004/006/007 の pass、9/9 成立、クローズ根拠）、維持する証拠（第1報の合格判定、第2報の機械検査結果の部品試験としての位置づけ）、誤記 3 件（採否記録・cleanup 記録・終了日時）の各区別が明示されていることを確認する
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
      fix-and-reverify。検証環境・権限が確保できない場合は blocked として停止報告する（別経路で代替しない）
  - id: TS-C003
    concern: "TS-007 Local 版経路が plugin 公開入口の実行として証明されていること"
    verification: |
      install -LocalMode 適用環境での agentdev_gh tool 呼び出しの実行記録、ローカル課題の起票から pr_merge（関連コミットのローカル Git 実在確認を含む VERIFY）までの操作、ローカル記録と実 Git 取り込み結果の突合を確認する
    pass_criteria: |
      公開入口（tool 呼び出し）を通過していること（部品 driver の直接呼び出しでは不成立）。Git 取り込み突合が pr_merge の VERIFY まで完了していること
    on_failure: |
      fix-and-reverify。LocalMode 適用の実行環境が確保できない場合は blocked として停止報告する
  - id: TS-C004
    concern: "GitHub 版が本当に隔離された検証先で証明されていること"
    verification: |
      隔離検証リポジトリの実在確認、実装対象版・配置版・稼働コードの区別、公開入口・委譲・実際の保存・再取得の各証拠を確認する
    pass_criteria: |
      隔離検証先が本 repo（yogata/agent-dev-flow）と分離されており、検証専用の入力と現実の仕様採用が混同されていないこと。RU-0255 の元合格条件を変更しない
    on_failure: |
      blocked として停止報告する（REQ-116 の管理者事前準備を再開条件とする。検証不能を別手段で代替しない）
  - id: TS-C005
    concern: "TS-001〜004/006 が公開入口からの実行で証明され、模擬実行の証拠が正しく区分されていること"
    verification: |
      req-define 公開コマンド投入の実行記録、4 状態・8 事例・判断根拠の連鎖・採用混在・中断再投入の各命題の実行、通知が実経路で保存前に届いたことの証明を確認する。模擬実行として維持する部分と実経路で再証明する部分の区別を確認する
    pass_criteria: |
      公開入口からの実行であることが全命題で確認できること。第2報の機械検査結果が部品試験として正しく再分類されていること。元の合格条件（RU1-AC1〜AC4、AC6）を変更しない
    on_failure: |
      fix-and-reverify。証拠不足と実装不備を区別し、環境・権限不足は blocked として停止報告する
  - id: TS-C006
    concern: "誤記訂正と cleanup が実行され、証拠が損なわれていないこと"
    verification: |
      採否記録の訂正 commit（branch verification/ts-3887 上）の内容、baseline ログの退避先と PR #3888 本文記録との突合、.worktrees/3887-definition と baseline ログの実削除、#3887 訂正コメントの該当記述を確認する
    pass_criteria: |
      誤記 3 件がすべて訂正され、baseline ログの証拠（分割③ pre-existing 判定の根拠）が退避先で保全されていること。残存がないこと
    on_failure: |
      fix-and-reverify
review_dispositions: []
```

## 参照（一次記録の所在）

- 元 RU-0255: commit 2cf279980 の .agentdev/backlog/req-units/RU-0255.md（main では削除済み、git 履歴から取得可能）
- 定義案: commit 87621f165（.agentdev/drafts/req-draft-canonical-artifact-management.md、branch 履歴から取得可能）
- 第1報: https://github.com/yogata/agent-dev-flow/issues/3887#issuecomment-6567119588
- 第2報: https://github.com/yogata/agent-dev-flow/issues/3887#issuecomment-6567591949
- 検証記録退避先: C:/WINDOWS/TEMP/opencode/ru0255-verify-records/（ts-001.md、ts-002.md、ts-003-006.md、ts-007.md、local-driver.ts）
- 検証 branch: verification/ts-3887（b05b37c20、6139cd739、e007d5d4b）
- baseline ログ: .worktrees/suite3-baseline-stdout.log（27 バイト）、.worktrees/suite3-baseline-stderr.log（8300 バイト、分割③ baseline @3888-baseline での 11 fail 再現ログ）

## 対象外

- RU-0254、RU-0256〜0260（後続の個別 req-define 実行で処理）
- 第1段階全体の検証資料（AC1〜AC8・事例 A〜H）の取得と評価（資料未取得のため未評価を維持）
- 本実装（main 630522bcd、d108fe27a 等）の再実装・変更（実装は有効であり、証明の不足のみ補う）
- 新しい要求・評価基準の追加（RU-0255 の元条件を維持）
