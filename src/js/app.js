const SS_YELD_MATIC_ADDRESS = "0xdD650C8d274474FF1af1152B3B27f2702AcA8a98"
const WS_FISH_MATIC_ADDRESS = "0x44825bf3b74695bd72ed247d62dd755e67b7ed87"
const WETH_ADDRESS = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
const WMATIC_ADDRESS = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"

const QUICKSWAP_ROUTER = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"
const SUSHISWAP_ROUTER = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
const WAULT_ROUTER = "0x3a1D87f206D12415f5b0A33E786967680AAb4f6d"

const MATIC_USD_ORACLE = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
const BTC_USD_ORACLE = "0xc907E116054Ad103354f2D350FD2514433D57F6f"
const ETH_USD_ORACLE = "0xF9680D99D6C9589e2a93a78A04A279e509205945"

var contract;
var user;
var total_in_usd;
/*****************************************/
/* Detect the MetaMask Ethereum provider */
/*****************************************/

// import detectEthereumProvider from '@metamask/detect-provider';

// this returns the provider, or null if it wasn't detected
// const provider = await detectEthereumProvider();
const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()

// const confirmSwapButton = document.getElementById('confirmSwap');
// const confirmApprovalButton = document.getElementById('confirmApprove')

if (provider) {
  startApp(provider); // Initialize your app
} else {
  console.log('Please install MetaMask!');
}

