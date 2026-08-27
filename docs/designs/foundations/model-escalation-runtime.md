---
title: OpenCode 同一セッションモデル昇格ランタイム
status: accepted
created: "2026-08-28"
updated: "2026-08-28"
---

<!-- ADF-COVERS(design): REQ-053-001, REQ-053-002, REQ-053-003, REQ-053-004, REQ-053-005, REQ-053-006, REQ-053-007, REQ-053-008, REQ-053-009, REQ-053-010, REQ-053-011, REQ-053-012, REQ-053-013, REQ-053-014, REQ-053-015, REQ-053-016, REQ-053-017 -->

# OpenCode 同一セッションモデル昇格ランタイム

## 目的

REQ-053（OpenCode 同一セッションモデル昇格と ADF 共通設定）の実装詳細を所有する。
ADF 共通設定ファイルの schema、昇格要求の受付、ターン境界切替メカニズム、状態保持、通知、
失敗報告と無限反復防止、配布経路の実装構造を確定する。

## 関連要件

- REQ-053: 本 Design の上位要件
- REQ-052-011: Plugin/Hook の実行時状態決定的切替能力
- REQ-002-012: .agentdev/ の格納対象（実行時共通構成を含む）

## 責務境界

モデルは意味的判断（解決困難か、解決したか）のみを担い、要求 tool の呼出のみを行う。
Plugin 実行機構は次のすべてを担う。

- 昇格要求・復帰要求の受付（tool 経由）と状態機械による制御
- ターン境界でのモデル・variant 切替と毎ターン再適用
- 昇格状態と昇格直前モデル・variant の保持
- 切替の一行通知
- 切替失敗の報告と成功扱いの禁止
- 無限反復の防止

## ADF 共通設定ファイル契約

- 配置: .agentdev/agentdev.jsonc。JSONC 形式。Git 管理対象。
- 性格: ADF 実行時共通構成の唯一の正規配置。特定の Plugin 専用のファイルは作らない。第一階層キーは機能名とし、他の機能が後からキーを追加できる。
- OpenCode 標準 config（opencode.json 等）の読み込み対象ではない。Plugin 実装が直接ファイルを読む。
- modelEscalation 記述例:

```jsonc
{
  "modelEscalation": {
    "model": "zai-coding-plan/glm-5.3",
    "variant": "max"
  }
}
```

- modelEscalation 不在時、昇格 Plugin は機能を発動しない（要求 tool を提供せず、切替を行わない）。

## Plugin 構成と登録

- 配置: .opencode/plugin/（singular を ADF 配布テンプレートの正とする。v1.18.23 は plugin/plugins 両方を自動発見するが、配布物は singular に統一する）。
- 実装言語: TypeScript。単一ファイルまたは小さなモジュール群。omo 等の外部ハーネス拡張に依存しない。
- 登録: ファイル配置のみで自動読み込み。opencode.json への追記登録を要求しない。
- 設定の解決: .agentdev/agentdev.jsonc を Plugin 初期化時に読み込み、modelEscalation の存在と値を検証する。読み込み・検証失敗時は機能を発動しない。JSONC の解釈は外部依存を追加せず自前で行う。設定パスは plugin context が提供する project root を基準に解決する。

## 要求受付

- Plugin は次の 2 つの tool を提供する（tool 定義 hook 経由）。
- escalate_model: 通常モデルが解決困難と判断したときに呼出。引数なし。昇格先は設定から解決する。
- revert_model: 昇格モデルが解決完了と判断したときに呼出。引数なし。復帰先は保持値から解決する。
- tool 説明に「切替は次ターン境界で実行される」「現在ターンの推論は切替わらない」ことを明記し、モデルの誤用を防ぐ。
- modelEscalation 不在時、両 tool は提供しない。

## ターン境界切替メカニズム

OpenCode v1.18.23 の実装契約（packages/opencode/src/session/prompt.ts、llm/request.ts）に基づく。

- chat.message フックは user message の永続化前に発火し、output.message は参照渡しである。
- output.message.model = { providerID, modelID, variant } を書換すると、当該ターンの LLM 呼び出し（runLoop が DB から再読込した lastUser.model を使用）と variant（variants 辞書からの option マージ）へ反映される。
- セッション行（SessionTable.model）は chat.message 発火前に setAgentModel で書込まれるため、フックからセッション行を書換することはできない。昇格状態の間、Plugin は毎ターン chat.message で書換を再適用する。
- 復帰時は保持していた昇格直前のモデル・variant へ戻す。
- 進行中の推論は切替対象外（フックはターン境界でのみ切替を行う）。

## 状態保持

