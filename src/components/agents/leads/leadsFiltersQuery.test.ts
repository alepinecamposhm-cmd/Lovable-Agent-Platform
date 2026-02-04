import { describe, it, expect } from 'vitest';
import {
  formatTimeframeLabel,
  getDefaultLeadsQueryState,
  parseLeadsQuery,
  serializeLeadsQuery,
} from './leadsFiltersQuery';

describe('leadsFiltersQuery', () => {
  it('parses defaults when query is empty', () => {
    const { state, hadInvalid } = parseLeadsQuery(new URLSearchParams(''));
    expect(hadInvalid).toBe(false);
    expect(state.view).toBe('pipeline');
    expect(state.filters.stages).toBe('all');
    expect(state.filters.timeframe).toBe('all');
    expect(state.filters.preApproved).toBe('all');
    expect(state.filters.assignment.scope).toBe('mine');
  });

  it('parses view + advanced filters', () => {
    const sp = new URLSearchParams('view=crm&stage=new&stage=contacted&timeframe=0_3&preApproved=yes&assigned=team');
    const { state, hadInvalid } = parseLeadsQuery(sp);
    expect(hadInvalid).toBe(false);
    expect(state.view).toBe('crm');
    expect(state.filters.stages).toEqual(['new', 'contacted']);
    expect(state.filters.timeframe).toBe('0-3 months');
    expect(state.filters.preApproved).toBe('yes');
    expect(state.filters.assignment).toEqual({ scope: 'team' });
  });

  it('flags invalid values but keeps valid subset', () => {
    const sp = new URLSearchParams('stage=new,invalid&timeframe=bogus&assigned=agent:');
    const { state, hadInvalid } = parseLeadsQuery(sp);
    expect(hadInvalid).toBe(true);
    expect(state.filters.stages).toEqual(['new']);
    expect(state.filters.timeframe).toBe('all');
    expect(state.filters.assignment.scope).toBe('mine');
  });

  it('serializes defaults to empty query', () => {
    const sp = serializeLeadsQuery(getDefaultLeadsQueryState());
    expect(sp.toString()).toBe('');
  });

  it('formatTimeframeLabel localizes months suffix', () => {
    expect(formatTimeframeLabel('0-3 months')).toBe('0-3 meses');
    expect(formatTimeframeLabel('12+ months')).toBe('12+ meses');
  });
});

