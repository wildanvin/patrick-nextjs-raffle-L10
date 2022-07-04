import { useWeb3Contract } from 'react-moralis'
import { abi, contractAddresses } from '../constants'
import { useMoralis } from 'react-moralis'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useNotification } from 'web3uikit'

function LotteryEntrance() {
  // State hooks
  // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
  const [entranceFee, setEntranceFee] = useState('0')
  const [numberOfPlayers, setNumberOfPlayers] = useState('0')
  const [recentWinner, setRecentWinner] = useState('0')

  const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
  const chainId = parseInt(chainIdHex)

  const dispatch = useNotification()

  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null

  //console.log(chainId, raffleAddress)

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'enterRaffle',
    msgValue: entranceFee,
    params: {},
  })

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getEntranceFee',
    params: {},
  })

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getNumberOfPlayers',
    params: {},
  })

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: 'getRecentWinner',
    params: {},
  })

  async function updateUI() {
    const entranceFeeFromCall = await getEntranceFee()
    setEntranceFee(entranceFeeFromCall)
    const numPlayersFromCall = (await getNumberOfPlayers()).toString()
    setNumberOfPlayers(numPlayersFromCall)
    const recentWinnerFromCall = await getRecentWinner()
    setRecentWinner(recentWinnerFromCall)
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI()
    }
  }, [isWeb3Enabled])

  const handleSuccess = async (tx) => {
    await tx.wait(1)
    handleNewNotification(tx)
    updateUI()
  }

  const handleNewNotification = function () {
    dispatch({
      type: 'info',
      message: 'Transaction Complete!',
      title: 'Tx Notification',
      position: 'topR',
      icon: 'bell',
    })
  }

  return (
    <div className='p-5'>
      {raffleAddress ? (
        <div>
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto'
            onClick={async () => {
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className='animate-spin spinner-border h-8 w-8 border-b-2 rounded-full'></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
          <div>
            The entrance fee is:{' '}
            {ethers.utils.formatUnits(entranceFee, 'ether')} ETH
          </div>
          <div>Number of Players: {numberOfPlayers}</div>
          <div>Recent Winner: {recentWinner}</div>
        </div>
      ) : (
        <div>No address detected</div>
      )}
    </div>
  )
}

export default LotteryEntrance
