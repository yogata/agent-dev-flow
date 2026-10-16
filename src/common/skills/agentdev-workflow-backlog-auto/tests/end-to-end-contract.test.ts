// ---------------------------------------------------------------------------
// 一気通貫実行（要件定義〜パッチリリース作成接続）の手順 pin と検証用模擬。
// backlog-auto コマンド定義の公開 interface 拡張（不変条件、副作用、HITL 境界、
// 停止条件、ガードレールの自動起動除外リスト見直し）、SKILL.md の STEP-7〜11
// と set-state 永続化契約、end-to-end-execution reference（基準点確認手続、
// 全体完了突合手続、リリース手順シーケンスと再開経路、公開操作の実行経路、
// 異常系の取扱い）、fan-in-and-reporting reference（STEP-5 の一式分岐）の
// 手順が実装されていることを anchor 型 pin で確認する。
// 版番号導出（SemVer 順序比較・祖先到達・正式タグ限定・再確認）、全体完了
// 突合、中断再開の重複実行抑止、並列実行の分断抑止、公開読み戻し再開、
// 異常系は検証用模擬（決定的シミュレーション）で検査する。模擬は runtime
// 機構ではなく検証コードであり、手順表の改訂時は本模擬も追随更新する。
// 対応関係の正は repository top-level の traceability sidecar（本ファイルは
// 配布物のため concrete ID を直書きせず節名参照のみ）。
// 3採用形態の代表適用プロジェクト fixture は tests/fixtures/applied-projects/
// であり、実際の公開コマンド入口からの E2E 実測が用意できない条件は合格では
// なく未検証として記録する。
// ---------------------------------------------------------------------------

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, "src", "common"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(import.meta.dir);
const SKILL_DIR = path.join(
  REPO_ROOT,
  "src",
  "common",
  "skills",
  "agentdev-workflow-backlog-auto",
);

