# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## agentdev_gh Custom Tool 経由の gh が exit 66 で失敗し bash 直叩きは成功する

- **問題事象**: Custom Tool agentdev_gh の副作用・読取操作（issue_list 2 回、issue_create 4 回）が「gh exited with code 66; stderr is empty」で失敗。同一セッションの bash 直叩き gh（issue list、pr list、gh api search/issues、gh repo view）および bun -e による spawnSync("gh") 直接実行・CliRunner 直接実行はすべて成功
- **発生局面**: 運用（case-open STEP-2 Root Case 起票、backlog-auto 一気通貫 run 20261015T180807JST stage5）
- **検知方法**: agentdev_gh issue_create / issue_list の operation-failed 応答（retryable、gh exited with code 66、stdout・stderr 空）
- **根本原因**: 未特定。opencode plugin ホスト（長時間稼働 bun プロセス）から spawn された gh のみが stdout・stderr 空で非ゼロ終了。gh 認証（keyring・yogata）、AGENTDEV_GH_REPO 設定、gh バイナリ（2.102.0 単一、C:\Program Files\GitHub CLI）は正常確認済み。plugin ホストプロセス固有の環境差（opencode サーバー起動時の env・ランタイム差）が疑われるがセッション外部から観測不能
- **自律対応内容**: 時間間隔を置き計 7 回再試行（同一結果）。gh auth status・gh repo view・AGENTDEV_GH_REPO の確認。bun での CliRunner 直接実行により runner 契約と bash 環境の正常性を分離確認。読み取り系は契約どおり gh CLI 切替（1 回再試行後切替）で継続し冪等検出（既存 Root Case 0 件・既存設計PR 0 件）を完了。書込み系は契約上 gh CLI 代替不可のため fail-closed 停止し blocked 報告
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（retired REQ-093「agentdev_gh 起動環境障害の予防・診断・回復の恒久化」に関連する実観測。恒久化の再評価対象候補）
- **横展開観点**: Custom Tool 副作用操作が「非ゼロ終了・stdout/stderr 空」で失敗した場合、bash 直叩き gh 実行と bun による CliRunner 直接実行の 2 段分離試験で「runner 契約と実行環境の正常性」と「plugin ホスト環境差」を切り分けられる
- **再発条件**: opencode plugin ホストプロセスの環境から gh を spawn した場合（再現条件未特定。opencode サーバー再起動で回復する可能性あり）
- **予防策候補**: runner-cli.ts の failFromExec detail に「bash 直叩き分離試験」の diagnostic 提案を含める。opencode サーバー再起動を Custom Tool 障害の再開 contingency として手順化する。stderr 空失敗時に spawnSync の環境差診断出力（機密値除去）を detail へ含める
- **想定反映先**: src/common/tools/agentdev-gh/runner-cli.ts（failFromExec の診断 detail 拡張）、docs/knowledge/（Custom Tool 環境障害の分離試験手順の知識化）、agentdev-issue-management references issue-operation-safety.md
- **関連**: src/common/tools/agentdev-gh/runner-cli.ts（failFromExec、GhExec 注入点）、retired REQ-093
- **タグ**: `#gh` `#custom-tool` `#windows` `#blocked` `#環境差`

## 配布 closure の src 側本文への concrete REQ ID 直書きは配布依存境界 checker の検知対象である

- **問題事象**: PR #3753（case-run）で references 本文へ REQ ID を直書きした初回 checker 実行（--profile source）で concrete-id 1 件を検知。配布物から concrete ID を除去し、対応関係は repository top-level traceability/ 配下 sidecar を正本として登録する運用を再確認した
- **発生局面**: case-run（Epic #3731 / 子 Issue #3733 / REQ-061-051、Case #3729）
- **検知方法**: check_distribution_boundary.ts --profile source の concrete_id_hits
- **根本原因**: REQ 行との対応関係の正本は traceability sidecar であり、配布物本文への ID 直書きは配布依存境界違反になるという契約の再適用場面
- **自律対応内容**: 配布物本文から concrete ID を除去して再実行（failures 0 件）。sidecar 正本登録で対応関係を担保
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 配布物（src/common 配下 references・script 本文）を編集するすべての実行で、REQ ID の所在は sidecar へ寄せ、本文直書きを避ける
- **再発条件**: references 等の配布物本文へ REQ ID を追記した場合
- **予防策候補**: 参照是正系変更時の checker 実行を前置（既存運用どおり）
- **想定反映先**: 特になし（既存契約の実践記録）
- **関連**: traceability/agentdev-workflow-case-ready.yaml、REQ-061-051、Case #3729、PR #3753
- **タグ**: `#配布依存境界` `#traceability`