function startApp(provider) {
  // If the provider returned by detectEthereumProvider is not the same as
  // window.ethereum, something is overwriting it, perhaps another wallet.
  if (provider !== window.ethereum) {
    console.error('Do you have multiple wallets installed?');
  }
  //Basic Actions Section
  // const onboardButton = document.getElementById('connectButton'); - come back to this later - for checking if metamask installed
  // const getAccountsButton = document.getElementById('getAccounts');
  const displayLPinfoButton = document.getElementById('displayLPinfo');
  // const getUSDBalancesButton = document.getElementById('getUSDBalances');
  // const rebalanceButton = document.getElementById('rebalance');

  // const getAccountsResult = document.getElementById('getAccountsResult');
  // const getBalanceResult = document.getElementById('getBalanceResult');

  var total_supply_LP;
  var reserves;

  var exchangeRate;
  var total_pool_value;

  //Eth_Accounts-getAccountsButton
  // getAccountsButton.addEventListener('click', async () => {
  //   //we use eth_accounts because it returns a list of addresses owned by us.
  //   const accounts = await ethereum.request({ method: 'eth_accounts' });
  //   user = accounts[0]; //should I declare this here or lower down as current account?
  //   //We take the first address in the array of addresses and display it
  //   getAccountsResult.innerHTML = user || 'Not able to get accounts';
  // });

  displayLPinfoButton.addEventListener('click', async () => {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    user = accounts[0]; //should I declare this here or lower down as current account?
    // balance = await provider.getBalance(user); //returns a BigNumber
    // console.log(balance.toString());

    var LP_contract = $("#LPcontract").val()
    var my_LP_tokens = $("#LPtokens").val()

    var token_addresses = await getTokenAddresses(LP_contract);
    var token0_symbol = await getTokenSymbol(token_addresses[0]);
    var token1_symbol = await getTokenSymbol(token_addresses[1]);
    var token0_decimals = await getDecimals(token_addresses[0]);
    var token1_decimals = await getDecimals(token_addresses[1]);
    var pair_decimals = await getDecimals(LP_contract);

    console.log(token0_symbol);

    LP_name.innerHTML = `${token0_symbol}-${token1_symbol}`;

    reserves = await getReserves(LP_contract);
    console.log(reserves)
    Reserves_token0.innerHTML = `${parseFloat(ethers.utils.formatUnits(reserves[0], token0_decimals)).toFixed(4)} ${token0_symbol}` || 'Not able to get accounts'; //what if reserves undefined?
    Reserves_token1.innerHTML = `${parseFloat(ethers.utils.formatUnits(reserves[1], token1_decimals)).toFixed(4)} ${token1_symbol}` || 'Not able to get accounts';

    total_supply_LP = await getTotalSupply(LP_contract);
    console.log(total_supply_LP)
    totalSupplyLP.innerHTML = `${parseFloat(ethers.utils.formatUnits(total_supply_LP, pair_decimals)).toFixed(6)} LP tokens` || 'Not able to get accounts';

    bignumber0 = ethers.utils.parseUnits("1.0", token0_decimals);
    bignumber1 = ethers.utils.parseUnits("1.0", token1_decimals);
    // bignumber2 = ethers.utils.parseUnits("1.0", token0_decimals);

    exchangeRate = reserves[0].div(bignumber0) / reserves[1].div(bignumber1)
    displayExchangeRate.innerHTML = `1 ${token1_symbol} = ${exchangeRate.toFixed(2)} ${token0_symbol}` || 'Not able to get accounts';
    
    bignumber0 = ethers.utils.parseUnits("1.0", token0_decimals);
    bignumber1 = ethers.utils.parseUnits("1.0", token1_decimals);
    // bignumber2 = ethers.utils.parseUnits("1.0", token0_decimals);

    if (token0_symbol === "USDC"  || token0_symbol === "USDT" || token0_symbol === "DAI") {
      usd_rate = 1;
      total_pool_value = reserves[0].div(bignumber0) *usd_rate *2;
    } 
    else if (token1_symbol === "USDC"  || token1_symbol === "USDT" || token1_symbol === "DAI") {
      usd_rate = 1;
      total_pool_value = reserves[1].div(bignumber1) *usd_rate *2;
    } 
    else if (token0_symbol === "WMATIC" || token0_symbol === "MATIC") {
      usd_rate = await getExchangeRate(MATIC_USD_ORACLE);
      usd_rate = (usd_rate.toNumber())/10**8;
      total_pool_value = reserves[0].div(bignumber0) *usd_rate *2;
    } 
    else if (token0_symbol === "WBTC" || token0_symbol === "BTC") {
      usd_rate = await getExchangeRate(BTC_USD_ORACLE);
      usd_rate = (usd_rate.toNumber())/10**8;
      total_pool_value = reserves[0].div(bignumber0) *usd_rate *2;;
    } 
    else if (token0_symbol === "WETH" || token0_symbol === "ETH") {
      usd_rate = await getExchangeRate(ETH_USD_ORACLE);
      usd_rate = (usd_rate.toNumber())/10**8;
      total_pool_value = reserves[0].div(bignumber0) *usd_rate *2;
    } 
    else if (token1_symbol === "WMATIC" || token1_symbol === "MATIC") {
      usd_rate = await getExchangeRate(MATIC_USD_ORACLE);
      usd_rate = (usd_rate.toNumber())/10**8;
      total_pool_value = reserves[1].div(bignumber1) *usd_rate *2;
    } 
    else if (token1_symbol === "WBTC" || token1_symbol === "BTC") {
      usd_rate = await getExchangeRate(BTC_USD_ORACLE);
      usd_rate = (usd_rate.toNumber())/10**8;
      total_pool_value = reserves[1].div(bignumber1) *usd_rate *2;
    } 
    else if (token1_symbol === "WETH" || token1_symbol === "ETH") {
      usd_rate = await getExchangeRate(ETH_USD_ORACLE);
      usd_rate = (usd_rate.toNumber())/10**8;
      total_pool_value = reserves[1].div(bignumber1) *usd_rate *2;
    }
    TOTALInUsd.innerHTML = `$ ${ethers.utils.commify(parseFloat(total_pool_value).toFixed(2))}` || 'Not able to get accounts'
    
    $("#ourButton").click(function(){ 
      var my_LP_tokens = $("#LPtokens").val();    
      });

    var my_share = my_LP_tokens*10**18/total_supply_LP*total_pool_value;
    myshareInUsd.innerHTML = `$ ${ethers.utils.commify(parseFloat(my_share).toFixed(2))}`;

  });

//   getUSDBalancesButton.addEventListener('click', async () => {
//     matic_usd_rate = await getExchangeRate(MATIC_USD_ORACLE) //assume for now matic = wmatic 1:1
//     _wmatic_in_usd = reserves * matic_usd_rate
//     WMATICInUsd.innerHTML = _wmatic_in_usd.toFixed(2) || 'Not able to get accounts';

//     wbtc_usd_rate = await getExchangeRate(BTC_USD_ORACLE)
//     _wbtc_in_usd = wbtc_bal * wbtc_usd_rate
//     WBTCInUsd.innerHTML = _wbtc_in_usd.toFixed(2) || 'Not able to get accounts'

//     eth_usd_rate = await getExchangeRate(ETH_USD_ORACLE)
//     _weth_in_usd = weth_bal * eth_usd_rate
//     WETHInUsd.innerHTML = _weth_in_usd.toFixed(2) || 'Not able to get accounts'


//   })

//   rebalanceButton.addEventListener('click', async () => {
//     var no_of_assets = 4;
//     var target_per_asset = total_in_usd / no_of_assets;
//     // console.log(target_per_asset)

//     function Coin(symbol, address, decimals, balance, usd_balance, diff_from_average, usd_exchange_rate) { //in JS we create an object type by using a constructor function
//       this.symbol = symbol;
//       this.address = address;
//       this.decimals = decimals;
//       this.balance = balance;
//       this.usd_balance = usd_balance;
//       this.diff_from_average = diff_from_average;
//       this.usd_exchange_rate = usd_exchange_rate;
//     }
//     // calculate how far each coin is from the average USD value
//     var diff_wmatic = _wmatic_in_usd - target_per_asset
//     var diff_wbtc = _wbtc_in_usd - target_per_asset
//     var diff_weth = _weth_in_usd - target_per_asset
//     var diff_usdc = total_supply_LP - target_per_asset

//     var usdc_decimals = await getDecimals(USDC_ADDRESS)
//     var wmatic_decimals = await getDecimals(WMATIC_ADDRESS)
//     var wbtc_decimals = await getDecimals(WBTC_ADDRESS)
//     var weth_decimals = await getDecimals(WETH_ADDRESS)

//     //create a coin object for each of our 4 assets - NOTE have to fix MATIC somehow...
//     var USDC = new Coin("USDC", USDC_ADDRESS, usdc_decimals, total_supply_LP, total_supply_LP, diff_usdc, usdc_usd_rate);
//     var WMATIC = new Coin("WMATIC", WMATIC_ADDRESS, wmatic_decimals, reserves, _wmatic_in_usd, diff_wmatic, matic_usd_rate); //this one will have to be different somehow
//     var WBTC = new Coin("WBTC", WBTC_ADDRESS, wbtc_decimals, wbtc_bal, _wbtc_in_usd, diff_wbtc, wbtc_usd_rate);
//     var WETH = new Coin("WETH", WETH_ADDRESS, weth_decimals, weth_bal, _weth_in_usd, diff_weth, eth_usd_rate);

//     //put our 4 coin objects into an array
//     array_coins = [USDC, WMATIC, WBTC, WETH];

//     //sort the coins by how far they are from the average
//     array_coins.sort((a, b) => {
//       return b.diff_from_average - a.diff_from_average;
//     });

//     // get the inputs for the swaps, perform the swaps, update the array each time

//     startSwap(array_coins);

//     // var tokenContract = new ethers.Contract(inputs[2][0], abi, signer);
//     // var filter = tokenContract.filters.Transfer(null, user);
//     // tokenContract.once(filter, async (owner, spender, value, event) => {
//     //   console.log('Swap 1 done');
//     //   startSwap(array_coins)
//     // })

//   })
// }

// async function startSwap(array_coins) {
//   var inputs = getSwapInputs(array_coins); //balances 1 coin to the portfolio dollar average, and returns the remaining coins as an array
//   console.log(inputs);

//   //find out what router is approved to spend for this user (if anything)
//   var approvedAmount = await allowance(inputs[2][0], SUSHISWAP_ROUTER) //input token and router addresses
//   console.log(approvedAmount)

//   //if not, must approve it:
//   if (approvedAmount.lt(inputs[0])) { //less than
//     console.log('need to get approval');
//     //ask user to confirm asking for approval
//     if (window.confirm("Time to get approval!")) {
//       //ask for approval
//       var approved = await giveApproval(inputs[2][0], SUSHISWAP_ROUTER, inputs[0]); //token_address, router_address, amountIn
//       //create a listener for the approval confirmation
//       var tokenContract = new ethers.Contract(inputs[2][0], abi, signer);
//       var filter = tokenContract.filters.Approval(user, null);
//       tokenContract.once(filter, async (owner, spender, value, event) => {
//         console.log('Tokens approved');
//         if (window.confirm("Time to do the swap!")) {
//           //perform the swap
//           var swap_result = await swap(inputs[0], inputs[1], inputs[2], user, Date.now() + 1111111111111);
//           if (swap_result) { //I could modify this to listen for tx confirmation?
//             array_coins = updateArray(array_coins);
//           }
//         };
//       })
//     }
//   } else {
//     //if approval already exists, go straight to the swap
//     console.log('we got here!')
//     if (confirm("Time to do the swap!")) {
//       //perform the swap
//       var swap_result = await swap(inputs[0], inputs[1], inputs[2], user, Date.now() + 1111111111111);
//       if (swap_result) { //I could modify this to listen for tx confirmation?
//         array_coins = updateArray(array_coins);
//       }
//     }
//   }
// }

/**********************************************************/
/* Handle chain (network) and chainChanged (per EIP-1193) */
/**********************************************************/

// const chainId = await ethereum.request({ method: 'eth_chainId' });
// handleChainChanged(chainId);

// ethereum.on('chainChanged', handleChainChanged);

// function handleChainChanged(_chainId) {
//   // We recommend reloading the page, unless you must do otherwise
//   window.location.reload();
// }

/***********************************************************/
/* Handle user accounts and accountsChanged (per EIP-1193) */
/***********************************************************/

let currentAccount = null;
ethereum
  .request({ method: 'eth_accounts' })
  .then(handleAccountsChanged)
  .catch((err) => {
    // Some unexpected error.
    // For backwards compatibility reasons, if no accounts are available,
    // eth_accounts will return an empty array.
    console.error(err);
  });

// Note that this event is emitted on page load.
// If the array of accounts is non-empty, you're already
// connected.
ethereum.on('accountsChanged', handleAccountsChanged);

// For now, 'eth_accounts' will continue to always return an array
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.');
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    // console.log(currentAccount.balanceOf()) - I tried this here, didn't work - what CAN I do here?
  }
}

