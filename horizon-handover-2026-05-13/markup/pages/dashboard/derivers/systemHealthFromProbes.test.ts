import { describe, expect, it } from 'vitest';
import { systemHealthFromProbes } from './systemHealthFromProbes';
import type { EnvironmentProbeDto, ProbeStatus } from '../../environment/api';

function probe(status: ProbeStatus, name = 'test'): EnvironmentProbeDto {
  return {
    probeId: name,
    name,
    subtitle: '',
    status,
    statusSummary: '',
    lastChecked: '',
    details: [],
  };
}

describe('systemHealthFromProbes', () => {
  it('returns neutral / — when the probe set is empty', () => {
    expect(systemHealthFromProbes([])).toEqual({
      label: '—',
      summary: 'no probes registered',
      tone: 'neutral',
    });
  });

  it('returns neutral / — when undefined (still loading)', () => {
    expect(systemHealthFromProbes(undefined).tone).toBe('neutral');
  });

  it('reports HEALTHY when every probe is Ok', () => {
    const result = systemHealthFromProbes([probe('Ok'), probe('Ok'), probe('Ok')]);
    expect(result.tone).toBe('pass');
    expect(result.label).toBe('HEALTHY');
    expect(result.summary).toBe('all 3 probes ok');
  });

  it('reports DEGRADED amber when at least one probe is Degraded and none Down', () => {
    const result = systemHealthFromProbes([probe('Ok'), probe('Degraded'), probe('Ok')]);
    expect(result.tone).toBe('warn');
    expect(result.label).toBe('DEGRADED');
    expect(result.summary).toBe('1 of 3 degraded');
  });

  it('reports OFFLINE red when at least one probe is Down (regardless of Degraded)', () => {
    const result = systemHealthFromProbes([probe('Ok'), probe('Degraded'), probe('Down')]);
    expect(result.tone).toBe('fail');
    expect(result.label).toBe('OFFLINE');
    expect(result.summary).toBe('1 of 3 down');
  });

  it('stays PARTIAL / neutral when only some probes are configured (Ok + Unknown)', () => {
    // A mixed set with no failures but partial coverage shouldn't false-pass
    // as HEALTHY — the operator needs to know coverage isn't complete.
    const result = systemHealthFromProbes([probe('Ok'), probe('Ok'), probe('Unknown')]);
    expect(result.tone).toBe('neutral');
    expect(result.label).toBe('PARTIAL');
    expect(result.summary).toBe('2 ok · 1 not configured');
  });
});