## 一時 Git リポジトリ（テスト fixture）には親リポジトリの .gitattributes が継承されない

- **問題事象**: bun test の一時 Git fixture で LF→CRLF warning が 633 件発生。親リポジトリの .gitattributes（* text=auto eol=lf）は init した一時リポジトリへ継承されないため、core.autocrlf=true の環境で差分警告が出る
- **発生局面**: case-run（Epic #3732 / 子 Issue #3741 / AG-006、Case #3729、PR #3750）
- **検知方法**: bun test 分割実行の stderr（LF will be replaced by CRLF 警告 500 + 133 件）
- **根本原因**: git init で生成される一時リポジトリは属性ファイルを親から引き継がない
- **自律対応内容**: 12 fixture に初回 add/commit 前へ .gitattributes（* text=auto eol=lf）15 行を配置。core.autocrlf・core.safecrlf 等の利用者設定変更や stderr 抑制は行わない。autocrlf=true 分離設定プローブで baseline 16 件 → 本 tree 0 件の因果を実証
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 一時 Git fixture を使うテストでは、属性依存の検証がある場合に fixture 側へ属性を配置する。環境設定の抑制で警告を消さない
- **再発条件**: autocrlf=true 等の環境差がある Windows 環境で一時 Git fixture テストを実行した場合
- **予防策候補**: fixture 雛形テンプレートへの .gitattributes 同梱
- **想定反映先**: fixture 追加時の留意（trusted-distribution-gate launcher-fixture.ts 等の既存パターン踏襲）
- **関連**: PR #3750（merge commit 8c3e1d56）、Case #3729
- **タグ**: `#git` `#fixture` `#windows` `#改行コード`

## lint_skills 環境差判定の検出条件は distributed layout に限定される

- **問題事象**: なし（実装側の設計知識の記録）。lint_skills の git 管理外ローカルユーザースキル検出（実行環境差ラベル付与）は、projection 走査かつ src/common/skills 存在の distributed layout でのみ発動する。src を持たない pure-fixture 環境では環境差判定が発動しない
- **発生局面**: case-run（Epic #3732 / 子 Issue #3743 / REQ-010-082、Case #3729、PR #3749）
- **検知方法**: 実装時の判定条件確認（listGitUnmanagedLocalSkills）
- **根本原因**: 構造制約（テスト fixture の構造）による設計上の限定
- **自律対応内容**: 実運用影響なしとして記録のみ
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 将来 projection 構成が変わる場合（例: repo- 接頭辞規約の変更）は .gitignore の .opencode/skills/* 除外 + repo-*/ 例外的追跡との対応で判定規約の追随更新が必要
- **再発条件**: projection 構成変更時に判定規約を更新しなかった場合
- **予防策候補**: projection 構成変更時の checker 判定規約の追随確認
- **想定反映先**: .opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts の判定規約変更時
- **関連**: PR #3749（merge commit b6656c80）、REQ-010-082、Case #3729
- **タグ**: `#integrity` `#lint_skills` `#環境差`

## 一括是正スイープ Issue が「対象実測 0 件」で完了する形態がある（委譲時の前提扱い禁止）

- **問題事象**: frontmatter updated 鮮度債務の一括是正スイープ（IR-072 11件・strict 10件・heuristic 1件の起票時実測）が、実行時点では先行 commit（85680dab・647451be）により既に 0 件へ収束しており、是正対象 0 件で完了した
- **発生局面**: case-run（Epic #3732 / 子 Issue #3740 / AG-004、Case #3729、PR #3748）
- **検知方法**: 実施時 check_integrity 実測（req-updated-freshness strict 0 mismatch・IR-072 0 件）
- **根本原因**: AG-005「検出時都度進行」運用が複数 Case で自然に機能し、起票から実行までの間に債務が解消された
- **自律対応内容**: 是正不要の実測結論を記録し、REQ-010-081 の implementation 宣言追記（missing-implementation 解消）のみを実施
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 同型 Issue（frontmatter スイープ等の一括是正）の委譲では、「是正不要収束の可能性」を実施時実測前に前提として扱わない。実測→対象確定→是正の順序を維持する
- **再発条件**: 起票時実測に依存した対象一覧を委譲し、実行時点の実測を省略した場合
- **予防策候補**: 実施時実測の必須化を委譲プロンプトへ明記（既存の AG 条項どおり）
- **想定反映先**: learning-capture の委譲計画条項
- **関連**: PR #3748（merge commit 9df78904）、REQ-010-081、Case #3729
- **タグ**: `#鮮度` `#運用`

## 同一ファイルの軽微な行重複は GitHub squash merge が CONFLICTING にならず auto-resolve し得る

