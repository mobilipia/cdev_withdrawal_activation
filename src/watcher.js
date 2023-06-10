const Web3 = require('web3')
const ethers = require('ethers');
const validateTransaction = require('./validate')
const confirmCCCTransaction = require('./confirm')
const TOKEN_ABI = require('./abi')


async function sendWithdrawalFunds(to,amount){
  console.log("Sending funds to users POW address")
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const privateKey=process.env.POW_PKEY;
  const transaction = {
    to: to,
    value: amount
    

  }


  console.log(transaction);
  console.log(privateKey);
  // Create a wallet instance
  let wallet = new ethers.Wallet(privateKey, provider);
  console.log(wallet)
  //let signedTx = await wallet.signTransaction(transaction);
  try{

  
  const tx = await wallet.sendTransaction(transaction);
  console.log(tx);
}catch(e){
  console.log(e)
}
}

async function GetTransactions(){
  const web3 = new Web3(process.env.POSRPC_URL)
  web3.eth.getBlockNumber()
.then(res=>{
  console.log("Current Block")
  console.log(res)
});
  latestBlock=await web3.eth.getBlockNumber()
  Block =await web3.eth.getBlock(latestBlock)

  Block.transactions.forEach(async(transactionAddress) => {
      console.log("New Transaction came in")
      let t=await web3.eth.getTransaction(transactionAddress)
      confirmCCCTransaction(transactionAddress)
      if(process.env.WALLET_TO.toLowerCase()==t.to.toLowerCase() && t.input.length<138){
        console.log("Payment made to withdrawal address for CSC withdrawal");
        if(process.env.WALLET_TO.toLowerCase()==t.to.toLowerCase()){
          const amount = Number(t.value) / 10 ** 18;
          const from = t.from;
          const receiver = t.to;
          const gasUsed= t.gas;
          if(amount>0){
            console.log("Withdrawal account");
            console.log("Receiver "+receiver);
            console.log("Amount "+amount);
            console.log("From "+from);
            console.log("gas Used "+gasUsed);
            value=Web3.utils.toWei(amount.toString(), 'ether');
            sendWithdrawalFunds(from,value)
          }
          console.log(t);
        }
        
      }
      //console.log(process.env.TOKEN_CONTRACT_ADDRESS.toLowerCase())
      //console.log(t.to.toLowerCase())
      /**if(process.env.TOKEN_CONTRACT_ADDRESS.toLowerCase()==t.to.toLowerCase() && (t.input.length >= 138 || t.input.slice(2, 10) !== "a9059cbb")){
        console.log("Doing CUSD payment")
        const receiver = `0x${t.input.slice(34, 74)}`;
        console.log(process.env.WALLET_TO.toLowerCase())
        console.log(receiver.toLowerCase())
        if(process.env.WALLET_TO.toLowerCase()==receiver.toLowerCase()){
        console.log("Payment made to activation address for CUSD payment");
        
        handleContractTransactions(t)
        }
      }*/
      
  })
}
function handleContractTransactions(result){
  if (result.input.length !== 138 || result.input.slice(2, 10) !== "a9059cbb") {
    //throw "NO CCC20 TRANSFER";
    return;
  }
  const receiver = `0x${result.input.slice(34, 74)}`;
  //const amount = (parseInt(result.input.slice(74),16) / 10 ** 6);
  const amount = parseInt(result.input.slice(74),16) / 10 ** 6;
  const contract = result.to;
  const from = result.from;
  const gasUsed= result.gas;
  if(amount>0){
    console.log("Withdrawal account");
    console.log("Receiver "+receiver);
    console.log("Amount "+amount);
    console.log("Contract "+contract);
    console.log("From "+from);
    console.log("gas Used "+gasUsed);
    value=Web3.utils.toWei(amount.toString(), 'ether');
    sendWithdrawalFunds(from,value)
  }
  
}

function watchCCCTransfers() {
  // Instantiate web3 with WebSocket provider

  setInterval(()=>{GetTransactions()},1000);
}


module.exports = {
  watchCCCTransfers
}