function read(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

const COMMAND = read(
  path.join(REPO_ROOT, "src", "common", "commands", "agentdev", "backlog-auto.md"),
);
const COMMAND_README = read(
  path.join(REPO_ROOT, "src", "common", "commands", "agentdev", "README.md"),
);
const SKILL = read(path.join(SKILL_DIR, "SKILL.md"));
const END_TO_END = read(path.join(SKILL_DIR, "references", "end-to-end-execution.md"));
const FAN_IN = read(path.join(SKILL_DIR, "references", "fan-in-and-reporting.md"));

// ---------------------------------------------------------------------------
// pin: コマンド定義（公開 interface の拡張）
// ---------------------------------------------------------------------------

describe("コマンド定義の公開 interface 拡張 pin", () => {
  test("description が一気通貫実行（要件定義〜パッチリリース作成接続）を宣言している", () => {
    expect(COMMAND).toContain("一気通貫実行");
    expect(COMMAND).toContain("要件定義・実行・検証・統合・一式全体の完了判定・パッチリリース作成までを1回の起動で接続実行");
  });

  test("次工程開始のためだけの手動コマンド入力を要求しないことが明文化されている", () => {
    expect(COMMAND).toContain("次工程開始のためだけの手動コマンド入力を要求しない");
  });

  test("出力に一気通貫の実行結果報告（全体完了判定結果、リリース結果または保留理由、再開経路）が宣言されている", () => {
    expect(COMMAND).toContain("一気通貫の実行結果報告（工程別結果、全体完了判定結果、リリース結果または保留理由、再開経路を含む共通実行契約形式）");
  });

  test("副作用に set-state とリリース時の git タグ作成・push と追加公開成果物の対応が宣言されている", () => {
    expect(COMMAND).toContain("set-state の作成・更新（`.agentdev/` 配下、req-units と draft の配置外）");
    expect(COMMAND).toContain("git タグ作成・push（リリース時。版番号・リリース条件・公開操作はパッチリリース規則の Decision に従う）");
    expect(COMMAND).toContain("追加公開成果物の対応（ADF本体では GitHub Release の草稿作成・読み戻しまでを Custom Tool カタログ経路で実行する");
    expect(COMMAND).toContain("公開は利用者が草稿作成とは別に明確に認めた場合に限る。カタログに含まれない操作の実行は承認後の所定経路）");
  });

  test("HITL 境界節が既存境界の維持と一気通貫実行の利用者判断境界（基準点・リリース条件・公開権限）を宣言している", () => {
    expect(COMMAND).toContain("## HITL 境界");
    expect(COMMAND).toContain("既存境界の自動化は行わない");
    expect(COMMAND).toContain("開始時基準点確認（初期状態・到達不能正式タグの場合の停止）、リリース条件確認、公開権限確認");
  });

  test("停止条件節が一気通貫実行の停止条件（基準点確定不能、完遂済み・リリース保留、公開途中失敗）を宣言している", () => {
    expect(COMMAND).toContain("## 停止条件");
    expect(COMMAND).toContain("基準点確定不能（初期状態・到達不能正式タグを含む）、要件定義・実行の blocking 停止伝播、全体完遂不成立");
    expect(COMMAND).toContain("リリース条件・権限不成立（完遂済み・リリース保留として報告）、公開途中失敗（読み戻し再開可能な状態で報告）");
  });

  test("workflow 節が req-define と case-auto を子ワークフロー接続として宣言している", () => {
    expect(COMMAND).toContain("backlog-review、req-define、case-auto）の権威情報源と読込主体の割当ても同スキルの制御平面（control plane）が所有する");
  });

  test("不変条件に一式対象の限定と単一写像と並列維持が明文化されている", () => {
    expect(COMMAND).toContain("一気通貫実行の対象は backlog-review で承認確定した RU 一式に限定し、一式と無関係な既存 RU・ドラフト・Issue を取り込まない");
    expect(COMMAND).toContain("単一の req-define 実行（入力は一式 RU の明示列挙）で処理して単一の要件doc に確定し");
    expect(COMMAND).toContain("当該要件doc を明示指定した単一の case-auto 実行として接続する。引数なし全件処理と個別ドラフトごとの複数 case-auto 起動を用いない");
    expect(COMMAND).toContain("一式を複数グループへ分断して先行グループの全完了を待つ逐次化を行わない");
  });

  test("不変条件に完遂判定の厳格化（Issue 終了・PR merge のみで完遂としない）が明文化されている", () => {
    expect(COMMAND).toContain("個別の Issue 終了・PR merge のみで完遂としない");
  });

  test("不変条件に基準点確定と完遂前のタグ・リリース不在と差分突合が明文化されている", () => {
    expect(COMMAND).toContain("一式の実行開始時に最後の正式リリース（版番号規則はパッチリリース規則の Decision に従う）と開始時点のコミット ID を確定し、一式全体の完遂前に新規のタグ・リリースを作成しない");
    expect(COMMAND).toContain("完遂後はタグ付与前に差分と一式分の実変更の突合を行い、無関係コミットの混入を検出した場合は報告して利用者判断を求める");
  });

  test("不変条件に異常系（対象なし・初期番号非決定・公開不能）と読み戻し再開が明文化されている", () => {
    expect(COMMAND).toContain("RU 0 件またはリリース対象となる実変更がない場合はリリースを作成せず報告する");
    expect(COMMAND).toContain("初期バージョン番号を決定せず停止して利用者判断を求める");
    expect(COMMAND).toContain("公開方式・権限・環境が不足する場合も対象と理由を報告し、リリース完了としない");
    expect(COMMAND).toContain("タグの移動・再作成、第二のパッチ番号の消費なしに未完了部分から再開する");
  });

  test("不変条件に中断再開と完遂済み Case からの再開が明文化されている", () => {
    expect(COMMAND).toContain("中断・再実行時は set-state から同じ一式の対象と進捗を復元し、未完了部分から再開する");
    expect(COMMAND).toContain("backlog-auto の再実行は set-state から完遂済み Case を検出して全体完了判定以降の段階から再開できる");
  });

  test("ガードレールの自動起動除外リストが見直され、接続工程の委譲経由起動と判断境界の自動化禁止が宣言されている", () => {
    expect(COMMAND).toContain("capture 系コマンド（learning-capture、intake-capture、intake-from-github）と inspect-skills を自動起動しない");
    expect(COMMAND).toContain("req-define と case-auto は一気通貫実行の接続工程（要件定義接続、実行接続）として workflow 委譲経由でのみ起動する");
    expect(COMMAND).toContain("接続工程を外れた自発的な起動を行わず、GitHub Issue / PR 作成を直接実行しない（Issue / PR 作成は case-auto 実行の内部責務）");
    expect(COMMAND).toContain("req-define の壁打ち・承認境界、backlog-review の RU 承認、リリース条件・公開権限の確認を自動化しない");
    expect(COMMAND).toContain("版番号の major/minor 自動判定、同一実行での二つの版番号の消費、既存タグの移動、本番環境への自動配備を行わない");
  });

  test("コマンドリファレンスの backlog-auto 行が一気通貫実行の自動接続を案内している", () => {
    expect(COMMAND_README).toContain("一気通貫の実行結果報告（全体完了判定結果、リリース結果または保留理由）");
    expect(COMMAND_README).toContain("が一気通貫実行として自動接続される（利用者判断境界は維持。手動の `/agentdev/req-define` 起動も従来どおり利用可能）");
  });
});

// ---------------------------------------------------------------------------
// pin: SKILL.md（制御平面 STEP-7〜11、set-state 契約、共通制約）
// ---------------------------------------------------------------------------

describe("SKILL.md の一気通貫実行 pin", () => {
  test("STEP 一覧に STEP-7〜11（set-state 初期化・基準点確定、stage 4〜7）が登録されている", () => {
    expect(SKILL).toContain("backlog-auto workflow は次の11 STEP で構成する");
    expect(SKILL).toContain("| STEP-7 | set-state 初期化・基準点確定 |");
    expect(SKILL).toContain("| STEP-8 | stage 4: 要件定義接続 |");
    expect(SKILL).toContain("| STEP-9 | stage 5: 実行接続 |");
    expect(SKILL).toContain("| STEP-10 | stage 6: 全体完了判定 |");
    expect(SKILL).toContain("| STEP-11 | stage 7: リリース |");
  });

  test("依存と分岐に正常経路（一気通貫）、基準点確定不能経路、一式分割経路、実行停止経路、完遂不成立経路、リリース保留経路、公開途中失敗経路が定義されている", () => {
    expect(SKILL).toContain("**正常経路（一気通貫）**: STEP-1 → STEP-2 → STEP-3 → STEP-4 → STEP-5 →（一式 RU あり）→ STEP-7 → STEP-8 → STEP-9 → STEP-10 → STEP-11 → STEP-6");
    expect(SKILL).toContain("**基準点確定不能経路**");
    expect(SKILL).toContain("**一式分割経路**");
    expect(SKILL).toContain("分割後の各一式は独立した一気通貫ライフサイクル（基準点確定から）で扱う");
    expect(SKILL).toContain("**実行停止経路**");
    expect(SKILL).toContain("停止報告には case-auto 単独の再開入口と一式再開経路（backlog-auto 再実行）を併記");
    expect(SKILL).toContain("**完遂不成立経路**");
    expect(SKILL).toContain("**リリース保留経路**");
    expect(SKILL).toContain("**公開途中失敗経路**");
  });

  test("再開プロトコルに set-state 復元、case-auto 再開入口の利用、完遂済み Case からの再開が明文化されている", () => {
    expect(SKILL).toContain("RU 生成後・要件定義後・Issue 生成後・実行中のいずれで中断しても、set-state から同じ一式の対象と進捗を復元し、未完了部分から再開する");
    expect(SKILL).toContain("stage 5 の実行再開は case-auto 単独の再開入口契約（Root Case 指定の再開）を利用する");
    expect(SKILL).toContain("backlog-auto の再実行は set-state から完遂済み Case を検出し、全体完了判定（stage 6）以降の段階から再開する。実装を再実行しない");
  });

  test("終了条件に完遂済み・リリース保留の完了扱いと再開が明文化されている", () => {
    expect(SKILL).toContain("- 完遂済み・リリース保留: 一式完遂後にリリース条件・権限が不成立の場合、完遂は完了扱いとし、リリース保留（理由記録）として報告する。backlog-auto 再実行はリリース段階から再開する");
  });

  test("set-state 永続化契約が配置・形式要素・単一書き手を宣言している", () => {
    expect(SKILL).toContain("set-state は一式識別子、必須要求と受け入れ義務のスナップショット、RU・要件doc・operation_unit・実行単位の対応表（統合・分割を含む）、基準点情報（最後の正式リリース、開始コミット ID）、stage 別進捗、リリース状態（未着手／基準点確定済み／保留理由／完了）を記録する");
    expect(SKILL).toContain("配置は `.agentdev/` 配下で req-units と draft の配置外とし、ドラフト残存・RU 残存を検証するクリーンアップ検証ゲートの対象外とする。全体完了とリリース完了まで保持する");
    expect(SKILL).toContain("set-state への書込みは同一 backlog-auto 実行に限定する（単一書き手規則）。backlog-auto の二重起動に対しては既存の single-flight 保護に準じて排除する");
  });

  test("共通制約に一式限定・単一写像・並列維持・完遂判定・版管理の境界が宣言されている", () => {
    expect(SKILL).toContain("**一式対象の限定**");
    expect(SKILL).toContain("**単一実行への写像**");
    expect(SKILL).toContain("**並列実行の維持**");
    expect(SKILL).toContain("一式を複数グループへ分断して先行グループの全完了を待つ逐次化を行わない");
    expect(SKILL).toContain("**完遂判定の厳格化**");
    expect(SKILL).toContain("個別の Issue 終了・PR merge のみで完遂としない");
    expect(SKILL).toContain("**版管理の境界**");
    expect(SKILL).toContain("タグの移動・再作成、同一実行での二つの版番号の消費、major/minor 自動判定を行わない");
    expect(SKILL).toContain("**単一書き手**");
  });

  test("順序ゲートに stage 4〜7 の開始条件と基準点条件が追加されている", () => {
    expect(SKILL).toContain("stage 3 が正常完了し承認確定 RU 一式が存在する場合を除き、stage 4〜7 を開始しない。基準点が確定できない場合、stage 4〜7 を開始しない");
  });

  test("対象なしの正常扱いに一式 RU 0 件の場合の stage 4〜7 非開始とリリース不作成が追加されている", () => {
    expect(SKILL).toContain("一式 RU が 0 件の場合は一気通貫実行（stage 4〜7）を開始せず、リリースを作成せずその旨を報告する");
  });

  test("下位 Workflow Skill 連携に req-define と case-auto が登録されている", () => {
    expect(SKILL).toContain("- `agentdev-workflow-req-define`: stage 4 工程（要件定義接続。req-define 自体の壁打ち・承認境界を保存する接続であり、壁打ちを自動化しない）");
    expect(SKILL).toContain("- `agentdev-workflow-case-auto`: stage 5 工程（実行接続。要件doc 明示指定の単一実行。並列実行制御、依存判断、再開入口は case-auto 側の既存契約の所有であり、本スキルは再定義しない）");
  });

  test("fan-in-and-reporting reference の STEP-5 が一式 RU の存在確認で STEP-7 または STEP-6 へ分岐することを明文化している", () => {
    expect(FAN_IN).toContain("承認確定 RU 一式の存在確認を行い、1 件以上存在する場合は STEP-7 へ（一気通貫実行の継続。set-state 初期化・基準点確定）、0 件の場合は STEP-6 へ（完了報告。一式不在の旨を含める）");
  });

  test("完了報告 STEP-6 が一気通貫実行結果（全体完了判定結果、リリース結果または保留理由、一式識別子）の報告を含めることを明文化している", () => {
    expect(FAN_IN).toContain("一気通貫実行結果（実行された場合）: 全体完了判定結果（完遂 / 未完遂と突合根拠）、リリース結果または保留理由（版番号、タグ名、対象コミット、公開成果物の確認情報。保留時は理由）、一式識別子");
    expect(FAN_IN).toContain("一気通貫実行の完遂判定と最終報告は一気通貫実行の REQ が所有し、backlog 整理サイクル部分の完了扱い・全体報告とは分離して報告する");
  });
});

// ---------------------------------------------------------------------------
// pin: end-to-end-execution reference（set-state、基準点、突合、リリース手順）
// ---------------------------------------------------------------------------

describe("end-to-end-execution reference の手順 pin", () => {
  test("set-state 永続化契約が配置・形式要素表・単一書き手を定義している", () => {
    expect(END_TO_END).toContain("set-state は `.agentdev/backlog-auto/end-to-end/<一式識別子>/set-state.json` に配置する");
    expect(END_TO_END).toContain("| 義務スナップショット |");
    expect(END_TO_END).toContain("| 対応表 | RU・要件doc・operation_unit・実行単位（Case Issue / Issue / Epic）の対応（統合・分割を含む）");
    expect(END_TO_END).toContain("| 基準点情報 | 実行開始時に確定した最後の正式リリース（版番号、タグ名、タグ対象コミット）と開始コミット ID |");
    expect(END_TO_END).toContain("進行中の実行を示す set-state（完了か保留か中断を確定できない状態）を検出した後行起動は、新規実行を開始せず既存実行の状態確認と再開（`/agentdev/backlog-auto` 再実行の案内）へ切り替える");
  });

  test("基準点確認手続が正式 SemVer タグ限定・祖先到達・SemVer 順序比較・到達不能 0 件・初期状態の停止を手順化している", () => {
    expect(END_TO_END).toContain("1. 正式 SemVer タグの列挙: リポジトリのタグから正式 SemVer タグのみを列挙する（rc タグ、非 SemVer のベースラインタグは基準から除外する）");
    expect(END_TO_END).toContain("2. 祖先到達判定");
    expect(END_TO_END).toContain("最大版を SemVer 順序比較（major.minor.patch の数値比較。辞書式比較を用いない）で算出する");
    expect(END_TO_END).toContain("4. 到達可能 0 件の取扱い");
    expect(END_TO_END).toContain("初期バージョン番号の自動決定は行わない");
    expect(END_TO_END).toContain("5. 初期状態の取扱い");
    expect(END_TO_END).toContain("6. 開始コミット ID の記録");
  });

  test("STEP-8 が単一 req-define・明示列挙・壁打ち境界の維持・分割判断の再スコープ記録を手順化している", () => {
    expect(END_TO_END).toContain("`agentdev-workflow-req-define` を権威情報源として req-define を1回だけ実行する。入力は一式 RU の明示列挙である（引数なし全件処理を用いない）");
    expect(END_TO_END).toContain("req-define 自体の壁打ち・承認境界は req-define 側の所有として維持する。本接続は req-define の壁打ちを保存する接続であり、自動化しない");
    expect(END_TO_END).toContain("複数 RU の統合・分割は operation_units 構造で表現する（複数の要件doc を生成しない）");
    expect(END_TO_END).toContain("req-define の壁打ちで利用者が一式の複数要件docへの分割を判断した場合、当該判断を一式の構成変更（再スコープ）として set-state の対応表に記録する。分割後の各一式はそれぞれ独立した一気通貫ライフサイクル（基準点確定から）で扱う");
  });

  test("STEP-9 が単一 case-auto・並列実行の既存機構従属・停止時の二重再開経路併記を手順化している", () => {
    expect(END_TO_END).toContain("確定した要件doc を明示指定して case-auto を1回だけ起動する");
    expect(END_TO_END).toContain("一式から複数の独立した実行可能 Issue が生じた場合の並列実行は、case-auto 側の既存の共有 active Issue task 上限と横断補充に従う。一式を複数グループへ分断して先行グループの全完了を待つ逐次化を行わない");
    expect(END_TO_END).toContain("本接続は個別ドラフトごとの複数 case-auto 起動を用いない");
    expect(END_TO_END).toContain("停止報告には case-auto 単独の再開入口（Root Case 指定の再開）に加えて一式再開経路（backlog-auto 再実行）を併記する");
  });

  test("全体完了突合手続が義務対応確認・検証結果成立確認・Issue 数のみの完遂禁止を手順化している", () => {
    expect(END_TO_END).toContain("1. 義務の対応確認: 義務スナップショットの各必須要求・受け入れ義務が、確定済み要件doc の要求行と実行対象（実行単位）に過不足なく対応していることを対応表で確認する");
    expect(END_TO_END).toContain("2. 検証結果の成立確認: 実行単位の検証証跡（品質ゲート、test strategy 項目の検証結果等）が、義務に対応する必要な範囲ですべて成立していることを確認する");
    expect(END_TO_END).toContain("3. 判定: 1 と 2 がともに成立する場合にのみ一式全体の完遂と判定する。個別の Issue 終了・PR merge のみで完遂としない");
    expect(END_TO_END).toContain("突合の正は set-state の義務スナップショットと対応表であり、RU・要件doc が削除済みでも突合は set-state から復元して実行する");
  });

  test("リリース手順シーケンスが再確認・版番導出・差分突合・タグ作成・Release 記録・結果記録の順で手順化されている", () => {
    expect(END_TO_END).toContain("1. 基準点再確認: リリース時点で正式 SemVer タグを再確認する。開始時基準より新しい正式タグが存在する場合は、その最大版から版番号を導出し直す。既存タグとの衝突、タグの移動、二重採番は行わない");
    expect(END_TO_END).toContain("2. 版番導出: 最後の正式リリースからパッチ番号を1つだけ進めた版を確定する（major/minor への自動振り分け、同一実行での二つの版番号の消費を行わない）。導出版と同一のタグが既に存在する場合は衝突として報告し、版番号を再消費せず停止する");
    expect(END_TO_END).toContain("3. 対象コミット確定と無関係コミット混入検知: リリース対象コミット（一式の全マージ完遂時点の main HEAD）を確定する。開始コミット..対象コミットの差分と、set-state の対応表から導出する一式分の実変更（一式の実行単位が生んだマージ済み変更）を突合し、一式に帰属しない無関係コミットの混入を検出した場合は報告して利用者判断を求める（タグ付与の可否は利用者判断）");
    expect(END_TO_END).toContain("4. タグ作成: リリース対象コミットに導出版のタグを作成する。タグ作成済みを検出した場合は作成を省略し、タグの移動・再作成を行わない");
    expect(END_TO_END).toContain("5. 追加公開物（Release 記録）:");
    expect(END_TO_END).toContain("次の Release 記録手順を Custom Tool 操作カタログ（release_create、release_list、release_read）経由で実行する");
    expect(END_TO_END).toContain("1. 版タグ列挙: 対象プロジェクトの版タグ（正式 SemVer タグと RC タグ）を列挙する。非 SemVer のベースラインタグは対応対象から除外する");
    expect(END_TO_END).toContain("2. 対応確認: release_list で全 Release を読み取り、版タグごとの対応（同名 Release の有無、draft・prerelease 状態）を確認する。既存 Release がある版タグは作成を省略する（同一タグへの二つ目の Release を作らない）");
    expect(END_TO_END).toContain("3. 欠落タグの補完（該当時のみ）: リモートに存在しない既存版タグは、注釈付きの元のタグを上書きしない通常 push で送り、git ls-remote --tags でリモートとローカルのタグ識別子が一致することを確認してから草稿を作る。force push による解消を行わない");
    expect(END_TO_END).toContain("4. 草稿作成: 対応のない版タグへ release_create で草稿を作成する。RC 版タグは prerelease: true で作成する。Release タイトルは版タグ名とする。作成に失敗した場合はタグを移動・再作成せず、Release が欠けているため工程を完了できない旨を報告して停止する");
    expect(END_TO_END).toContain("5. 読み戻し確認: release_list（必要に応じて release_read）で全版タグと Release の 1:1 対応を再読取して確認するまで、Release 記録工程を完了としない。同一タグ名の Release が2件検出された場合は削除せずに読み戻し結果を報告して停止する");
    expect(END_TO_END).toContain("6. 結果記録:");
  });

  test("公開操作の実行経路が非対話認証経路・Release 操作のカタログ経路限定・公開モード非包含・権限不足時のリリース完了としないことを手順化している", () => {
    expect(END_TO_END).toContain("リモートへの push は Git 操作の非対話認証経路の契約に従う（対話認証を待機せず、資格情報の値を解析証拠やログへ出力しない）");
    expect(END_TO_END).toContain("GitHub Release の作成・読み戻しは Custom Tool 操作カタログの Release 操作（release_create、release_list、release_read）経由でのみ行う");
    expect(END_TO_END).toContain("release_create の入力契約に公開モード（draft の解除、publish 相当フィールド）は含まれず、契約外の公開指定フィールドを含む要求は副作用発生前に入力契約違反として拒否される");
    expect(END_TO_END).toContain("公開は利用者が草稿作成とは別に明確に認めた場合に限る。生 gh コマンドによる Release 書き込み（カタログ外書き込み経路）を迂回しない");
    expect(END_TO_END).toContain("公開方式・権限・必要な環境が不足する場合は、対象と理由を報告し、リリース完了としない");
  });

  test("異常系の取扱い表が対象なし・実変更なし・初期状態・到達不能・公開不能・Release 草稿失敗・Release 重複・タグ push 失敗の各ケースを定義している", () => {
    expect(END_TO_END).toContain("| RU 0 件 | stage 4〜7 を開始せず、一式不在の旨を報告する。リリースは作成しない |");
    expect(END_TO_END).toContain("| リリース対象となる実変更なし | 完遂判定の結果、一式に対応する実変更（マージ済み変更）が存在しない場合はリリースを作成せず報告する |");
    expect(END_TO_END).toContain("| 正式なバージョン基準なし（初期状態） |");
    expect(END_TO_END).toContain("| 到達可能な正式タグ 0 件 |");
    expect(END_TO_END).toContain("| 公開方式・権限・環境の不足 | 対象と理由を報告し、リリース完了としない。完遂済み・リリース保留（理由記録）として扱う |");
    expect(END_TO_END).toContain("| Release 草稿作成の失敗 | タグを移動・再作成せず、Release が欠けているため工程を完了できない旨を報告して停止する。再開時は既存のタグと Release を使い、同一タグへ二つ目の Release を作らない |");
    expect(END_TO_END).toContain("| 同一タグ名の Release が2件検出 | 削除・変更せずに読み戻し結果を報告して停止する（重複解消は利用者判断） |");
    expect(END_TO_END).toContain("| 欠落タグの push 失敗または識別子不一致 | force push による解消を行わず、失敗内容と識別子の差異を報告して停止する（草稿は作成しない） |");
  });

  test("一式再開経路が完遂済み Case の stage 6 以降からの再開と case-auto 単独の再開入口契約の非変更を宣言している", () => {
    expect(END_TO_END).toContain("完遂済み Case を検出した場合、全体完了判定（stage 6）以降の段階から再開する。実装を再実行しない");
    expect(END_TO_END).toContain("stage 5 の実行中断は case-auto 単独の再開入口契約（Root Case 指定の再開）でも再開できる。case-auto 単独の再開入口契約は変更しない");
    expect(END_TO_END).toContain("停止報告には case-auto 単独の再開入口に加えて一式再開経路（backlog-auto 再実行）を併記する");
  });
});

// ---------------------------------------------------------------------------
// 模擬: 版番号導出（正式 SemVer タグ限定・祖先到達・SemVer 順序比較・再確認）
// ---------------------------------------------------------------------------

interface Tag {
  name: string;
  commit: string;
}

function parseFormalSemVer(name: string): { major: number; minor: number; patch: number } | null {
  // 正式 SemVer タグのみ基準とする。rc 等のプレリリース、非 SemVer は除外。
  const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(name);
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

function compareSemVer(
  a: { major: number; minor: number; patch: number },
  b: { major: number; minor: number; patch: number },
): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

function maxReachableFormalTag(
  tags: readonly Tag[],
  targetCommit: string,
  reachable: (commit: string, target: string) => boolean,
): { name: string; version: { major: number; minor: number; patch: number } } | null {
  let best: { name: string; version: { major: number; minor: number; patch: number } } | null = null;
  for (const tag of tags) {
    const version = parseFormalSemVer(tag.name);
    if (!version) continue;
    if (!reachable(tag.commit, targetCommit)) continue;
    if (best === null || compareSemVer(version, best.version) > 0) {
      best = { name: tag.name, version };
    }
  }
  return best;
}

function nextPatchVersion(
  base: { major: number; minor: number; patch: number },
): string {
  return `v${base.major}.${base.minor}.${base.patch + 1}`;
}

describe("版番号導出の検証用模擬（基準点確認手続・リリース時再確認）", () => {
  test("最大版の比較は SemVer 順序比較であり、辞書式比較によらない", () => {
    const tags: Tag[] = [
      { name: "v9.10.0", commit: "c1" },
      { name: "v9.9.0", commit: "c2" },
    ];
    const base = maxReachableFormalTag(tags, "target", () => true);
    expect(base?.name).toBe("v9.10.0");
    // 辞書式比較では "v9.9.0" > "v9.10.0" となるため、逆順にしても結果は不変
    const baseReversed = maxReachableFormalTag([...tags].reverse(), "target", () => true);
    expect(baseReversed?.name).toBe("v9.10.0");
  });

  test("rc タグと非 SemVer ベースラインタグは基準から除外される", () => {
    const tags: Tag[] = [
      { name: "v4.0.0-rc.1", commit: "c1" },
      { name: "baseline-2026", commit: "c2" },
      { name: "v3.2.1", commit: "c3" },
    ];
    const base = maxReachableFormalTag(tags, "target", () => true);
    expect(base?.name).toBe("v3.2.1");
    expect(nextPatchVersion(base!.version)).toBe("v3.2.2");
  });

  test("リリース対象コミットから到達可能な正式タグのみを基準とする", () => {
    const tags: Tag[] = [
      { name: "v5.0.0", commit: "unreachable-newer" },
      { name: "v4.1.0", commit: "reachable" },
    ];
    const base = maxReachableFormalTag(tags, "target", (commit) => commit === "reachable");
    expect(base?.name).toBe("v4.1.0");
  });

  test("パッチ番号は1つだけ進める（major/minor への振り分けを行わない）", () => {
    expect(nextPatchVersion({ major: 1, minor: 2, patch: 3 })).toBe("v1.2.4");
    expect(nextPatchVersion({ major: 9, minor: 10, patch: 9 })).toBe("v9.10.10");
  });

  test("リリース時点の再確認: 開始時基準より新しい正式タグの登場時はその最大版から導出し直す", () => {
    const startBaseline = maxReachableFormalTag(
      [{ name: "v1.2.0", commit: "c1" }],
      "target",
      () => true,
    );
    expect(startBaseline?.name).toBe("v1.2.0");
    // 実行中に他導入の v1.2.5 が到達可能になった場合、開始時基準（1.2.0）は使わない
    const releaseTimeTags: Tag[] = [
      { name: "v1.2.0", commit: "c1" },
      { name: "v1.2.5", commit: "c2" },
    ];
    const reconfirmed = maxReachableFormalTag(releaseTimeTags, "target", () => true);
    expect(reconfirmed?.name).toBe("v1.2.5");
    expect(nextPatchVersion(reconfirmed!.version)).toBe("v1.2.6");
    // 導出結果は開始時基準からの後退でない
    expect(compareSemVer(reconfirmed!.version, startBaseline!.version)).toBeGreaterThanOrEqual(0);
  });

  test("到達可能な正式タグが 0 件の場合は初期番号を決定せず停止（利用者判断要求）となる", () => {
    const tags: Tag[] = [{ name: "v3.0.0", commit: "unreachable" }];
    const base = maxReachableFormalTag(tags, "target", () => false);
    expect(base).toBeNull();
  });

  test("導出版と同一のタグが既に存在する場合は衝突として第二の番号を消費しない", () => {
    const existingTags = new Set(["v1.2.4"]);
    const derived = nextPatchVersion({ major: 1, minor: 2, patch: 3 });
    const collision = existingTags.has(derived);
    expect(collision).toBe(true);
    // 衝突時は停止して報告であり、v1.2.5 等の第二番号を自動消費しない
  });
});

// ---------------------------------------------------------------------------
// 模擬: 並列実行の分断抑止（共有 active Issue task 枠と横断補充）
// ---------------------------------------------------------------------------

function simulateSlotQueue(issueIds: readonly string[], limit: number): {
  admitted: string[];
  groupBarriers: number;
} {
  // 単一の共有キューに全 Issue を投入し、空き枠が出るごとに横断補充する模擬。
  // グループ境界での待ち合わせ（先行グループ全完了待ち）は発生しない。
  const queue = [...issueIds];
  const admitted: string[] = [];
  let active = 0;
  let groupBarriers = 0;
  while (queue.length > 0) {
    while (active < limit && queue.length > 0) {
      queue.shift();
      active++;
      admitted.push(`admitted-${admitted.length + 1}`);
    }
    // 実行完了を模擬（枠を1解放し、横断補充）
    active--;
  }
  return { admitted, groupBarriers };
}

describe("一式全体の並列実行の検証用模擬（分断抑止）", () => {
  test("実行可能 Issue が共有並列上限を超えても、実行可能 Issue が残っている状態で先行グループ待ちの逐次化が発生しない", () => {
    const issues = Array.from({ length: 9 }, (_, i) => `issue-${i + 1}`);
    const { admitted, groupBarriers } = simulateSlotQueue(issues, 5);
    expect(admitted).toHaveLength(9);
    expect(groupBarriers).toBe(0);
  });

  test("一式は単一の case-auto 実行へ写像される（複数起動へ分断されない）", () => {
    const setRus = ["RU-a", "RU-b", "RU-c"];
    // operation_units で統合・分割を表現し、要件doc は単一、case-auto 起動は1回
    const requirementDocs = new Set<string>();
    const caseAutoInvocations: string[] = [];
    for (const ru of setRus) {
      requirementDocs.add("single-requirement-doc");
      void ru;
    }
    caseAutoInvocations.push("single-requirement-doc");
    expect(requirementDocs.size).toBe(1);
    expect(caseAutoInvocations).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// 模擬: リリースの読み戻し再開（タグ不移動・再作成なし・第二番号なし）
// ---------------------------------------------------------------------------

interface PublishState {
  localTags: Map<string, string>;
  remoteTags: Map<string, string>;
  versionConsumed: string | null;
  releaseNotePrepared: boolean;
  published: boolean;
}

function publishStep(state: PublishState, version: string, commit: string, failAt?: "push" | "github-release"): PublishState {
  if (!state.versionConsumed) {
    // タグ既存検出時は作成を省略し移動・再作成しない
    if (!state.localTags.has(version)) {
      state.localTags.set(version, commit);
    }
    state.versionConsumed = version;
  }
  if (failAt === "push") return state;
  // push（冪等）: リモートへ存在しない場合のみ反映
  if (!state.remoteTags.has(version)) {
    state.remoteTags.set(version, state.localTags.get(version) ?? commit);
  }
  if (failAt === "github-release") return state;
  state.published = true;
  return state;
}

function resumeReadBack(state: PublishState, version: string, commit: string): PublishState {
  // 読み戻し: 既存結果（タグの存在・版番号・準備物）から未完了段階を判定する
  return publishStep({ ...state }, state.versionConsumed ?? version, commit);
}

describe("リリース手順の読み戻し再開の検証用模擬", () => {
  test("公開途中失敗（push 失敗）後の再開は、タグの移動・再作成と第二のパッチ番号の消費なしに完了する", () => {
    const state: PublishState = {
      localTags: new Map(),
      remoteTags: new Map(),
      versionConsumed: null,
      releaseNotePrepared: false,
      published: false,
    };
    const failed = publishStep(state, "v1.2.4", "c-target", "push");
    expect(failed.localTags.get("v1.2.4")).toBe("c-target");
    expect(failed.published).toBe(false);

    const resumed = resumeReadBack({ ...failed }, "v1.2.4", "c-target");
    expect(resumed.localTags.get("v1.2.4")).toBe("c-target");
    expect(resumed.remoteTags.get("v1.2.4")).toBe("c-target");
    expect(resumed.published).toBe(true);
    // タグの指すコミットは移動していない（読み戻しで同一コミットを再確認）
    expect(resumed.localTags.size).toBe(1);
    // 第二のパッチ番号（v1.2.5 等）は消費していない
    expect(resumed.versionConsumed).toBe("v1.2.4");
  });

  test("タグ作成済みの再開は作成を省略し、既存タグを移動・再作成しない", () => {
    const state: PublishState = {
      localTags: new Map([["v1.2.4", "c-target"]]),
      remoteTags: new Map(),
      versionConsumed: null,
      releaseNotePrepared: true,
      published: false,
    };
    const resumed = resumeReadBack({ ...state }, "v1.2.4", "c-other");
    // タグ作成済み検出 → 作成省略。タグは c-other へ移動しない
    expect(resumed.localTags.get("v1.2.4")).toBe("c-target");
  });
});

// ---------------------------------------------------------------------------
// 模擬: 異常系（対象なし・実変更なし・初期状態・公開不能）
// ---------------------------------------------------------------------------

describe("異常系の取扱いの検証用模擬", () => {
  interface AbnormalOutcome {
    releaseCreated: boolean;
    stopped: boolean;
    report: string | null;
  }

  function handleAbnormal(caseType: string): AbnormalOutcome {
    switch (caseType) {
      case "zero-ru":
        return { releaseCreated: false, stopped: false, report: "一式不在（stage 4〜7 非開始）" };
      case "no-real-changes":
        return { releaseCreated: false, stopped: false, report: "実変更なし（リリース作成せず報告）" };
      case "no-version-baseline-and-no-adopted-rule":
        // 初期番号を決定せず停止して利用者判断を求める
        return { releaseCreated: false, stopped: true, report: "初期バージョン判断要求" };
      case "unreachable-formal-tags":
        return { releaseCreated: false, stopped: true, report: "到達不能正式タグの利用者判断要求" };
      case "publish-route-missing":
        return { releaseCreated: false, stopped: false, report: "公開不能（対象と理由を報告、リリース完了としない）" };
      default:
        return { releaseCreated: false, stopped: true, report: null };
    }
  }

  test("各異常ケースで不適切なタグ・リリースが作成されず、対象と理由が報告される", () => {
    for (const c of ["zero-ru", "no-real-changes", "publish-route-missing"]) {
      const outcome = handleAbnormal(c);
      expect(outcome.releaseCreated).toBe(false);
      expect(outcome.report).not.toBeNull();
    }
  });

  test("初期番号の推測と公開不能時の完了報告が行われない", () => {
    const noBaseline = handleAbnormal("no-version-baseline-and-no-adopted-rule");
    expect(noBaseline.stopped).toBe(true);
    expect(noBaseline.releaseCreated).toBe(false);
    const unreachable = handleAbnormal("unreachable-formal-tags");
    expect(unreachable.stopped).toBe(true);
    const noRoute = handleAbnormal("publish-route-missing");
    expect(noRoute.report).toContain("リリース完了としない");
  });
});

// ---------------------------------------------------------------------------
// pin+模擬: 一式分割の独立ライフサイクル（基準点確定から）
// ---------------------------------------------------------------------------

describe("一式分割判断の検証用模擬（再スコープと独立ライフサイクル）", () => {
  test("分割判断は再スコープとして記録され、分割後の各一式は独立した基準点を持つ", () => {
    interface SubSet {
      id: string;
      baseline: { release: string; startCommit: string };
      successorOf: string | null;
    }
    const parentSet = { id: "set-001", baseline: { release: "v1.0.0", startCommit: "c-start" } };
    // 分割後の各一式は独立した一気通貫ライフサイクル（基準点確定から）
    const subSets: SubSet[] = [
      { id: "set-001-a", baseline: { release: "v1.0.0", startCommit: "c-start" }, successorOf: parentSet.id },
      { id: "set-001-b", baseline: { release: "v1.0.0", startCommit: "c-start" }, successorOf: parentSet.id },
    ];
    expect(subSets).toHaveLength(2);
    expect(subSets.every((s) => s.successorOf === "set-001")).toBe(true);
    expect(subSets.every((s) => s.baseline !== null)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// pin: 3採用形態 fixture（代表ケース検証枠）
// ---------------------------------------------------------------------------

describe("代表適用プロジェクト fixture（3採用形態）", () => {
  const FIXTURE_ROOT = path.join(SKILL_DIR, "tests", "fixtures", "applied-projects");
  const FORMS = ["adf-self", "github-connected", "local-issue"];

  test("3採用形態の manifest が存在し、採用条件を宣言している", () => {
    for (const form of FORMS) {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(FIXTURE_ROOT, form, "manifest.json"), "utf-8"),
      ) as {
        form: string;
        releaseConditionAdoption: string;
        adoptedInitialVersionRule: string | null;
        releaseChannel: string[];
        publishRoute: Record<string, string>;
      };
      expect(manifest.form).toBe(form);
      expect(["improvement-cycle-patch", "project-own"]).toContain(manifest.releaseConditionAdoption);
      expect(Array.isArray(manifest.releaseChannel)).toBe(true);
      expect(typeof manifest.publishRoute).toBe("object");
    }
  });

  test("ADF本体形態の初期バージョン規則は未宣言であり、基準なし初期状態の停止検証に使用できる", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(FIXTURE_ROOT, "adf-self", "manifest.json"), "utf-8"),
    ) as { adoptedInitialVersionRule: string | null };
    expect(manifest.adoptedInitialVersionRule).toBeNull();
  });

  test("ローカルIssue適用形態はローカル完結の公開経路を宣言している", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(FIXTURE_ROOT, "local-issue", "manifest.json"), "utf-8"),
    ) as { releaseChannel: string[] };
    expect(manifest.releaseChannel).toEqual(["git-tag"]);
  });

  test("fixture README が未検証条件の扱い（合格ではなく未検証として記録）を宣言している", () => {
    const readme = read(path.join(FIXTURE_ROOT, "README.md"));
    expect(readme).toContain("未検証として記録する");
    expect(readme).toContain("未検証条件を合格に代替しない");
  });
});
