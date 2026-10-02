// Guard environment for the distribution boundary guard (guard 共通判定の消費環境).
//
// 共通正本側が所有する guard 共通判定の消費環境（detector 設定、現行内容の
// 読取器、投影種別）を定義する。ホスト接続側（OpenCode plugin、Senpi 接続）は
// この環境を組んで evaluate* 関数へ渡す。本モジュールはホスト接続領域に依存せず
// host 非依存を保つ（マルチホスト正本モデル Design「guard 編集解釈の分離」節、
// 共通正本とホスト接続領域の分離の決定）。
//
// Inspection errors (read failure) are gate-not-passed, NOT clean, so the
// default readFile returns null on failure and the evaluators fail closed.

import {
  DEFAULT_DETECTOR_CONFIG,
  DEFAULT_REPOSITORY_IDENTITY,
  type DetectorConfig,
  type Projection,
  type RepositoryIdentity,
} from "../../../../.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts";
import * as fs from "fs";
import type { FileReader } from "./distribution-boundary-guard-reconstruction.ts";

export interface GuardEnv {
  readonly detector_config: DetectorConfig;
  readonly readFile: FileReader;
  readonly projection: Projection;
}

export interface MakeGuardEnvOptions {
  readonly repository_identity?: RepositoryIdentity;
  readonly producer_internal_id_prefixes?: readonly string[];
  readonly distributed_workflow_control_prefixes?: readonly string[];
  readonly readFile?: FileReader;
  projection?: Projection;
}

function defaultReadFile(path: string): string | null {
  try {
    return fs.readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

export function makeGuardEnv(opts: MakeGuardEnvOptions = {}): GuardEnv {
  const identity = opts.repository_identity ?? DEFAULT_REPOSITORY_IDENTITY;
  const producerPrefixes =
    opts.producer_internal_id_prefixes ??
    DEFAULT_DETECTOR_CONFIG.producer_internal_id_prefixes;
  const workflowPrefixes =
    opts.distributed_workflow_control_prefixes ??
    DEFAULT_DETECTOR_CONFIG.distributed_workflow_control_prefixes;
  return {
    detector_config: {
      repository_identity: identity,
      producer_internal_id_prefixes: producerPrefixes,
      distributed_workflow_control_prefixes: workflowPrefixes,
      producer_metadata_enforcement:
        DEFAULT_DETECTOR_CONFIG.producer_metadata_enforcement,
    },
    readFile: opts.readFile ?? defaultReadFile,
    projection: opts.projection ?? "source",
  };
}
