const ethers = require("ethers");
const TOKEN = require("./abi/DegentralizedToken.json");
const { UNISWAP_V2_ROUTER } = require("./constants");
const UniswapV2Router02ABI = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const dotenv = require("dotenv");
const { xBigNumber } = require("./utils");
dotenv.config();

const routerABI = UniswapV2Router02ABI.abi;
const tokenABI = TOKEN.abi;
let zombies = [];
let maxPriorityFeePerGas;
let maxFeePerGas;

const ethProvider = new ethers.providers.JsonRpcProvider(process.env.CHAIN_RPC_HTTP_URL)

async function init() {
    let tmp = process.env.ZOMBIES.split(",");
    if(tmp && tmp.length > 0){
        for(let zombieKey of tmp){
            const wallet = new ethers.Wallet(zombieKey, ethProvider);
            zombies.push(wallet);
        }
    }
    else{
        console.log('Configuration error.')
        return;
    }
    let feeData = await ethProvider.getFeeData();
    maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    maxFeePerGas = feeData.maxFeePerGas;
}

async function addLiquidity() {
    try {
        // approve for add liquidiy.
        const tokenContract = new ethers.Contract(process.env.TOKEN_ADDRESS, tokenABI, zombies[0])
        let decimals = await tokenContract.decimals();
        let amountTokenForLiquidity = ethers.utils.parseUnits(process.env.TOKEN_FOR_LIQUIDITY, decimals); // Amount of your token
        let amountEthForLiquidity = ethers.utils.parseUnits(process.env.ETH_FOR_LIQUIDITY, 18); // Amount of ETH
        let args = [ UNISWAP_V2_ROUTER[process.env.CHAINNAME], ethers.constants.MaxUint256];
        const balance = await tokenContract.totalSupply();
        console.log("Approving...")
        // const approveTx = await tokenContract.approve(...args);
        // await approveTx.wait();
        console.log("Approved!");

        // Third tx is add liquidity tx.
        args = [
            process.env.TOKEN_ADDRESS,
            amountTokenForLiquidity.toString(),
            0,
            0,
            zombies[0].address,
            parseInt(Date.now() / 1000) + 1200,
        ];
        const routerContract = new ethers.Contract(UNISWAP_V2_ROUTER[process.env.CHAINNAME], routerABI, zombies[0]);
        const num = 150;
        const den = 100;
        const gasPrice = xBigNumber("8000000000", num, den)
        const gasLimit = xBigNumber("5000000", num, den);
        // const gasLimit = await routerContract.estimateGas.addLiquidityETH(...args, {value: amountEthForLiquidity})
        
        console.log("reach before tx")
        const addLiquidityTx = await routerContract.addLiquidityETH(
            ...args,
            {
                gasPrice: 800000000,
                gasLimit: 5000000,
                value: amountEthForLiquidity
            }
        );
        console.log("reach before tx1")
        await addLiquidityTx.wait();
        console.log("reach before tx2")
    } catch (error) {
        console.log("Add liquidity Error: ", error)
    }
}

module.exports = {
    init,
    addLiquidity,
}