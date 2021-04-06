export type SendReturnResult = { result: any };
export type SendReturn = any;

export type Send = (method: string, params?: any[]) => Promise<SendReturnResult | SendReturn>;
export type SendOld = ({ method }: { method: string }) => Promise<SendReturnResult | SendReturn>;

interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

export type Request = (args: RequestArguments) => Promise<unknown>;
