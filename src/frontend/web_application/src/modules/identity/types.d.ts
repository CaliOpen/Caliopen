interface Infos {
  authType?: string;
  avatar?: string;
  errorsCount?: string;
  firstErrorDate?: string;
  lastErrorDate?: string;
  lastFetchError?: string;
  lastseendm?: string;
  lastsync?: string;
  mastodon_id?: string;
  pollinterval?: string;
  // mastodon|…
  provider?: string;
  url?: string;
}

export interface IIdentity {
  credentials?: Record<string, unknown>;
  display_name: string;
  identity_id: string;
  /** address or username */
  identifier: string;
  infos: Infos;
  last_check: string;
  // mastodon|…
  protocol: string;
  // active|…
  status: string;
  type: 'remote' | 'local';
}
