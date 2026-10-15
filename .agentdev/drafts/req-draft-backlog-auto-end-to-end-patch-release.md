---
draft_type: req_draft
topic_slug: backlog-auto-end-to-end-patch-release
status: draft
created_at: 2026-10-15T12:30:00+09:00
source_rus:
  - RU-0227
---

# draft-data

```yaml
work_type: feature
scale: large
summary: >-
  backlog-auto の単一起動で、backlog 整理サイクルで承認確定した RU 一式を要件定義・実行・検証・統合・
  一式全体の完了判定・パッチリリース作成まで接続して実行する（一気通貫実行）。既存の依存判断・並列実行機構・
  個別工程の実装を再定義せず、不足している接続部分（一式の運搬体、単一実行への写像、全体完了判定、
  版管理・リリース手順）のみを新規所有する。RU-0227 の AC-01〜AC-09 を受け入れ条件としてそのまま維持する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      単一起動一気通貫（AC-01）: /agentdev/backlog-auto の単一起動で RU 生成から要件定義・実行・検証・
      統合・一式全体の完了判定・パッチリリース作成までを実行する。既存の承認・安全境界に基づく利用者判断
      （backlog-review の RU 承認、req-define の壁打ち、リリース条件・公開権限の確認）は維持し、
      単に次の工程を開始するためだけの手動コマンド入力を要求しない。
  - id: AG-002
    content: >-
      RU 一式の完全引継ぎ（AC-02）: 一式は当該 backlog-auto 実行における backlog-review で承認確定した
      RU 一式とする。統合・分割後も元の要求と後続対象の対応を維持し、一式と無関係な既存 RU・ドラフト・
      Issue を取り込まない。
  - id: AG-003
    content: >-
      一式の単一実行への写像（AC-03、対論型レビュー F-A/E-2 反映）: 一式は単一の req-define 実行で処理して
      単一の要件doc に確定し（統合・分割は operation_units 構造で表現、REQ-008-041）、実行は当該要件doc を
      明示指定した単一の case-auto 実行として接続する（引数なし全件処理・個別ドラフトごとの複数起動は用いない）。
      並列は既存の共有 active Issue task 上限と横断補充（REQ-034-027/040）の適用範囲内で成立させる。
  - id: AG-004
    content: >-
      一式全体の並列実行（AC-03）: 一式から複数の独立した実行可能 Issue が生じた場合、既存の共有並列上限・
      依存判断・安全境界に従って Issue および Epic・Standard を横断して並列実行する。一式を複数グループへ
      分断して先行グループの全完了を待つ逐次化を行わない。
  - id: AG-005
    content: >-
      一式の中断・再開（AC-04）: RU 生成後・要件定義後・Issue 生成後・実行中のいずれの中断でも、set-state から
      同じ一式の対象と進捗を復元し、未完了部分から再開する。完了済み操作を重複実行しない。backlog-auto 再実行は
      set-state から完遂済み Case を検出し、全体完了判定以降の段階から再開できる（case-auto 単独の再開入口契約
      REQ-034-038 は変更しない）。
  - id: AG-006
    content: >-
      一式全体の完了判定（AC-05）: 元 RU 一式の必須の要求と受け入れ義務が、要件定義・実行対象・検証結果に
      過不足なく対応し、必要な範囲の検証結果がすべて成立した場合にのみ一式全体の完遂とする。個別の Issue 終了・
      PR merge のみで完遂としない。突合の正は set-state の義務スナップショットと対応表とする。
  - id: AG-007
    content: >-
      実行前後の版管理（AC-06）: 実行開始時に最後の正式リリースと開始時点コミット ID を確定し、完遂前に新規
      タグ・リリースを作成しない。完遂後はリリース時点の正規情報を確認して最後の正式リリースからパッチ番号を
      1つだけ進める。major/minor 自動振り分け・事前タグ付与・二重採番を行わない。
  - id: AG-008
    content: >-
      正式リリースの成立と再開（AC-07）: 一式全体の完遂、リリース条件、公開操作の権限がすべて成立した場合に
      限り、対象プロジェクトの採用方式に従って正式リリースを作成する。公開途中の失敗・中断時は既存の結果を
      読み戻し、タグの移動・第二のパッチ番号消費なしに未完了部分から再開する。
  - id: AG-009
    content: >-
      対象なし・初期状態・公開不能（AC-08）: RU 0 件または実変更なしの場合はリリースせず報告する。正式な
      バージョン基準がない場合は採用済み初期バージョン規則を確認し、なければ初期番号を決定せず停止して
      利用者判断を求める。公開方式・権限・環境が不足する場合は対象と理由を報告し、リリース完了としない。
  - id: AG-010
    content: >-
      全適用形態の検証（AC-09）: ADF本体、GitHub 接続型適用プロジェクト、ローカルIssue適用プロジェクトの
      各形態で実際の公開コマンド入口から共通 E2E 挙動を確認する。リリース公開先・配布物はプロジェクト採用方式
      に従う。確認できない条件は合格ではなく未検証として扱う。
  - id: AG-011
    content: >-
      既存機構の再利用・非再定義: Epic/Wave 構成規則、共有並列上限、依存判断、個別工程の実装（REQ-039、
      REQ-008、REQ-034、REQ-061、REQ-108、REQ-035、DEC-001、DEC-039）は再定義せず参照のみで再利用する。
      本変更が所有するのは不足している接続部分のみ。
  - id: AG-012
    content: >-
      set-state を一式の正規運搬体とする（対論型レビュー F-D/E-1 反映）: 一式確定時に作成し、必須要求と
      受け入れ義務のスナップショット、RU・要件doc・operation_unit・実行単位の対応表（統合・分割含む）、
      基準点情報、進捗を保持する。`.agentdev/backlog/req-units/` と `.agentdev/drafts/` の外に配置し
      （REQ-034-020 のクリーンアップ検証ゲートの対象外）、RU・要件doc の削除契約（REQ-008-010、REQ-061-025）
      は変更しない。全体完了とリリース完了まで保持し、単一書き手規則（backlog-auto レベル排他）は Design が定義する。
  - id: AG-013
    content: >-
      パッチリリースの版番号規則（2026-10-15 HITL 3回答 + 対論型レビュー E-4/F-G/N-4 反映）: 「最後の正式
      リリース」は正式 SemVer タグのみ（rc タグ・非 SemVer ベースラインタグ除外）。複数正式タグはリリース対象
      コミットの祖先として到達可能な最大版（SemVer 順序比較）。到達可能な正式タグが 0 件で正式タグが存在する
      場合は停止して利用者判断を求め（初期状態とは区別、版番号後退の自動正当化をしない）。正式基準点なし＋
      採用初期規則なしは開始時基準点確定時に停止。リリース時点で正式タグを再確認し、開始時基準より新しい正式
      タグがあればその最大版から導出し直す（タグ不移動・二重採番なし）。
  - id: AG-014
    content: >-
      パッチリリース条件の適用規則（対論型レビュー E-3/F-F 反映）: ADF本体では DEC-001 決定6 を改善サイクル・
      パッチ級の適用として確認し、この適用では条件「active な draft、RU、Issue の扱いが決着している」は一式由来の
      活性対象に限定する（無関係な既存追跡Issue・他業務ドラフトは阻止理由としない）。適用プロジェクトでは採用
      リリース条件に従い、採用が確認できない場合は HITL で確認し、確認不能はリリース完了としない。完遂済み・
      リリース保留状態は理由を記録して報告し、再実行はリリース段階から再開する。
  - id: AG-015
    content: >-
      公開操作の経路（対論型レビュー F-E/N-3 反映）: 共通の最小公開形は git タグの作成（ローカルリポジトリ
      完結可、push は REQ-102 非対話認証経路）。GitHub Release 等の追加公開成果物はプロジェクト採用方式に従い、
      Custom Tool カタログ（agentdev_gh）に含まれない操作はワークフローが準備（リリースノート草稿・対象確認）
      までを行い、公開権限確認後に所定経路で実行する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:backlog-auto-end-to-end-patch-release
    target_area: 新規 REQ（採番は保存時に req-file-manager が実施）
    source_items:
      - RU-0227（目的、問題1-5、要件化の方向1-3、AC-01〜AC-09、対象外、検証重点、作業仮定）
      - HITL 3回答（2026-10-15）
      - 対論型レビュー accepted findings（F-A〜F-D、E-1〜E-4、F-E〜F-G、N-1〜N-4）
    content: |-
      ## 目的

      backlog-auto の backlog 整理サイクル（inspect-docs → 昇格3系統 → backlog-review）で承認確定した RU 一式を、単一の公開コマンド起動で要件定義・実装・検証・統合・一式全体の完了判定・パッチリリース作成まで接続して実行する（一気通貫実行）。既存の依存判断・並列実行機構・個別工程の実装を再定義せず、不足している接続部分のみを所有する。

      ## 適用範囲

      | ID | 要件 |
      |---|---|
      | R-001 | `/agentdev/backlog-auto` の単一起動で、backlog 整理サイクル、RU 一式の要件定義、実行、検証、統合、一式全体の完了判定、パッチリリース作成までを接続して実行すること。既存の承認・安全境界に基づく利用者判断（backlog-review の RU 承認、req-define の壁打ち、リリース条件・公開権限の確認）は維持し、単に次の工程を開始するためだけの手動コマンド入力を要求しないこと |
      | R-002 | 一式の対象は当該 backlog-auto 実行における backlog-review で承認確定した RU 一式とし、一式の必須の要求と受け入れ義務のスナップショット、RU・要件doc・operation_unit・実行単位の対応表（統合・分割を含む）、基準点情報、進捗を set-state として記録・維持すること。統合・分割後も元の要求と後続対象の対応を維持し、一式と無関係な既存 RU・ドラフト・Issue を取り込まないこと |
      | R-003 | 一式は単一の req-define 実行（入力は一式の RU の明示列挙）で処理し、結果を単一の要件doc に確定すること（複数 RU の統合・分割は operation_units 構造で表現）。実行は当該要件doc を明示指定した単一の case-auto 実行として接続し、引数なし全件処理および個別ドラフトごとの複数 case-auto 起動を用いないこと |
      | R-004 | 一式から複数の独立した実行可能 Issue が生じた場合、既存の共有 active Issue task 上限と横断補充（REQ-034-027、REQ-034-040）に従って Issue および Epic・Standard を横断して並列実行すること。一式を複数グループへ分断し、実行可能な Issue が残っているのに先行グループの全完了を待つ逐次化を行わないこと |
      | R-005 | req-define の壁打ちで利用者が一式の複数要件docへの分割を判断した場合、当該判断を一式の構成変更（再スコープ）として set-state に記録し、分割後の各一式はそれぞれ独立した一気通貫ライフサイクル（基準点確定から）で扱うこと |
      | R-006 | RU 生成後・要件定義後・Issue 生成後・実行中のいずれで中断しても、set-state から同じ一式の対象と進捗を復元し、未完了部分から再開すること。完了済みの操作を重複実行しないこと。backlog-auto の再実行は set-state から完遂済み Case を検出し、全体完了判定以降の段階から再開できること（case-auto 単独の再開入口契約 REQ-034-038 は変更しない） |
      | R-007 | 一式全体の完了は、元 RU 一式の必須の要求と受け入れ義務が、要件定義・実行対象・検証結果に過不足なく対応し、必要な範囲の検証結果がすべて成立した場合にのみ判定すること。個別の Issue 終了・PR merge のみで一式全体の完遂としないこと。突合の正は set-state の義務スナップショットと対応表とすること（RU・要件docの削除契約 REQ-008-010、REQ-061-025 は変更しない） |
      | R-008 | 実行開始時に、最後の正式リリース（版番号規則は Decision `backlog-auto-patch-release` に従う）と開始時点のコミット ID を確定すること。一式全体の完遂前に新規のタグ・リリースを作成しないこと |
      | R-009 | 一式全体完遂後、リリース時点の正規情報を確認し、最後の正式リリースからパッチ番号を1つだけ進めた版を確定し、リリース対象コミット（一式の全マージ完遂時点の main HEAD）にタグを付与すること。タグ付与前に開始コミットから対象コミットまでの差分と一式分の実変更の突合を行い、無関係コミットの混入を検出した場合は報告して利用者判断を求めること。major/minor への自動振り分け、同一実行での二つの版番号の消費、既存タグの移動を行わないこと |
      | R-010 | 正式リリースは、一式全体の完遂、リリース条件（Decision `backlog-auto-patch-release` の適用規則）、公開操作の権限がすべて成立した場合に限り、対象プロジェクトの採用方式に従って作成すること。少なくとも正式バージョン、リリース対象コミット、タグ、リリース内容が確認可能であること。追加の公開成果物は対象プロジェクトの採用方式に従うこと |
      | R-011 | 公開途中の失敗・中断時は、既存の結果を読み戻し、タグの移動・再作成、第二のパッチ番号の消費なしに未完了部分から再開すること |
      | R-012 | RU 0 件またはリリース対象となる実変更がない場合はリリースを作成せず報告すること。正式なバージョン基準がない場合は対象プロジェクトの採用済み初期バージョン規則を確認し、確認できない場合は初期バージョン番号を決定せず停止して利用者判断を求めること。公開方式・権限・必要な環境が不足する場合も対象と理由を報告し、リリース完了としないこと |
      | R-013 | ADF本体、GitHub 接続型適用プロジェクト、ローカルIssue適用プロジェクトの各採用形態で、実際の公開コマンド入口からの共通の E2E 挙動が確認可能であること。リリース公開先・配布物は対象プロジェクトの採用方式に従い、並列実行・中断再開も各形態で実測すること。必要な環境・権限がなく確認できない条件は合格ではなく未検証として扱うこと |
      | R-014 | 既存の利用者判断境界（req-define の壁打ち、backlog-review の RU 承認、リリース条件・公開権限の確認）を自動化しないこと。REQ-039-001（backlog-review は自動的な要件化を行わない）は backlog-review のスコープ制約として維持し、backlog-auto による req-define 起動は req-define 自体の壁打ち・承認境界を保存する接続であること |
      | R-015 | REQ-041 の完了扱い・全体報告に係る行は backlog 整理サイクル部分に係るものであり、一気通貫全体の完遂判定と最終報告は本 REQ が所有すること |

      ## 対象外

      - learning・intake・inspect の評価ロジックの全面再設計
      - Epic/Wave 構成規則、共有並列上限、依存判断、並列実行アルゴリズムの再定義
      - 個別の要件定義・実装・検証工程の重複実装
      - 新規の汎用工程管理基盤・恒久台帳の一律導入
      - 配布形式の統一
      - major/minor バージョンの自動判定
      - 本番環境への自動配備
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-041.md
    target_area: "## 目的（追記）、## 適用範囲 対象外（1項目除去）"
    source_items:
      - RU-0227（要件化の方向1、Source Summary）
      - STEP-3 既存REQ照合（REQ-041 対象外の直接衝突）
    content: |-
      edit-1（## 目の追記、append）:
      「backlog-auto による RU 一式の要件定義、実行、全体完了判定、パッチリリースまでの接続（一気通貫実行）は new:backlog-auto-end-to-end-patch-release が所有する。本 REQ の backlog 整理サイクル契約は維持する。」

      edit-2（## 適用範囲 対象外の除去、replace）:
      除去対象「  - req-define、case-open / case-ready を経由した GitHub Issue / PR 作成までの自動化」

      組立・検査は assemble-draft-section.ts v0.1.0（no-write）で実施済み。assembly_evidence 参照。
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:backlog-auto-patch-release
    target_area: 新規 Decision（採番は保存時に decision-file-manager が実施）
    source_items:
      - HITL 3回答（2026-10-15）
      - 対論型レビュー accepted findings（E-3、E-4、F-E、F-F、F-G、N-3、N-4）
    content: |-
      ## 決定

      ### 決定(1) 改善サイクル・パッチリリース方針

      backlog-auto 一気通貫実行（`backlog-auto-end-to-end-patch-release`）に伴うパッチリリースの版番号・リリース条件・公開操作の規則を次のとおり定める。DEC-001 決定6（リリース条件）と DEC-039（タグ権威・不移動）の系譜を延長する新 Decision であり、DEC-034（移行リリース境界）とは主題が異なる。

      - 版番号: 改善サイクルのリリースは最後の正式リリースからパッチ番号を1つだけ進める。major/minor への自動振り分けは行わない。
      - 正式リリースの基準: 「最後の正式リリース」は正式 SemVer タグのみを対象とする（rc タグ、非 SemVer ベースラインタグは除外する）。複数の正式タグがある場合は、リリース対象コミットの祖先として到達可能なもののうち最大版を基準とする。最大版の比較は SemVer 順序比較とし、辞書式比較を用いない。
      - 到達可能な正式タグが 0 件の場合: 正式タグが存在しない初期状態とは区別し、停止して既存正式タグとの方針（版番号後退の回避を含む）を利用者判断に求める。初期バージョン番号の自動決定は行わない。
      - 初期状態: 正式なバージョン基準が存在せず、採用済みの初期バージョン規則も確認できない場合、実行開始前の基準点確定時に停止し、利用者に初期バージョンの判断を求める。
      - リリース時点の再確認: 一式完遂後のリリース時に正式タグを再確認し、開始時基準より新しい正式タグが存在する場合はその最大版からパッチ番号を導出し直す。既存タグとの衝突、タグの移動、二重採番は行わない。
      - リリース条件: ADF本体では DEC-001 決定6 を改善サイクル・パッチ級の適用として確認する。この適用では条件「active な draft、RU、Issue の扱いが決着している」は一式由来の活性対象に限定する（無関係な既存追跡Issue・他業務のドラフトは本リリースの阻止理由としない）。適用プロジェクトでは当該プロジェクトが採用したリリース条件に従い、採用が確認できない場合は HITL で確認し、確認不能はリリース完了としない。
      - 完遂済み・リリース保留: 一式完遂後にリリース条件・権限が不成立の場合は「完遂済み・リリース保留（理由記録）」として報告し、backlog-auto の再実行は実装を再実行せずリリース段階から再開する。
      - 公開操作: 共通の最小公開形は git タグの作成とする（ローカルリポジトリ完結可。リモートへの push は REQ-102 の非対話認証経路による）。GitHub Release 等の追加公開成果物はプロジェクトの採用方式に従い、Custom Tool カタログに含まれない操作はワークフローが準備（リリースノート草稿・対象確認）までを行い、公開権限の確認後に所定経路で実行する。
      - タグ権威・不移動: 既存のリリースタグは一切移動しない（DEC-039 準拠）。

      合意基盤: 2026-10-15 の HITL 3回答（初期状態は開始前基準点確定時に停止／正式 SemVer タグのみ基準／到達可能な正式タグの最大版）。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/backlog-auto.md
    target_area: 目的、入力、出力、副作用、HITL 境界、停止条件、現在の動作、対象外、検証観点（公開 interface の拡張）
    source_items:
      - RU-0227 AC-01、AC-07、AC-08
      - 対論型レビュー F-B、F-C（公開契約チェーンの更新・層分離）
    content: |-
      公開 interface の拡張（実行構造の複製は行わない。orchestration stage 構成・set-state 形式・resume 契約は Workflow Skill 側 Design の所有）:

      - 目的: backlog-auto の対象を、backlog 整理サイクルに加えて RU 一式の要件定義・実行・検証・統合・全体完了判定・パッチリリース作成への接続（一気通貫実行）まで拡張する。所有する実行契約は new:backlog-auto-end-to-end-patch-release。
      - 入力: 引数なし（対象状態は各子コマンドと set-state の永続状態から解決する）。
      - 出力: 整理サイクルの既存出力に加え、一気通貫の実行結果報告（工程別結果、全体完了判定結果、リリース結果または保留理由、再開経路を含む共通実行契約形式）。
      - 副作用: 整理サイクルの既存副作用に加え、set-state の作成・更新（.agentdev/ 配下、req-units/drafts の外）、git タグ作成・push（リリース時、Decision backlog-auto-patch-release 準拠）、追加公開成果物の準備物作成を発生させる。
      - HITL 境界: 既存の子ワークフロー HITL 境界に加え、開始時基準点確認（初期状態・到達不能正式タグの場合の停止）、リリース条件確認、公開権限確認を利用者判断境界として持つ。既存境界の自動化は行わない。
      - 停止条件: 整理サイクルの既存停止条件に加え、基準点確定不能、要件定義・実行の blocking 停止伝播、全体完遂不成立、リリース条件・権限不成立（完遂済み・リリース保留として報告）、公開途中失敗（読み戻し再開可能な状態で報告）。
      - 対象外: 子ワークフロー内部ロジックの再実装、Epic/Wave 構成規則・共有並列上限・依存判断の再定義、major/minor 自動判定、本番自動配備。
      - 検証観点: 一気通貫の実行結果報告が共通実行契約形式で報告されること、既存子コマンドの公開契約に差分がないこと。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-backlog-auto.md
    target_area: orchestration stage 構成の拡張、set-state 永続化形式、基準点確認手続、全体完了突合手続、リリース手順シーケンスと再開経路、直列化・単一書き手、委譲
    source_items:
      - RU-0227 AC-01〜AC-09
      - 対論型レビュー F-A/F-C/F-D/E-1/E-2/E-4/F-E/N-2
    content: |-
      実行構造の拡張（公開 interface は commands/backlog-auto.md の所有）:

      - orchestration stage 構成: 既存 stage 1〜3（inspect-docs、昇格3系統、backlog-review）に続く stage 4〜7として、要件定義接続（単一 req-define 実行、入力は一式 RU の明示列挙、単一要件doc 確定）、実行接続（要件doc 明示指定の単一 case-auto 実行）、全体完了判定（set-state 義務スナップショットと要件定義・実行対象・検証結果の突合）、リリース（基準点再確認、版番導出、タグ付与、追加公開物準備、結果記録）を追加する。
      - set-state 永続化形式: 一式識別子、必須要求と受け入れ義務のスナップショット、RU・要件doc・operation_unit・実行単位の対応表（統合・分割を含む）、基準点情報（最後の正式リリース、開始コミット ID）、進捗、リリース状態（未着手／保留理由／完了）を記録する。配置は .agentdev/ 配下で req-units/drafts の外（REQ-034-020 ゲート対象外）とし、全体完了とリリース完了まで保持する。
      - 単一書き手規則: set-state への書込みは同一 backlog-auto 実行に限定し、backlog-auto の二重起動に対しては既存の single-flight 保護に準じて排除する。
      - 基準点確認手続: 正式 SemVer タグの列挙、リリース対象コミットの祖先到達判定、最大版算出（SemVer 順序比較）、到達可能 0 件・基準なしの場合の停止と利用者判断要求、開始コミット ID の記録を含む。
      - 全体完了突合手続: set-state の義務スナップショットと、要件doc の review_dispositions・Issue 完了条件・検証証跡との突合により、過不足なく対応し必要な検証結果が成立していることを確認する。Issue 数・PR merge 状態のみで完了判定しない。
      - リリース手順シーケンスと再開経路: リリース時点の正式タグ再確認、版番導出、対象コミット確定（一式の全マージ完遂時点の main HEAD）と無関係コミット混入検知（開始コミット..対象コミットの差分と一式分実変更の突合）、タグ作成、（採用方式があれば）追加公開物、結果記録の順。各段階の中断・失敗時は既存結果の読み戻しにより未完了段階から再開する（タグ不移動・再作成なし・第二番号なし）。backlog-auto 再実行は set-state から完遂済み Case を検出し全体完了判定以降から再開する。停止報告には case-auto 単独の再開入口（REQ-034-038）に加えて一式再開経路（backlog-auto 再実行）を併記する。
      - 委譲: 子ワークフロー（req-define、case-auto、整理サイクル各コマンド）への委譲は既存の委譲契約に従う。公開操作のうち Custom Tool カタログに含まれない操作はワークフローが準備までを行い、実行は承認後の所定経路とする。

conflict_resolutions:
  - id: CR-001
    conflict: REQ-041 の対象外「req-define、case-open / case-ready を経由した GitHub Issue / PR 作成までの自動化」が RU-0227 一気通貫と直接衝突する
    resolution: >-
      REQ-041 は backlog 整理サイクル契約に集中させ（DEC-010 の 1:N 分割原則）、一気通貫実行契約を新規 REQ
      として分離所有する。REQ-041 は目的への所有権移転文の追記と当該対象外項目の除去のみ（2編集、組立検査済み）。
  - id: CR-002
    conflict: REQ-039-001「RU 生成はユーザー承認を経て確定し、自動的な要件化を行わない」と backlog-auto による req-define 自動起動の解釈関係
    resolution: >-
      REQ-039-001 は backlog-review のスコープ制約として維持する（REQ 操作なし）。backlog-auto による
      req-define 起動は、req-define 自体の壁打ち・承認境界を保存する接続であることを新 REQ 本文（R-014）に明記する。
  - id: CR-003
    conflict: REQ-008-010（RU は case-ready 成功後に削除）・REQ-061-025（要件doc 削除）と AC-02/AC-05 の元 RU 一式との突合の両立
    resolution: >-
      RU・要件doc の削除契約は変更しない。一式の正規運搬体として set-state（義務スナップショット＋対応表）を
      新 REQ に定義し、削除後の中断再開・全体完了突合は set-state を正として行う。set-state は req-units/drafts の
      外に配置し REQ-034-020 クリーンアップゲートの対象外とする。
  - id: CR-004
    conflict: 共有並列上限のスコープ（REQ-034-027 は 1 回の orchestration 全体が単位）と一式横断並列（AC-03）の両立
    resolution: >-
      一式を単一要件doc・単一 case-auto 実行に写像することで、既存の共有上限と横断補充（REQ-034-027/040）の
      適用範囲内で並列を成立させる（REQ-034 の再定義なし）。壁打ちでの分割判断は一式の再スコープとして記録し、
      分割後の各一式は独立ライフサイクルで扱う。
  - id: CR-005
    conflict: DEC-001 決定6 条件6「active な draft、RU、Issue の扱いが決着している」の全リポジトリ解釈が、無関係な既存追跡Issue の存在でパッチリリースを恒久阻止する
    resolution: >-
      DEC-001 本文は変更せず、新 Decision において改善サイクル・パッチ級の適用規則として条件6を一式由来の活性
      対象に限定すると明記する。適用プロジェクトは採用規則・HITL 確認で解決し、確認不能はリリース完了としない。
  - id: CR-006
    conflict: 新規 Design を commands ドメインの新 slug で作成すると、既存 backlog-auto コマンド Design（1 コマンド 1 Design 配置）との二重所有・層違反になる
    resolution: >-
      新規 Design 作成は行わず、既存の commands/backlog-auto.md（公開 interface）と skills/agentdev-workflow-backlog-auto.md
      （実行構造）の 2 Design を UPDATE する（3 層責務モデル、REQ-041-002/003 準拠）。コマンド定義・Workflow Skill
      本体の更新は realization_actions に置く。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0227
    target_req: new:backlog-auto-end-to-end-patch-release
    target_design:
      - docs/designs/commands/backlog-auto.md
      - docs/designs/skills/agentdev-workflow-backlog-auto.md
    operation: create-and-update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}

test_strategy:
  - id: TS-001
    target_item: R-001（AC-01 単一起動一気通貫）
    verification: ADF本体の実リポジトリで /agentdev/backlog-auto を1回起動し、RU 生成から要件定義・実行・検証・リリース作成までの実行記録を通しで確認する。次工程を開始するためだけの手動コマンド入力が実行経路に存在しないことを記録から検証する（壁打ち・承認応答は 手動コマンド入力に含めない）
    pass_criteria: 実際の公開コマンド入口から後続工程とリリースまでの実行結果が確認でき、工程開始のみを目的とする手動コマンド入力が存在しないこと
    on_failure: fix-and-reverify
  - id: TS-002
    target_item: R-002（AC-02 RU 一式完全引継ぎ）
    verification: 統合・分割を含む RU 一式と、一式と無関係な既存ドラフトが混在する状態で backlog-auto を実行し、set-state の対応表と実際の要件doc・Issue の対応を突合する
    pass_criteria: 元 RU 一式の要求・義務が漏れ・重複・無関係対象の取り込みなしに後続対象へ対応付けられていること
    on_failure: fix-and-reverify
  - id: TS-003
    target_item: R-003/R-004（AC-03 一式全体並列実行）
    verification: 一式から独立した実行可能 Issue 数が共有並列上限を超える構成で実行し、実行記録から実際の並列実行と空き枠への継続補充を確認する
    pass_criteria: Issue・Epic 横断で並列実行が実測され、一式が複数 case-auto 呼び出しへ分断されず、実行可能 Issue が残っている状態での先行グループ待ちの逐次化が存在しないこと
    on_failure: fix-and-reverify
  - id: TS-004
    target_item: R-006（AC-04 一式中断再開）
    verification: RU 生成後・要件定義後・Issue 生成後・実行中の各点で中断し、backlog-auto 再実行時に set-state から同じ一式と進捗が復元され、未完了部分から再開することを確認する。実行中の委譲の扱いと完了済み操作の非重複も確認する
    pass_criteria: 中断前後で一式の対象が同一として扱われ、完了済み操作が重複実行されず、Issue が二重に生成されないこと
    on_failure: fix-and-reverify
  - id: TS-005
    target_item: R-007（AC-05 全体完了判定）
    verification: set-state の義務スナップショットと要件定義・実行対象・検証結果の突合を実施する。全 Issue がクローズしていても義務対応の証拠が欠落するケースで完遂とならないことを含めて確認する
    pass_criteria: 義務と検証結果が過不足なく対応した場合のみ完遂となり、Issue 数の一致のみでは完遂とならないこと
    on_failure: fix-and-reverify
  - id: TS-006
    target_item: R-008/R-009（AC-06 実行前後の版管理）
    verification: 最後の正式リリースが v1.2.3 相当の環境で実行し、実行開始前にタグ・リリースが作成されないこと、完遂後に v1.2.4 相当が導出されタグが対象コミットを指すことを確認する
    pass_criteria: 事前タグ付与・二つの版番号消費・変更種別による minor ルーティングがいずれも発生しないこと
    on_failure: fix-and-reverify
  - id: TS-007
    target_item: R-010/R-011（AC-07 正式リリース成立と再開）
    verification: 通常成立ケースに加え、タグ作成後の停止・追加公開物作成中の停止・結果確認中の停止を発生させ、再開時に既存結果の読み戻しによりタグ移動・第二のパッチ番号なしで完了することを確認する
    pass_criteria: 一式完遂・リリース条件・公開権限の成立時のみリリースが作成され、部分完了が完了として報告されないこと
    on_failure: fix-and-reverify
  - id: TS-008
    target_item: R-012（AC-08 対象なし・初期状態・公開不能）
    verification: RU 0 件、実変更なし、正式バージョン基準なし（採用規則なし）、公開方式・権限不足の 4 ケースで実行し、タグ・リリースの不作成と報告内容を確認する
    pass_criteria: いずれのケースでも不適切なタグ・リリースが作成されず、初期番号の推測や公開不能時の完了報告が行われないこと
    on_failure: fix-and-reverify
  - id: TS-009
    target_item: R-013（AC-09 全適用形態検証）
    verification: ADF本体、GitHub 接続型適用プロジェクト、ローカルIssue適用プロジェクトの各形態で実際の公開コマンド入口から E2E を実測する（並列実行・中断再開を含む）。検証環境・権限が用意できない条件は未検証として記録する
    pass_criteria: ADF本体単独の成功をもって合格とせず、各採用形態で共通 E2E 挙動が確認できること（未検証条件は未検証として区別されること）
    on_failure: record-in-findings
  - id: TS-010
    target_item: R-002/R-006/R-007 の set-state 運搬体（対論型レビュー F-D/E-1 反映）
    verification: case-ready 成功による RU・要件doc の削除後に中断・再開と全体完了突合を実行し、set-state から一式の復元・義務突合・リリース再開が成立することを確認する。併せて REQ-034-020 のクリーンアップ検証ゲートが set-state を誤検出しないことを確認する
    pass_criteria: RU・要件doc ファイルの不在時に一式復元・突合・再開が成立し、クリーンアップゲートの誤検出（停止）が発生しないこと
    on_failure: fix-and-reverify

realization_actions:
  - id: RA-001
    concern: backlog-auto コマンド定義の公開契約が現行ガードレールで後続工程の自動起動を明文禁止している
    responsibility: コマンド定義の更新（description、workflow 委譲、不変条件・ガードレールの自動起動除外リスト見直し、副作用・HITL 境界の宣言）を本 Case の実装で行う
    ownership_hints:
      - src/common/commands/agentdev/backlog-auto.md
    intent: 公開契約チェーン（REQ-041 → コマンド定義 → Workflow Skill）全体で一気通貫の所有権移転を矛盾なく反映する
    verification_refs:
      - TS-001
    source_items:
      - 対論型レビュー F-B
  - id: RA-002
    concern: Workflow Skill の orchestration stage モデルが backlog-review で終端している
    responsibility: agentdev-workflow-backlog-auto スキル（SKILL.md、references）の拡張実装（stage 4〜7、set-state 読書き、req-define/case-auto 接続、全体完了突合、リリース手順）を行う
    ownership_hints:
      - src/common/skills/agentdev-workflow-backlog-auto/
    intent: 実行構造の拡張をスキル Design（ACT-DESIGN-002）の定義どおりに配布物へ実装する
    verification_refs:
      - TS-001
      - TS-003
      - TS-004
      - TS-010
    source_items:
      - 対論型レビュー F-B、F-C
  - id: RA-003
    concern: コマンド README 表・ルート README・guides の経路表記が手動合流を前提としている
    responsibility: 配布物・案内の整合更新（backlog-auto → req-define → case-auto 経路の自動化反映）を行い、docs-spec-rebuild-integrity の検査対象に含める
    ownership_hints:
      - src/common/commands/agentdev/README.md
      - README.md
      - docs/guides/
    intent: 配布物と正規契約の乖離を残さない
    verification_refs:
      - TS-001
    source_items:
      - 対論型レビュー F-B（残留）
  - id: RA-004
    concern: git タグ作成・push 以外の公開操作（GitHub Release 等）が Custom Tool カタログ（agentdev_gh）に存在しない
    responsibility: 公開操作の実行経路設計（REQ-102 非対話認証経路の git 操作、カタログ外操作は準備と承認後の所定経路）を Design に従って実装し、REQ-011/REQ-052 の I/O 境界との整合を確認する
    ownership_hints:
      - docs/designs/skills/agentdev-workflow-backlog-auto.md
      - docs/designs/responsibilities/custom-tool-contracts.md
    intent: 「既存機構のみ」の主張が I/O 境界で破綻しないよう、公開操作の主体・権限・失敗時扱いを所有する
    verification_refs:
      - TS-007
      - TS-008
    source_items:
      - 対論型レビュー F-E
  - id: RA-005
    concern: AC-09 の三形態検証には改善事項が蓄積された実適用プロジェクトの用意が必要
    responsibility: 検証用代表適用プロジェクトの fixture を代表ケース検証（REQ-027）の枠で用意する。用意できない条件は未検証として記録する（RU-0227 AC-09 の既定どおり）
    ownership_hints:
      - tests/ または検証用 fixture リポジトリ
    intent: AC-09 を恒久的未検証にしない検証基盤を確保する
    verification_refs:
      - TS-009
    source_items:
      - 対論型レビュー N-3

review_dispositions:
  - id: RD-001
    source_ru: RU-0227
    source_item: 目的（単一起動による一気通貫と RU 一式の保存、既存機構の再利用）
    disposition: covered
    reason_code: fully-projected
    reason: R-001、R-014、AG-011 として新 REQ に反映
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: artifact_actions.ACT-REQ-001.content R-001/R-014
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0227
    source_item: 問題1（RU 生成後の手動次工程開始）
    disposition: covered
    reason_code: fully-projected
    reason: R-001 が次工程開始のみを目的とする手動コマンド入力を禁止し、HITL 境界を維持する
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: artifact_actions.ACT-REQ-001.content R-001
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0227
    source_item: 問題2（RU 一式が同じ対象集合として扱われない）
    disposition: covered
    reason_code: fully-projected
    reason: R-002（set-state による一式の定義と対応表）と R-007（全体完了判定）で解消
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: artifact_actions.ACT-REQ-001.content R-002/R-007
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0227
    source_item: 問題3（RU 単位の分割による並列機会の喪失）
    disposition: covered
    reason_code: fully-projected
    reason: R-003（単一要件doc・単一 case-auto 実行への写像）と R-004（横断並列）で解消
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: artifact_actions.ACT-REQ-001.content R-003/R-004
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0227
    source_item: 問題4（個別 Issue 完了と一式目的達成の混同）
    disposition: covered
    reason_code: fully-projected
    reason: R-007 が義務と検証結果の突合を完遂条件とし、Issue 終了・PR merge のみを完遂としない
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: artifact_actions.ACT-REQ-001.content R-007
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0227
    source_item: 問題5（基準点・リリースと改善サイクルの非連動）
    disposition: covered
    reason_code: fully-projected
    reason: R-008〜R-012 と Decision backlog-auto-patch-release で解消
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: artifact_actions.ACT-REQ-001.content R-008-R-012
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0227
    source_item: 要件化の方向1（一式の実行を統括）
    disposition: covered
    reason_code: fully-projected
    reason: R-001〜R-006、R-014 として反映（対論型レビュー F-A/E-2 の接続手段を含む）
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: artifact_actions.ACT-REQ-001.content R-001-R-006
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0227
    source_item: 要件化の方向2（一式全体の完了確認）
    disposition: covered
    reason_code: fully-projected
    reason: R-006、R-007 として反映（set-state 運搬体 F-D/E-1 反映を含む）
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: artifact_actions.ACT-REQ-001.content R-006/R-007
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0227
    source_item: 要件化の方向3（完遂後のパッチリリース）
    disposition: covered
    reason_code: fully-projected
    reason: R-008〜R-012 と Decision、Design のリリース手順として反映
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: artifact_actions.ACT-REQ-001.content R-008-R-012
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0227
    source_item: AC-01 単一起動一気通貫
    disposition: covered
    reason_code: acceptance-preserved
    reason: R-001 および TS-001 として維持（不合格例を含む）
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: test_strategy.TS-001
      checked_at_commit: null
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0227
    source_item: AC-02 RU 一式完全引継ぎ
    disposition: covered
    reason_code: acceptance-preserved
    reason: R-002、TS-002 として維持
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: test_strategy.TS-002
      checked_at_commit: null
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0227
    source_item: AC-03 一式全体並列実行
    disposition: covered
    reason_code: acceptance-preserved
    reason: R-003/R-004、TS-003 として維持
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: test_strategy.TS-003
      checked_at_commit: null
    related_removed_items: []
  - id: RD-013
    source_ru: RU-0227
    source_item: AC-04 一式中断再開
    disposition: covered
    reason_code: acceptance-preserved
    reason: R-006、TS-004 として維持
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: test_strategy.TS-004
      checked_at_commit: null
    related_removed_items: []
  - id: RD-014
    source_ru: RU-0227
    source_item: AC-05 全体完了判定
    disposition: covered
    reason_code: acceptance-preserved
    reason: R-007、TS-005 として維持
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: test_strategy.TS-005
      checked_at_commit: null
    related_removed_items: []
  - id: RD-015
    source_ru: RU-0227
    source_item: AC-06 実行前後の版管理
    disposition: covered
    reason_code: acceptance-preserved
    reason: R-008/R-009、TS-006 として維持
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: test_strategy.TS-006
      checked_at_commit: null
    related_removed_items: []
  - id: RD-016
    source_ru: RU-0227
    source_item: AC-07 正式リリース成立と再開
    disposition: covered
    reason_code: acceptance-preserved
    reason: R-010/R-011、TS-007 として維持
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: test_strategy.TS-007
      checked_at_commit: null
    related_removed_items: []
  - id: RD-017
    source_ru: RU-0227
    source_item: AC-08 対象なし・初期状態・公開不能
    disposition: covered
    reason_code: acceptance-preserved
    reason: R-012、TS-008 として維持（HITL 回答1を反映）
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: test_strategy.TS-008
      checked_at_commit: null
    related_removed_items: []
  - id: RD-018
    source_ru: RU-0227
    source_item: AC-09 全適用形態検証
    disposition: covered
    reason_code: acceptance-preserved
    reason: R-013、TS-009 として維持（未検証扱い規則を含む）
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: test_strategy.TS-009
      checked_at_commit: null
    related_removed_items: []
  - id: RD-019
    source_ru: RU-0227
    source_item: 対象外（learning/intake/inspect 再設計、Epic/Wave 規則再定義、個別工程重複実装、汎用基盤、配布統一、major/minor 自動判定、本番自動配備）
    disposition: not_applicable
    reason_code: out-of-scope-preserved
    reason: 新 REQ の対象外として同一内容で維持する（AG-011）
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: artifact_actions.ACT-REQ-001.content 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-020
    source_ru: RU-0227
    source_item: 検証重点3（対象の連続性、既存能力の接続、公開結果の成立）
    disposition: covered
    reason_code: fully-projected
    reason: TS-001〜TS-010 が部品試験のみで一気通貫成立を証明しない構成（E2E 実測・突合・公開結果確認）として反映
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: test_strategy
      checked_at_commit: null
    related_removed_items: []
  - id: RD-021
    source_ru: RU-0227
    source_item: 作業仮定（Epic/Wave・共有並列上限・依存判断・個別品質検証の不変更、Git tag 共通基準、初期化必要扱い、矛盾時の規約確認）
    disposition: covered
    reason_code: working-assumption-encoded
    reason: AG-011、AG-012、Decision の版番規則、CR-001〜CR-006 として反映
    evidence:
      path: .agentdev/drafts/req-draft-backlog-auto-end-to-end-patch-release.md
      section: conflict_resolutions
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - tool: assemble-draft-section.ts v0.1.0 (no-write)
    target: docs/requirements/REQ-041.md
    target_sha256: edd63997dcd29401e2639c01975134efe59e56eee66ef888301690af15992d04
    operation: append
    target_area: "## 目的（scope lines 8-18）"
    edit_sha256: b70f6f6958f4ce3294b1d6d6f8c40a259381f2fa25cc349fae13f9d6fdfabd1f
    executed_at: "2026-10-15T02:43:27.679Z"
    line_delta: +2
  - tool: assemble-draft-section.ts v0.1.0 (no-write)
    target: docs/requirements/REQ-041.md
    target_sha256: edd63997dcd29401e2639c01975134efe59e56eee66ef888301690af15992d04
    operation: replace
    target_area: "## 適用範囲 対象外（scope lines 41-57）"
    edit_sha256: 21691391e22405c97f505b7f79095a58b5c248f6956bbf63a5152eb480b82911
    executed_at: "2026-10-15T02:42:59.463Z"
    line_delta: -1

case_open_hints:
  epic_needed: true
  decomposition: >-
    単一 Root Case（OU-001）。実行構造の分解（複数 Epic/Standard 混在）は case-ready の連結成分分解
    （REQ-061-008）と Epic サイズ上限（REQ-061-010）に委譲する。
  wave_hints:
    - 正規文書の確定（新規 REQ、REQ-041 更新、Decision、2 Design 更新）を先行する
    - コマンド定義・Workflow Skill の実装（stage 拡張、set-state、基準点確認、リリース手順）を後段に置く
    - 三形態検証（ADF本体・GitHub 接続型・ローカルIssue）と検証 fixture の用意を最終段に置く
```
