import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IExecDataProtector } from '@iexec/dataprotector';
import { IExec } from "iexec";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export async function getDataProtector(connector: any) {
  const web3Provider = await connector?.getProvider();
  if (!web3Provider) {
    throw new Error("Web3 provider is not available. Please connect your wallet.");
  }
  const dataProtector = new IExecDataProtector(web3Provider, {
    iexecOptions: {
      smsURL: "https://sms.labs.iex.ec",
    },
  });
  return dataProtector;
}
export async function getIexec(connector: any) {
  const iexec = new IExec({
    ethProvider: await connector?.getProvider()
  });
  return iexec;
}