- **問題事象**: なし（正常系の観測記録）。同一スクリプト接触 PR（#3747 型エラー修正 → #3751 入力検証追加、3 行重複見込み）を直列化してマージした結果、2 つ目の PR は mergeStateStatus CLEAN のままマージ成功し、重複行混入は発生しなかった
- **発生局面**: case-close（Epic #3731 Wave クローズ、Case #3729、PR #3751）
- **検知方法**: マージ後の main で当該ファイルの重複行検査（narrow 行 1 件・残存 exitCode 明示行は #3751 追加の traceability gate 引数であり重複なしを確認）
- **根本原因**: GitHub の merge 機構が同一変更内容の行を畳み込んだ（trivial 重複の auto-resolve）
- **自律対応内容**: 直列化運用は維持。マージ後の取り込み実在確認で重複行なしを検査して受理
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 同一スクリプト接触の直列化前提は競合予防として有効だが、CLEAN 判定でも重複行混入の実検査（grep による該当行カウント等）を前置するのが安全
- **再発条件**: 同一ファイルへの並列変更 PR を直列化せず連続マージした場合（CLEAN 判定でも意味的重複の危険は残る）
- **予防策候補**: 同一ファイル接触 PR の merge 後重複検査を case-close の取り込み確認手順に明記
- **想定反映先**: agentdev-workflow-case-close references pr-merge-and-conflict.md（取り込み確認手順への追記候補）
- **関連**: PR #3747（0026aefc）→ PR #3751（29ae287f）、Case #3729
- **タグ**: `#merge` `#case-close` `#直列化`

## 既存 package に型定義がある場合、ルートの ad-hoc 実行だけで型検証不能と結論しない

- **問題事象**: なし（再発防止の観測記録）。前回委譲（DEL-3725-1）で単独 tsc が Bun/Node 型定義の未解決で成立せず typecheck 未成立と報告された
- **発生局面**: case-run（DEL-3725-2、Case #3725、PR #3727）
- **検知方法**: 既存 integrity scripts package の型定義（TypeScript 5.9.3、@types/bun、@types/node）を明示して対象 5 ファイルへ CLI 型検証を実行し exit 0 を実測
- **根本原因**: 型定義解決先（検証対象が依存する package の node_modules/@types）を指定せずルートから ad-hoc 実行したため
- **自律対応内容**: 使用入口と型解決先を明示した実行手順を PR 本文へ記録（再実行コマンド全文は del3725-2-verification.json）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 型検証の失敗を「環境不支持」と結論する前に、既存 package 配下の型定義と設定の存在確認を前置する
- **再発条件**: ルート直下の ad-hoc tsc 実行で型定義未解決を確認した段階で typecheck 不可能と報告した場合
- **予防策候補**: 型検証の実行手順に、対象が依存する package 配下の型定義明示を必須化
- **想定反映先**: 検証手順の型検証条項
- **関連**: PR #3727（45c2b767）、Case #3725
- **タグ**: `#typecheck` `#検証`

## record-comments の applySection でセクション置換するとセクション後の HTML コメントが消える

- **問題事象**: Case Issue 本文の進行状況セクションを record-comments.ts の applySection で置換した際、セクション境界から次の「## 」見出しが現れない区間（文書末尾に続く工程記録 HTML コメント群）までをセクション内容として消費し、履歴コメント（case-run 停止記録・case-revise・case-ready・再委譲記録）が本文から消失した
- **発生局面**: case-close（Root Case #3725、STEP-5-2 本文結果セクション更新）
- **検知方法**: applySection 適用後の本文読み戻しで履歴 HTML コメントの不在を検出
- **根本原因**: applySection の置換範囲は次の「## 」見出しまで（または文書末尾）であり、見出し無しで後に続く HTML コメント群は前セクションの一部として扱われる
- **自律対応内容**: 消失した履歴コメントを結果セクション後に復元し、工程記録継続コメント（DEL-3725-3 完了記録・case-close 記録）を新規追記してから issue_update で更新
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: セクション置換型の本文更新では、置換前のセクション内容（見出し無しで後続するコメント・注記を含む）の保全確認を適用前に実施する
- **再発条件**: 文書末尾のセクション（後続見出しが存在しないセクション）を applySection で置換した場合
- **予防策候補**: applySection 呼び出し前のセクション後コンテンツ保全確認の手順化、または record-comments.ts の境界検出改善（learning-promote での候補化を想定）
- **想定反映先**: case-close STEP-5-2 本文更新手順
- **関連**: Case #3725、agentdev-workflow-case-run scripts/record-comments.ts
- **タグ**: `#case-close` `#issue-update` `#データ保全`
