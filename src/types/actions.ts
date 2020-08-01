type Common<
  Kind extends string,
  Type extends string = string,
  Payload = undefined
> = {
  kind: Kind;
  type: Type;
} & (Payload extends undefined ? {} : { payload: Payload });

export type L0<T extends string = string, P = undefined> = Common<'L0', T, P>;
export type L1<T extends string = string, P = undefined> = Common<'L1', T, P>;
export type L2<T extends string = string, P = undefined> = Common<
  'L2',
  T,
  P
> & { id: string };
export type L3<T extends string = string, P = undefined> = Common<
  'L3',
  T,
  P
> & { id: string };
export type L4<T extends string = string, P = undefined> = Common<'L4', T, P>;

export type Core<T extends string = string, P = undefined> = Common<
  'Core',
  T,
  P
>;
export type Req<T extends string = string, P = undefined> = Common<
  'Req',
  T,
  P
> & { id: string };
