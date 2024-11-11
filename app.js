const {Command, Option} = require('commander');
const figlet = require('figlet');
const { checkDevWallets, checkPool, checkTradingWallets, checkAll } = require("./initial_check")
const bot = require("./main")

/**
 * @summary Send bundled transaction for addliquidity Tx and Txs buying tokens from wallets
 */
async function main() {
    const program = new Command();
    program
        .version("1.0.0", "-v, --version", "output the current version")
        .addHelpText("before", figlet.textSync("Bundle buy bot on EVM"))
        .helpOption("-h, --help", "display help")
        .description("This script is a bot for sniping tokens when launching your token on EVM")
        .option("--check-dev-wallets", "Get token balance and ETH amount of dev wallets")
        .option("--check-pool", "Check pair infomation after launching token")
        .option("--check-trading-wallets", "Check token balance and ETH amount of trading wallets")
        .option("--check-all", "Check dev wallets, trading wallets, pool infos")
        .option("--enableTradeAndBuy", "Approve token contract for adding liquidity")
        .option("--buy", "Buy tokens with trading wallets")
        .option("--add-liquidity", "add liquidity")
        .option("--refunds-all-eth", "Refunds all ETH from trading wallets")
        .action(async(options) => {
            if(Object.keys(options).length == 0){
                console.log("Please see command help with `node app.js --help`")
            }
            if(options.checkDevWallets){
                console.log("🟢 Checking dev wallets before launching token...")
                await checkDevWallets();
                console.log("✅ Checking ended...")
            }
            if(options.checkPool){
                console.log("🟢 Checking pair for tokens...")
                await checkPool();
                console.log("✅ Checking ended...")
            }
            if(options.checkTradingWallets){
                console.log("🟢 Checking trading wallets before selling your tokens...")
                await checkTradingWallets();
                console.log("✅ Checking ended...")
            }
            if(options.checkAll){
                console.log("🟢 Checking needed infos...")
                await checkAll();
                console.log("✅ Checking ended...")
            }
            if(options.addLiquidity){
                bot.init();
                bot.addLiquidity();       
            }
            // if(options.refundsAllEth){
            //     refundsAllETHFromWallets()
            // }
        })
    program.parse(process.argv).opts();

}

main()