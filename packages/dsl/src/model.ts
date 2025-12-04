export interface Policy {
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  permissions: string[];
  applyFilter: Expression;
  requiredData?: string[];
}

export type BinaryExpression = [
  FieldName,
  '=' | '<>' | '>' | '<' | '>=' | '<=',
  Value | { ref: FieldName },
];

export type Expression =
  | BinaryExpression
  | { and: Expression[] }
  | { or: Expression[] }
  | { not: Expression };

/** e.g. document.deletedAt, user.id, etc */
export type FieldName = string;
export type Value = string | number | boolean | null;