/*********************************************/
/* Access the user's accounts (per EIP-1102) */
/*********************************************/

// // You should only attempt to request the user's accounts in response to user
// // interaction, such as a button click.
// // Otherwise, you popup-spam the user like it's 1999.
// // If you fail to retrieve the user's account(s), you should encourage the user
// // to initiate the attempt.
document.getElementById('connectButton', connect);

// While you are awaiting the call to eth_requestAccounts, you should disable
// any buttons the user can click to initiate the request.
// MetaMask will reject any additional requests while the first is still
// pending.
function connect() {
  ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.');
      } else {
        console.error(err);
      }
    });
}
$(document).ready(function () { //when the document loads
  window.ethereum.enable().then(function (accounts) { //this should cause a metamask popup
    // instance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]}); //creates an instance of the smart contract we want to interact with
    // user = accounts[0];
    // var accounts = web3.eth.getAccounts(); //this gets a list of the accounts in the Metamask wallet
    // console.log(accounts)
    // web3.eth.getBalance(user).then(console.log); //Get the balance of an address at a given block
    // console.log(instance);

  }) //call metamask enable function
})

// async function getBalance(token_address) {
//   // create a new instance of a contract - in web3.js >1.0.0, will have to use "new web3.eth.Contract" (uppercase C)
//   var tokenContract = new ethers.Contract(token_address, abi, signer)
//   // get the balance of our user in that token
//   try {
//     var tokenBalance = await tokenContract.balanceOf(user);
//     var decimals = await tokenContract.decimals();
//     tokenBalance = tokenBalance / (10 ** decimals)
//     return tokenBalance;
//   } catch (error) {
//     console.log(error)
//   }
// }

