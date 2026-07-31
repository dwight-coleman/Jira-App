// Canonical domain types.
//
// A few names are declared in more than one module (e.g. both `common` and
// `provider` describe a `ProviderConfig`). `export *` cannot disambiguate those,
// so the owning module is re-exported explicitly below and the duplicates are
// excluded from the package's public surface. Import the non-owning variant
// directly from its module if you specifically need it.
export * from './types/ticket';
export * from './types/report';
export * from './types/user';

export type {
  // owned by ./types/ai
  AIProviderConfig,
} from './types/ai';
export * from './types/ai';

export type {
  // owned by ./types/provider
  ProviderConfig,
  ApplicationHealth,
} from './types/provider';
export * from './types/provider';

export * from './types/common';

// Zod validation schemas, namespaced. Each schema module also infers types from
// its own schemas that share names with the domain types above, so exporting
// them flat here would make every shared name ambiguous.
export * as ticketSchemas from './schemas/ticket';
export * as aiSchemas from './schemas/ai';
export * as reportSchemas from './schemas/report';
export * as userSchemas from './schemas/user';
