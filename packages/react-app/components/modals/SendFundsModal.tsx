import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

import { Button } from '../ui/button';
import { Framework } from '@superfluid-finance/sdk-core';

interface employeeProps {
  id: number;
  employee: {
    owner: string;
    employee_name: string;
    address: string;
    payment_method: string;
    employee_salary: number;
    date: string;
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const SendFundsModal = ({ id, employee }: employeeProps) => {
  const [visible, setVisible] = useState(false);

  const [flowRateDisplay, setFlowRateDisplay] = useState('');
  const [flowRate, setFlowRate] = useState('');
  const [recipient, setRecipient] = useState(employee.address);

  async function createNewFlow(recipient: string, flowRate: string) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();

    const sf = await Framework.create({
      chainId: 42220,
      provider: provider,
    });
    const superSigner = sf.createSigner({ signer: signer });
    const cusdx = await sf.loadSuperToken('CUSDx');

    console.log(cusdx);

    try {
      const createFlowOperation = cusdx.createFlow({
        sender: await superSigner.getAddress(),
        receiver: recipient,
        flowRate: flowRate,
      });

      console.log(createFlowOperation);
      toast('Creating your stream...');

      const result = await createFlowOperation.exec(superSigner);
      console.log(result);

      toast.success(
        `Congrats - you've just created a money stream!
    `
      );
    } catch (error) {
      console.log('Error: ', error);
      toast.error(`Error: ${error}`);
    }
  }

  const handleFlowRateChange = (e: any) => {
    setFlowRate(() => ([e.target.name] = e.target.value));
    let newFlowRateDisplay = calculateFlowRate(e.target.value);
    if (newFlowRateDisplay) {
      setFlowRateDisplay(newFlowRateDisplay.toString());
    }
  };

  function calculateFlowRate(amount: any) {
    if (Number(amount) === 0) {
      return 0;
    }
    const amountInWei = ethers.BigNumber.from(amount);
    const monthlyAmount = ethers.utils.formatEther(amountInWei.toString());
    // @ts-ignore
    const calculatedFlowRate = monthlyAmount * 3600 * 24 * 30;
    return calculatedFlowRate;
  }

  return (
    <div>
      <button
        type='button'
        onClick={() => setVisible(true)}
        className='inline-block text-secondary font-medium text-md leading-tight rounded-[4px] shadow-md'
        Employee-bs-toggle='modal'
        Employee-bs-target='#exampleModalCenter'
      >
        <Button>Send funds</Button>
      </button>

      {/* Modal */}
      {visible && (
        <div
          className='fixed z-40 overflow-y-auto top-0 w-full left-0'
          id='modal'
        >
          <div className='flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
            <div className='fixed inset-0 transition-opacity'>
              <div className='absolute inset-0 bg-gray-900 opacity-75' />
            </div>
            <span className='hidden sm:inline-block sm:align-middle sm:h-screen'>
              &#8203;
            </span>
            <div
              className='inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'
              role='dialog'
              aria-modal='true'
              aria-labelledby='modal-headline'
            >
              <div>
                <h2 className='font-bold text-xl p-4'>
                  Stream Employee Salary in cUSD
                </h2>
                <div className='flex flex-col items-start p-4'>
                  <label className='py-2 text-neutral-500' htmlFor='recipient'>
                    Recipient Wallet Address
                  </label>
                  <input
                    value={recipient}
                    className='text-black mb-2 w-full'
                    name='recipient'
                  />
                  <label className='py-2 text-neutral-500' htmlFor='recipient'>
                    Enter a flowRate in wei/second
                  </label>

                  <input
                    value={flowRate}
                    onChange={handleFlowRateChange}
                    placeholder='Enter a flowRate in wei/second'
                    className='text-black rounded-md border-2 border-secondary py-2  px-2 w-3/4'
                  />
                  <Button
                    className='px-8 py-2 rounded-md text-white mt-4 hover:bg-[#0c7277]'
                    onClick={() => {
                      createNewFlow(recipient, flowRate);
                    }}
                    variant='secondary'
                  >
                    Click to Create Your Stream
                  </Button>
                  <a
                    className='mt-4 text-green-400'
                    href='https://app.superfluid.finance/'
                    target='_blank'
                    rel='no-opener'
                  >
                    View Superfluid Dashboard
                  </a>
                </div>
                <div className='border-green-400 border p-4 mt-3'>
                  <p>Your flow will be equal to:</p>
                  <p>
                    <b>${flowRateDisplay !== ' ' ? flowRateDisplay : 0}</b>{' '}
                    cusdx/month
                  </p>
                </div>
              </div>
              <div className='bg-gray-200 px-4 py-3 text-right'>
                <button
                  type='button'
                  className='py-2 px-4 bg-red-500 text-white rounded hover:bg-gray-700 mr-2'
                  onClick={() => setVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendFundsModal;