async function getTotalSupply(pair_address) {
  // create a new instance of a contract - in web3.js >1.0.0, will have to use "new web3.eth.Contract" (uppercase C)
  var pairContract = new ethers.Contract(pair_address, pair_abi, signer)
  // get the balance of our user in that token
  try {
    var totalSupply = await pairContract.totalSupply();
    return totalSupply;
  } catch (error) {
    console.log(error)
  }
}

async function getReserves(pair_address) {
  // create a new instance of a contract - in web3.js >1.0.0, will have to use "new web3.eth.Contract" (uppercase C)
  var pairContract = new ethers.Contract(pair_address, pair_abi, signer)
  // get the balance of our user in that token
  try {
    var Reserves = await pairContract.getReserves();
    return Reserves;
  } catch (error) {
    console.log(error)
  }
}

async function getTokenAddresses(pair_address) {
  // create a new instance of a contract - in web3.js >1.0.0, will have to use "new web3.eth.Contract" (uppercase C)
  var pairContract = new ethers.Contract(pair_address, pair_abi, signer)
  // get the balance of our user in that token
  try {
    var token0_address = await pairContract.token0();
    var token1_address = await pairContract.token1();
    return [token0_address, token1_address];
  } catch (error) {
    console.log(error)
  }
}

async function getTokenSymbol(token_address) {
  // create a new instance of a contract - in web3.js >1.0.0, will have to use "new web3.eth.Contract" (uppercase C)
  var tokenContract = new ethers.Contract(token_address, abi, signer)
  // get the balance of our user in that token
  try {
    var token_symbol = await tokenContract.symbol();
    return token_symbol;
  } catch (error) {
    console.log(error)
  }
}

