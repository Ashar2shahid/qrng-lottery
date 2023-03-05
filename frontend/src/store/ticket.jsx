import { prepareWriteContract, writeContract, waitForTransaction } from "@wagmi/core";
import { AirnodeRrpV0 } from "@api3/airnode-protocol";
import tokenContract from "../contracts/lottery.json";
import { ethers } from "ethers";
import { Decimal } from "decimal.js";

export const ticket = (set, get) => ({
  amount: 1,
  setAmount: (amount) => set((state) => ({ ...state, ticket: { ...state.ticket, amount } })),
  loadingContract: false,
  writeContract: async () => {
    const { amount } = get().ticket;
    const { selected } = get().numbers;
    const config = await prepareWriteContract({
      abi: tokenContract,
      address: "0x690B73FD0A7f922802C4E79f2465fd86C78b2Eee",
      functionName: "enter",
      args: [selected, amount],
      overrides: {
        value: ethers.utils.parseEther(Decimal(0.001).times(amount) + ""),
      },
    });
    set((state) => ({ ...state, ticket: { ...state.ticket, loadingContract: true } }));
    const { hash } = await writeContract(config);
    const { data } = await waitForTransaction({
      hash,
      confirmations: 1,
    });
    AirnodeRrpV0;
    set((state) => ({ ...state, ticket: { ...state.ticket, loadingContract: false } }));
    get().pot.readContract();
  },
});
