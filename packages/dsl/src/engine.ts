import { InsufficientDataError } from './error.js';
import type { BinaryExpression, Expression, FieldName, Value } from './model.js';

const SUPPORTED_TYPE_OPS: Record<string, string[]> = {
  string: ['=', '<>', '>', '<', '>=', '<='],
  number: ['=', '<>', '>', '<', '>=', '<='],
  boolean: ['=', '<>'],
  null: ['=', '<>'],
};

/**
 * Return
 *   - null: insufficient data (fast-fail if options.returnNullIfInsufficientData == true)
 *   - true:
 *   - false:
 */
export function evaluateExpression(
  expr: Expression,
  data: Record<string, Record<string, Value>>,
  options?: {
    returnNullIfInsufficientData?: boolean; // default: false 이길 원하지만 과제 요구사항이 true (로직에서 처리)
  },
): boolean | null {
  // AI Prompt: 최적화 해줘 (try, catch와 로직 분리에 대해 동의)
  try {
    return _evaluateExpression(expr, data);
  } catch (e: unknown) {
    if (
      e instanceof InsufficientDataError &&
      options?.returnNullIfInsufficientData !== false
    ) {
      return null;
    }
    throw e;
  }
}

function _evaluateExpression(
  expr: Expression,
  data: Record<string, Record<string, Value>>,
): boolean {
  // expr이 리스트가 아닌 단일 타입의 값이 될 때까지 재귀 호출 후 값 던지기
  if ('and' in expr) {
    return expr.and.every((e) => _evaluateExpression(e, data)); // AI Prompt: reduceUntil 가능해?
  }
  if ('or' in expr) {
    return expr.or.some((e) => _evaluateExpression(e, data)); // AI Prompt: reduceUntil 가능해?
  }

  // not 인 경우 재귀 호출 후 반전 값 던지기
  if ('not' in expr) {
    return !_evaluateExpression(expr.not, data);
  }

  // 여기부터 expr is BinaryExpression

  // left, right 추출하기
  const [fieldName, op, value] = expr;
  const left: Value = _extractFieldValue(data, fieldName);
  const right: Value =
    value !== null && typeof value === 'object'
      ? _extractFieldValue(data, value.ref)
      : value;

  return _op(left, op, right);
}

function _op(left: Value, op: BinaryExpression[1], right: Value): boolean {
  const leftType = left === null ? 'null' : typeof left;
  const rightType = right === null ? 'null' : typeof right;

  if (leftType !== rightType) {
    // TODO: Error type
    throw new Error(
      `Cannot operate with different types: left=${leftType}, op=${op}, right=${rightType}`,
    );
  }

  if (!(leftType in SUPPORTED_TYPE_OPS && SUPPORTED_TYPE_OPS[leftType]?.includes(op))) {
    // TODO: Error type
    throw new Error(`Unsupported type operation: type=${leftType}, op=${op}`);
  }

  switch (op) {
    case '=':
      return left === right;
    case '<>':
      return left !== right;
    case '>':
      return left === null || right === null ? false : left > right;
    case '<':
      return left === null || right === null ? false : left < right;
    case '>=':
      return left === null || right === null ? false : left >= right;
    case '<=':
      return left === null || right === null ? false : left <= right;
    default:
      // TODO: Error type
      throw new Error(`Unsupported operation(${op as any})`);
  }
}

function _extractFieldValue(
  data: Record<string, Record<string, Value>>,
  fieldName: FieldName,
): Value {
  const [field1, field2] = _splitFieldName(fieldName, 2) as [string, string];

  const value = data[field1]?.[field2]; // AI Prompt: 기억 안남 (python 사용 중이라 `?` 문법 까먹었음)
  if (value === undefined) {
    throw new InsufficientDataError(`Insufficient data: ${fieldName}`);
  }
  // TODO: Type check

  return value;
}

function _splitFieldName(fieldName: FieldName, depth: number = -1): string[] {
  const values = fieldName.split('.');
  if (depth !== -1 && values.length !== depth) {
    throw new Error(`fieldName depth must be ${depth} (got ${values.length})`);
  }
  return values;
}
