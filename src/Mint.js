import React, { useEffect, useState } from "react";
import './App.css';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';
import { Helmet } from 'react-helmet';
import { useNavigate} from 'react-router-dom';
import {ethers} from "ethers";
import abi from "./components/abi.json";
import InlineSVG from 'svg-inline-react';
import LoadingSpin from "react-loading-spin";



const initialState = '';


const Mint = () => {
	const [currentAccount, setCurrentAccount] = useState(initialState);
	const [network, setNetwork] = useState(initialState);
  const [showMint, setShowMint] = useState(initialState);
  const [txSuccess, setTx] = useState(initialState);
  const [eligible, setEligible] = useState(initialState);
  const [success, setSuccess] = useState(initialState);
  const [minting, setMinting] = useState(initialState);
  const [minted, setMinted] = useState(initialState);
  const [transaction, setTransactionProcess] = useState(initialState);
  const [recentMint, setRecentMint] = useState([]);
	const navigate = useNavigate();
  
  
  const connectWallet = async () => {
    
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
	
	const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    // Users can have multiple authorized accounts, we grab the first one if its there!
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }

		const chainId = await ethereum.request({ method: 'eth_chainId' });
    setNetwork(networks[chainId]);
    ethereum.on('chainChanged', handleChainChanged);
    // Reload the page when they change networks
    function handleChainChanged(_chainId) {
      window.location.reload();
    }
  };

   // This runs our function when the page loads.
   useEffect(() => {
        
    checkIfWalletIsConnected();
    
}, [])

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the Mumbai testnet
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
				});
			} catch (error) {
				// This error code means that the chain we want has not been added to MetaMask
				// In this case we ask the user to add it to their MetaMask
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{	
									chainId: '8001',
									chainName: 'Polygon Mumbai Testnet',
									rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
									nativeCurrency: {
											name: "Mumbai Matic",
											symbol: "MATIC",
											decimals: 18
									},
									blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
								},
							],
						});
					} catch (error) {
						console.log(error);
					}
				}
				console.log(error);
			}
		} else {
			// If window.ethereum is not found then MetaMask is not installed
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
		} 
	}

  const fetchMints = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				// You know all this
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
        var base64 = require('base-64');
				const contract = new ethers.Contract('0xC09b911458c417eB96D1eF53F1300829115D3eEf', abi, signer);
				console.log(contract);
        const status = await contract.s_requestIdToAddress(currentAccount);
        console.log(status);
        if(status > 0){
          setEligible(true);
        }
            }
        }

        
        
		 catch(error){
       
			console.log(error);
		}
		
	}

  const requestRandom = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				// You know all this
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
        var base64 = require('base-64');
				const contract = new ethers.Contract('0xC09b911458c417eB96D1eF53F1300829115D3eEf', abi, signer);
				console.log(contract);
        setTransactionProcess(true);
        let tx = await contract.requestRandomWords();
        const receipt = await tx.wait();

        if (receipt.status === 1) {
          setSuccess(true);
					console.log("Dice rolled! https://mumbai.polygonscan.com/tx/"+tx.hash);
					console.log(tx.hash);
					
          

          contract.on("DiceLanded", (requestId, result) => {
            console.log("Result is: ", result);
            //setTx(result);
            doThis();
          })

          async function doThis(){
            setEligible(true);
        }
       
			} else{
        setTransactionProcess(false);
					alert("Transaction failed! Please try again");
      }
    }
		} catch(error){
			console.log(error);
		}
		
	}

  const mintNFT = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				// You know all this
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
        var base64 = require('base-64');
				const contract = new ethers.Contract('0xC09b911458c417eB96D1eF53F1300829115D3eEf', abi, signer);
				console.log(contract);
        setMinting(true);
        let tx = await contract.createNFT();
        const receipt = await tx.wait();
        const owned = [];

        if (receipt.status === 1) {
					console.log("NFT Minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
					console.log(receipt);
					contract.on("Transfer", (from, to, tokenId) => {
            console.log("New token is: ", tokenId);
            doThis(tokenId);
          async function doThis(tokenId){
            const mintRecord = await contract.tokenURI(tokenId);
            
            async function check(url){
              const dest = 
              await fetch(url)
              .then(response => response.text())
              .then(data => JSON.parse(data))
              .then(response => response.image)
              .then(response => response.toString())
              .then(response => response.split(','))
              .then(response => response[1]);
              return dest;
            }
            let item = await check(mintRecord);
            
            const owner = await contract.ownerOf(tokenId);
            const decodedData = await base64.decode(item);
            const record = {
              id: tokenId,
              location: decodedData,
              owner: owner
            }
            console.log(record);
            owned.push(record);
            console.log(owned);
            setRecentMint(owned);
        }
        console.log(recentMint);
        setMinted(true);
      })
        }
			} else{
        setMinting(false);
					alert("Transaction failed! Please try again");
      }
    
		} catch(error){
			console.log(error);
		}
		
	}

  const view = async () => {
    console.log(recentMint[0].location);
    setShowMint(true)
  }

  const clearView = async () => {
    
    setShowMint(initialState);
    setRecentMint([]);
    setMinted(initialState);
    setMinting(initialState);
    setSuccess(initialState);
    setEligible(initialState);
    setTransactionProcess(initialState);
    
  }

	// This will run any time currentAccount or network are changed
	useEffect(() => {
		if (network === 'Polygon Mumbai Testnet') {
			fetchMints();
		}
	}, [currentAccount, network]);

 
  

  // Create a function to render if wallet is not connected yet
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
    </div>
    );

		const renderNotConnectedTitle = () => (
			<div className="connected-container">
						<p className="title">Mint a Generative SVG NFT</p>
						<br></br>
            <p className="subtitle">Connect your wallet to view or mint NFTs</p>
			</div>
			);


			const renderConnectedTitle = () => (
				<div className="connected-container">
							<p className="title">Mint a Generative SVG NFT</p>
							<br></br>
							<p className="subtitle">Visit our about page to learn more about the minting process</p>
              
				</div>
				);

        const renderOptions = () =>{
      
      
          
            return (
              <div className="connect-wallet-container">
                <h2>Please switch to Polygon Mumbai Testnet</h2>
            <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
              </div>
            );
          

        }

        const renderRandom = () => {
          if(transaction){
            if(success){
              return(
                <div className="connect-wallet-container2">
            <h2>Assigning Randomness to Your Address...</h2>
            <h3>Please be patient - this step could take 1-2 minutes</h3>
            <LoadingSpin className = 'centerspin'/>
          </div>
              )
              
            }
            if(!success){
              return(
                <div className="connect-wallet-container2">
                <h2>Setting Up Randomness...</h2>
                <LoadingSpin className = 'centerspin'/>
                </div>
              )
            }
            
          }
          if (!transaction) {
            return (
              <div className="mint-container">
                <p className="subtitle"> First Step: </p>
               <br></br>
                <button onClick={requestRandom} className='cta-two '>
                Request Randomness
                </button>
              
            </div>);
          }
        };

        const renderCreateNFT = () => {
          
          if (!minting) {
            return (
              <div className="mint-container">
                <p className="subtitle"> Second Step: </p>
               <br></br>
                <button onClick={mintNFT} className='cta-two'>
                Mint NFT
                </button>
              
            </div>);
          }
          if(minting){
            return(
              <div className="connect-wallet-container2">
          <h2>Minting NFT...</h2>
          <LoadingSpin className = 'centerspin'/>
          </div>
            )
            
          }
         
        };

        const renderSuccessMessage = () => {
          
          
              return(
                <div>
              <div className="mint-container">
                <p className="subtitle"> Mint Successful! </p>
                <br></br>
                <button onClick={view} className='cta-two '>
                View Minted SVG NFT
                </button>
                </div>
                </div>
                )
        };

        const viewMint = () => {
          
          
          return(
            <div>
              <div className="mint-container">
  
                <div className="mint-list">
                      <div className = "mint-items">
                      <p><b>Owner: You! </b></p>
                      
                      <br></br>
                      <button className = "opensea"
                        onClick={() => window.open (`https://testnets.opensea.io/assets/mumbai/${'0xC09b911458c417eB96D1eF53F1300829115D3eEf'}/${recentMint[0].id}`, '_blank').focus()}
                        
                      >
                         
                      <div className="mint-item" >
                     
														<div className='mint-row'>
														<InlineSVG className = 'nft-image'src={recentMint[0].location} />
											</div>
													<div className='mint-row'>
                          
													</div>
										
									</div>
                  </button>
                  </div>
                
              </div>
            </div>
            <button className='cta-button mint-button' onClick={clearView}>Go Back</button>
            </div>
            )
    };
					
      
 

  return (
		<div className="App">
		<Helmet>
        <title>Mint a Generative SVG NFT on Polygon Mumbai</title>
        <meta name="description" content="Connect your wallet to take part in the minting process yourself!" />
        
      </Helmet>
      <div className="container">
        <div className="header-container">
        <header>
           
           <div className="right">
             <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
             { currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
           </div>
         </header>
				<div >
            {!currentAccount && renderNotConnectedTitle()}
            {currentAccount && renderConnectedTitle()}
            </div>
        </div>
       
				{!currentAccount && renderNotConnectedContainer()}
        {currentAccount && (network !== 'Polygon Mumbai Testnet') && renderOptions()}
        {currentAccount && !eligible && renderRandom()}
        {currentAccount && eligible && !minted && renderCreateNFT()}
        {currentAccount && minted && !showMint && renderSuccessMessage()}
        {showMint && viewMint()}
        <div className="footer-container">
        </div>
      </div>
    </div>
  );
};

export default Mint;