async function getExchangeRate(oracle_address) {
  var oracle = new ethers.Contract(oracle_address, CHAINLINK_ORACLE_ABI, provider);
  try {
    var exchangeRate = await oracle.latestAnswer();
    return exchangeRate; //note - sometimes the output needs to be divided by number of decimals!
  } catch (error) {
    console.log(error);
  }
}

async function getDecimals(token_address) {
  var tokenContract = new ethers.Contract(token_address, abi, provider)
  // check how many decimals that token has
  try {
    var decimals = await tokenContract.decimals();//need to catch an error here - perhaps make this it's own function!
    return decimals;
  } catch (error) {
    console.log(error);
  }
}

// async function allowance(token_address, router_address) {
//   // create a new instance of a contract
//   var tokenContract = new ethers.Contract(token_address, abi, signer)
//   // check what amount of user's tokens the spender is approved to use
//   try {
//     var approvedAmount = await tokenContract.allowance(user, router_address); //allowance(owner_address, spender_address)
//     return approvedAmount;
//   } catch (error) {
//     console.log(error)
//   }
// }

// async function giveApproval(token_address, router_address, amountIn) {
//   // create a new instance of a contract
//   var tokenContract = new ethers.Contract(token_address, abi, signer)
//   // give router_address approval to spend user's tokens
//   try {
//     var approved = await tokenContract.approve(router_address, amountIn); //approve(spender, amount)
//     return approved;

//   } catch (error) {
//     console.log(error)
//   }
// }

// async function approvalConfirmed() {
//   var approvalconfirmed = await tokenContract.once("Approval", (owner, spender, value, event) => {
//     console.log('Tokens approved');
//   }

// function getSwapInputs(array_coins) {
//   if (array_coins[0].diff_from_average > Math.abs(array_coins[array_coins.length - 1].diff_from_average)) { //check which coin is further from the dollar average

//     var swap_path = [array_coins[0].address, array_coins[array_coins.length - 1].address] //swap from first array item to last

