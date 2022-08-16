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
import splash4 from './splash4.png'; // with import


const initialState = '';


const Home = () => {
	const [currentAccount, setCurrentAccount] = useState(initialState);
	const [network, setNetwork] = useState(initialState);
  const [records, setRecords] = useState([]);
  const [yourMints, setYourMints] = useState([]);
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
        const minted = await contract._svgIdCounter().then(a => a._hex).then(b => parseInt(b, 16));
        console.log(minted);
        const newRecords = [];
        const owned = [];
        for(let i = minted - 1; i >= 0; i--){
          
            const mintRecord = await contract.tokenURI(i);
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
            
            const owner = await contract.ownerOf(i);
            const decodedData = await base64.decode(item);
            const record = {
              id: i,
              location: decodedData,
              owner: owner
            }
            if(newRecords.length <= 2){
              newRecords.push(record);
            }
            
            const checkOwned = await contract.ownerOf(i);
            
            if(owner.toLowerCase() == currentAccount){
              if(owned.length <= 2){
              owned.push(record);
              }
            }
        }
        
        setRecords(newRecords);
        setYourMints(owned);
        console.log("Records FETCHED ", newRecords);
        console.log("Owned FETCHED ", owned);
       
			}
		} catch(error){
			console.log(error);
		}
		
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
      <img src={splash4} />
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
      
    </div>
    );

		const renderNotConnectedTitle = () => (
			<div className="connected-container">
						<p className="title">On-Chain Generative SVG NFTs</p>
						<br></br>
            <p className="subtitle">Connect your wallet to view or mint NFTs</p>
			</div>
			);


			const renderConnectedTitle = () => (
				<div className="connected-container">
							<p className="title">On-Chain Generative SVG NFTs</p>
							<br></br>
							<p className="subtitle">Explore recent mints or mint your own on-chain generative NFT</p>
              
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

        const renderMints = () => {
          if (currentAccount) {
            return (
              <div>
              <div className="mint-container">
                <p className="subtitle"> Recent Collection Mints:</p>
                <div className="mint-list">
                  { records.length > 0 ? records.map((mint, index) => {
                    return (
                      <div className = "mint-items">
                      <p><b>Owner: {mint.owner}</b></p>
                      <br></br>
                      <button className = "opensea"
                        onClick={() => window.open (`https://testnets.opensea.io/assets/mumbai/${'0xC09b911458c417eB96D1eF53F1300829115D3eEf'}/${mint.id}`, '_blank').focus()}
                        
                      >
                         
                      <div className="mint-item" key={index}>
                     
														<div className='mint-row'>
														<InlineSVG className = 'nft-image'src={mint.location} />
											</div>
													<div className='mint-row'>
														
															<p> Mint: {mint.id}</p>
														
														
													</div>
										
									</div></button></div>)
                }) :  <div className="connect-wallet-container2">
                <h2>Loading NFTs...</h2>
                
                <LoadingSpin className = 'centerspin'/> </div> }
              </div>
            </div>
            <div className="mint-container">
            <p className="subtitle"> Recent Mints Owned by You:</p>
            <div className="mint-list">
              { (yourMints.length > 0) ? yourMints.map((mint, index) => {
                return (
                  <div className = "mint-items">
                  <p><b>Owner: {mint.owner}</b></p>
                  <br></br>
                  <button className = "opensea"
                    onClick={() => window.open (`https://testnets.opensea.io/assets/mumbai/${'0xC09b911458c417eB96D1eF53F1300829115D3eEf'}/${mint.id}`, '_blank').focus()}
                    
                  >
                     
                  <div className="mint-item" key={index}>
                 
                        <div className='mint-row'>
                        <InlineSVG className = 'nft-image'src={mint.location} />
                  </div>
                      <div className='mint-row'>
                        
                          <p> Mint: {mint.id}</p>
                        
                        
                      </div>
                
              </div></button></div>)
            }) : <div><br></br><p>None minted by you</p></div>}
          </div>
        </div>
        </div>);
          }
        };
					
      
  

  return (
		<div className="App">
		<Helmet>
        <title>Generative SVG NFTs on Polygon Mumbai</title>
        <meta name="description" content="This NFT test project is a demonstration of how to produce verifiably random on-chain SVG NFTs." />
        
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
        {currentAccount && renderMints()}
        {currentAccount && (network !== 'Polygon Mumbai Testnet') && renderOptions()}
        
        <div className="footer-container">
        </div>
      </div>
    </div>
  );
};

export default Home;