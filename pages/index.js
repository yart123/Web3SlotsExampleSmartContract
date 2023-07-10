import {useState, useEffect} from "react";
import {ethers} from "ethers";
import slots_abi from "../artifacts/contracts/Assessment.sol/Web3Slots.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [slots, setSlots] = useState(undefined);
  const [jackpot, setJackpot] = useState(undefined);
  const [pricePerSpin, setPricePerSpin] = useState(undefined);
  const [owner, setOwner] = useState(undefined);

  const slotsContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const slotsAbi = slots_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
      const account = await window.ethereum.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account[0]);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getSlotsContract();
  };

  const getSlotsContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const slotsContract = new ethers.Contract(slotsContractAddress, slotsAbi, signer);
    slotsContract.on("Spin", (playerAddress, spinResult, winnings) => {
      console.log("Player " + playerAddress + " spinned " + spinResult + " and thus won " + ethers.utils.parseEther(String(winnings)) + " ETH!");
    })
 
    setSlots(slotsContract);
  }

  const getJackpot = async() => {
    if (slots) {
      setJackpot(ethers.utils.formatEther(await slots.getJackpot()));
    }
  }

  const getPricePerSpin = async() => {
    if (slots) {
      setPricePerSpin(ethers.utils.formatEther(await slots.pricePerSpin()));
    }
  }

  const getOwner = async() => {
    if (slots) {
      setOwner((await slots.owner()));
    }
  }

  const spin = async() => {
    if (slots) {
      let tx = await slots.spin({ value: ethers.utils.parseEther("0.1") });
      await tx.wait()
      getJackpot();
    }
  }

  const withdrawHouseEarnings = async() => {
    if (slots) {
      let tx = await slots.withdrawHouseEarnings();
      await tx.wait()
      getJackpot();
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to play Web3 Slots game.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (!slots) {
      getSlotsContract();
    }

    if (jackpot == undefined) {
      getJackpot();
    }

    if (owner == undefined) {
      getOwner();
    }

    if (pricePerSpin == undefined) {
      getPricePerSpin();
    }

    let withdrawButton;
    if (account.toLowerCase() == owner?.toLowerCase()) {
      withdrawButton = <button onClick={withdrawHouseEarnings}>Withdraw your profit!</button>;
    } else {
      withdrawButton = "";
    }

    return (
      <div>
        <p>Your Account: {account} </p>
        <p>Price per spin: {pricePerSpin} </p>
        <p>You can win up to: {jackpot} ETH!</p>
        <button onClick={spin}>Spin!</button>
        {withdrawButton}
      </div>
    )
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to Iaro's Web3 Slot Machine!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}