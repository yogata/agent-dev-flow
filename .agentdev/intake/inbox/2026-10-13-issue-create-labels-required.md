# agentdev_gh issue_create の labels 必須契約と case-open reference 手順6の任意付与記述の整合を取る

## 観測

case-open STEP-2 で agentdev_gh issue_create を実行した際、labels 未指定の呼び出しが invalid-input（required field labels is missing）で拒否された（retryable、1回の再試行で labels 指定により成功）。一方、case-open workflow skill の reference（src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md 手順6）は「検索・整理用ラベル（work_type 等）の付与は任意である。付与義務と起票時の既定付与は設けない」と規定し、Custom Tool 操作契約（docs/designs/responsibilities/custom-tool-contracts.md）の issue_create 入力契約では labels が required フィールドである。手順の任意記述はラベル値の選択を指すが、Tool 契約の required はフィールド存在を要求するため、読み手が labels を渡さずに呼び出す解釈を生み得る。

## 今回扱わない理由

本 Case（#3675）は docs 現行化バッチであり、workflow skill reference と Tool 操作契約の文書整合は本筋外である。起票操作自体は labels 指定の再試行で完了済みであり、実行への影響はない。修正対象は配布物（workflow skill reference または custom-tool-contracts.md の操作契約記述）であり、別 Case として育成する。

## 影響

case-open および issue 起票系 workflow の実行時に、reference の任意記述を根拠に labels を省略した呼び出しが Tool 契約で拒否され、1回の再試行を生じる。fail-closed 拒否のため安全性の問題はないが、各実行で解釈判断の往復が生じ得る。

## レビューで決めること

- 整合先の選択: reference 手順6へ「Tool 契約上 labels は必須フィールドであり空配列以上を渡す。付与するラベル値の選択は任意」の注記を追加するか、custom-tool-contracts.md の issue_create 契約で labels を任意フィールドへ変更するか
- work_type ラベルの付与（本実行では docs_chore を付与済み）を既定付与へ格上げするか、空配列既定とするか

## 根拠（任意）

- 観測元: Case #3675（case-open 実行、2026-10-13）
- 証拠: agentdev_gh issue_create の failure JSON（kind: invalid-input、detail: required field labels is missing、retryable: true）。再試行で labels 指定により成功（Issue #3675）
- 関連手順: src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md 手順6、docs/designs/responsibilities/custom-tool-contracts.md（issue_create 操作契約）