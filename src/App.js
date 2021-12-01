import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import { ethers } from 'ethers';
import myEpicNFT from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-zehao4ngww';
const TOTAL_MINT_COUNT = 50;


const CONTRACT_ADDRESS = "0x63185f4FeF3edfB519133d418c75220d8fc21652";

const App = () => {
  
  //  set local state to store users public wallet
  const [currentAccount, setCurrentAccount] = useState("")



  // make sure we have access to Ethereum network and Ethereum object
  // ie see if your browser wallet is connected to Metamask
  // make this async (look into why?)
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have Metamask");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    //  check if we're authorized to access users wallet.
    const accounts = await ethereum.request({ method: 'eth_accounts'})


    //  User can have multiple authorized accounts, we grab first one if it's there
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found authorized account", account);
      setCurrentAccount(account)

      // setup listner just in case the user was already loggedin to metamask
      // when they visit the site
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }




  //  connect wallet method
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert ("Get MetaMask!!!!");
        return;
      }

      //  Access Ethereum object and request the built in method
      const accounts = await ethereum.request({method: "eth_requestAccounts"})

      //  Print public address in console
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }


  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

        // capture the event/log message from smart contract object
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error)
    }
  }


  const askContractToMintNFT = async () => {
      try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

          console.log("Going to  pop wallet now to pay gas...")
          let nftTxn = await connectedContract.makeAnEpicNFT();

          console.log("Mining... please wait");
          await nftTxn.wait();

          console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

          } else {
            console.log("Ethereum object doesn't exist");
          }
        } catch (error) {
          console.log(error)
        }
      }
  


//  useEffect hook runs when the page loads
//  hook checks if your browser has access to Ethereum object (blockchain)

useEffect(() => {
  checkIfWalletIsConnected()
}, [])


  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  )



  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
