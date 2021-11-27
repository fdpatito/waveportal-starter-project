require('../App.scss');
const React = require('react');

const { useEffect, useState } = React;
const { ethers } = require('ethers');
const contractABI = require('../utils/WavePortal.json');
const { TextField, Button } = require('@mui/material');
const { Card, CardContent, CardActionArea, Typography } = require('@mui/material');

const WaveForm = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const [value, setValue] = useState('');

  const contractAddress = '0xb21f2DD333e4b5bcaE26e9849d62EdF9583bbA0D';

  const getAllWaves = async () => {
    try{
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);
        const waves = await wavePortalContract.getAllWaves();
        
        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.user,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
        * Store our data in React State
        */
        setAllWaves(wavesCleaned);
      } else {
        console.log('Ethereum object doesn\'t exist!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have Metamask!')
      } else {
        console.log('We have the ethereum object: ', ethereum)
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
     const accounts = await ethereum.request({ method: 'eth_accounts' });

     if (accounts.length !== 0) {
       const account = accounts[0];

       console.log('Found an authorized account: ', account);
       getAllWaves();
       setCurrentAccount(account);
     } else {
       console.log('No authorized account found');
     }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  /**
 * Listen in for emitter events!
 */
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);
      wavePortalContract.on('NewWave', onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  }, []);

    const connectWallet = async () => {
      try {
        const { ethereum } = window;

        if (!ethereum) {
          alert('Get Metamask!');
          return;
        }

        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected!', accounts[0]);
        setCurrentAccount(accounts[0]);
      } catch(error) {
        console.log(error);
      }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI.abi, signer);
        
        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        * What this does is make the user pay a set amount of gas of 300,000.
        * And, if they don't use all of it in the transaction they'll automatically be refunded.
        */

        const waveTxn = await wavePortalContract.wave(value, { gasLimit: 300000 })
        console.log('Mining...', waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        setValue('');
      } else {
        console.log('Ethereum object doesn\' exist');
      }
    } catch(error) {
      console.log(error);
    }
  }

  const handleChange = (event) => {
    setValue(event.target.value);
  };
  
  return (
    <>
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">
            Welcome to Dwitter!
          </div>
          <p className="text">The decentralized version of twitter</p>

          {
            !currentAccount && (
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
            )
          }

          <TextField
            id="outlined-textarea"
            label="What's happening?"
            placeholder="..."
            color="secondary"
            multiline
            onChange={handleChange}
            value={value}
            margin="normal"
            inputProps={{
              maxLength: 280
            }}
          />

          <Button
            className="button"
            size="small"
            variant="contained"
            color="secondary"
            onClick={wave}
            disabled={value === '' ? true : false}
          >
            Dweet
          </Button>

          {
            allWaves.reverse().map((dweet, index) => (
              <div key={index} className="dweets-container">
                <Card sx={{ height: 100 }}>
                  <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {dweet.message.toString()}
                        </Typography>
                        <div className="info-grid">
                        <Typography className="from" variant="body2" color="text.secondary">
                          {`From: ${dweet.address.toString().slice(0,6)}...${dweet.address.toString().slice(-4)}`}
                        </Typography>
                        <Typography className="date" variant="body2" color="text.secondary">
                          {dweet.timestamp.getDate()+
                            "/"+(dweet.timestamp.getMonth()+1)+
                            "/"+dweet.timestamp.getFullYear()
                          }
                        </Typography>
                      </div>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
}

module.exports = WaveForm;