- 昇格状態は sessionID 単位で Plugin 内に保持する: { phase: normal / escalated, escalationModel, escalationVariant, preModel, preVariant, currentTurnModel, currentTurnVariant }
- 昇格要求受理時に、要求時の実際のモデル・variant を preModel / preVariant として記録する。実際のモデルは各ターンの chat.message フック時に output.message.model から記録する（tool 実行は chat.message 後に起こるため、フック時の記録を保持して参照する）。
- 親セッションの昇格は子セッション（task tool 由来のサブエージェント）へ自動伝播しない。サブエージェント自身が要求 tool を呼んだ場合、その子セッションの sessionID 単位で切替する（子セッションの LLM 呼出も同一パイプラインを通るため chat.message フックで成立する）。
- 昇格状態の間、Plugin による model 書換はセッションのモデル選択より優先される（昇格モデルの明示復帰要求まで昇格状態が優先）。
- 状態は Plugin 実行プロセス内の保持であり、OpenCode 再起動やセッション resume 時には normal へ戻る（安全側に復帰）。REQ-053-006 の維持は同一 Plugin 実行プロセス内を対象とする。

## 通知

- v1.18.23 に Plugin 用の UI 通知 API は存在しないため、通知はセッション会話ストリーム上の一行表示とする。
- 一次手段: 要求 tool（escalate_model / revert_model）の result として、切替種別と切替前後のモデル・variant を含む一行を返す。tool 実行結果は会話上に表示されるため、通知はモデルの従属性に依存せず決定的に現れる。
- 補助: 切替が確定したターンの LLM 呼出 system コンテキストへ、切替事実の一行を注入する（experimental.chat.system.transform）。切替後モデルが切替を認知するための同期であり、ユーザー通知の一次手段ではない。
- assistant メッセージへの直接注入は行わない（会話履歴を汚さない）。

## 失敗報告と無限反復防止

- 切替前に昇格先モデルの存在検証を行う（provider と model の解決確認）。解決不能な場合、要求 tool の result として失敗を報告し、状態を変更しない。成功表示・成功記録を行わない。
- 無限反復防止の状態機械:
  - normal 状態では昇格要求のみ受理。escalated 状態での昇格要求には「既に昇格中」を返す。
  - escalated 状態では復帰要求のみ受理。normal 状態での復帰要求には「昇格していない」を返す。
  - 同一ターン内の要求はキューイングし、ターン終了時に最終要求のみ適用する。実適用モデルが前ターンと同一になる場合（例: 同一ターン内の escalate 直後の revert）は、状態遷移を発生させず通知も発行しない。
  - 機構が自律的に（自動リトライ等で）切替を反復することはない。切替は要求 tool へのモデルの明示呼出のみで発生する。
- ターン境界切替の実行:
  - 昇格要求受理後の次ターンで chat.message により昇格先へ書換し、以降、昇格状態の間は毎ターン再適用する。
  - 復帰要求受理後の次ターンでも chat.message により preModel / preVariant へ書換し、その後のターンから書換を停止する（セッション行が昇格中の手動変更等で変わっていても、昇格直前のモデルへ確実に戻すため）。

## 配布

- 配布物: agentdev.jsonc テンプレート、Plugin ファイルのテンプレート。リポジトリ内の配布用ディレクトリへ配置する。
- 導入: Consumer が手動コピー（.opencode/plugin/ へ Plugin、.agentdev/ へ設定）。導入スクリプトは提供しない（DEC-016 副作用ゼロ原則）。
- 配置先と Git 管理: Plugin 配置先は .opencode/plugin/（singular）。Consumer は配布テンプレートの配置先を gitignore へ追加する（.agentdev/agentdev.jsonc は Git 管理対象、Plugin ファイルは gitignore 対象）。Consumer 側 .agentdev/README.md の状態表への agentdev.jsonc エントリ追加は REQ-053 実装時に伴う文書更新として行う。
- REQ-009 配布基盤（install 対象は配布 command/skill に限定）は使用しない。

## 検証

- 観察契約: Plugin は切替・拒否・失敗の各イベントをログへ出力する（sessionID、切替種別、切替前後のモデル・variant）。test_strategy の実機検証は当該ログとセッション実測を観察対象とする。
- OpenCode v1.18.23 で昇格・継続・復帰の実機検証を行う（REQ-053-016、test_strategy の実行）。
- 既知リスクと方針:
  - chat.message 書換の挙動は OpenCode バージョン間で差異があり得る（コミュニティ実装には永続化後の DB 直接書換 workaround の事例がある）。本 Design は公式フック契約内の書換を採用し、DB 直接書換（Bus イベント抑制・公式契約外アクセス）を採用しない。OpenCode 更新時は test_strategy の実機検証で互換性を再確認する。
  - エージェント定義の tools 制限（許可リスト）により、昇格要求 tool が呼べないエージェント構成では当該セッションで昇格を利用できない。制限は配布先の選択であり、test_strategy（TS-007）は tool 呼出自体の可否を観察対象に含める。
  - OpenCode 再起動時、昇格状態は normal へ戻る（安全側）。継続運用は再昇格要求で再開する。

## 関連 Design

- REQ-052 対応 Design（Plugin/Hook 種別の配置・命名・構成契約）
