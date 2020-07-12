import { actions as coreActions } from "../../../types";

export namespace actions {
  export const SEND = "SEND";
  export type SendAction = coreActions.Req<typeof SEND>;
  export function send(id: string = ''): SendAction {
    return {
      kind: 'Req',
      type: SEND,
      id
    };
  }

  export type All = SendAction;
}