//     var amountIn = Math.abs(array_coins[array_coins.length - 1].diff_from_average) * (1 / (array_coins[0].usd_exchange_rate)) //figure out how much to swap
//     var amountOutMin = Math.abs(array_coins[array_coins.length - 1].diff_from_average) * (1 / (array_coins[array_coins.length - 1].usd_exchange_rate)) * 0.75;

//     var amountIn_Wei = parseInt(amountIn * 10 ** array_coins[0].decimals).toString() //am I introducing potential rounding errors here? And should I check for NaN after?
//     var amountOutMin_Wei = parseInt(amountOutMin * 10 ** array_coins[array_coins.length - 1].decimals).toString()

//     console.log(`Swapping ${amountIn.toFixed(8)} of ${array_coins[0].symbol} for ${array_coins[array_coins.length - 1].symbol}`);
//     $("#swapStarted").css("display", "block");
//     $("#swapStarted").text(`Swapping ${amountIn.toFixed(8)} of ${array_coins[0].symbol} for ${array_coins[array_coins.length - 1].symbol}`);

//     return [amountIn_Wei, amountOutMin_Wei, swap_path];
//   }
//   else {

//     var swap_path = [array_coins[0].address, array_coins[array_coins.length - 1].address]; // swap from last array item to first

//     var amountIn = Math.abs(array_coins[0].diff_from_average) * (1 / (array_coins[0].usd_exchange_rate)); //figure out how much to swap
//     var amountOutMin = Math.abs(array_coins[0].diff_from_average) * (1 / (array_coins[array_coins.length - 1].usd_exchange_rate)) * 0.75;

//     var amountIn_Wei = parseInt(amountIn * 10 ** array_coins[0].decimals).toString() //am I introducing potential rounding errors here? And should I check for NaN after?
//     var amountOutMin_Wei = parseInt(amountOutMin * 10 ** array_coins[array_coins.length - 1].decimals).toString()

//     console.log(`Swapping ${amountIn.toFixed(8)} of ${array_coins[0].symbol} for ${array_coins[array_coins.length - 1].symbol}`);
//     $("#swapStarted").css("display", "block");
//     $("#swapStarted").text(`Swapping ${amountIn.toFixed(8)} of ${array_coins[0].symbol} for ${array_coins[array_coins.length - 1].symbol}`);

//     return [amountIn_Wei, amountOutMin_Wei, swap_path];
//   }
// }

// async function swap(_amountIn, _amountOutMin, _path, _acct, _deadline) {
//   //making a swap on QUICKSWAP - first create an instance of the Quickswap router
//   var router = new ethers.Contract(SUSHISWAP_ROUTER, ROUTER_ABI, signer)
//   //perform the swap
//   try {
//     var swap = await router.swapExactTokensForTokens(_amountIn,
//       _amountOutMin,
//       _path,
//       _acct,
//       _deadline)
//     return true;
//   } catch (error) {
//     console.log(error); //can I get it to try again here??
//     return false;
//   }
// }

// function updateArray(array_coins) {
//   if (array_coins[0].diff_from_average > Math.abs(array_coins[array_coins.length - 1].diff_from_average)) { //check which coin is further from the dollar average
//     array_coins[0].diff_from_average -= Math.abs(array_coins[array_coins.length - 1].diff_from_average);
//     //remove the coin that's now balanced
//     array_coins.pop() //remove the last element from the array
//     //re-sort the array
//     array_coins.sort((a, b) => {
//       return b.diff_from_average - a.diff_from_average;
//     })
//     return array_coins;
//   }
//   else {
//     //decrease the diff_from_average of the coin we've just moved money out of
//     array_coins[array_coins.length - 1].diff_from_average += Math.abs(array_coins[0].diff_from_average);
//     //remove the coin that's now balanced
//     array_coins.shift(); //remove the last element from the array
//     //re-sort the array
//     array_coins.sort((a, b) => {
//       return b.diff_from_average - a.diff_from_average;
//     })
//     return array_coins;
//   }
}
