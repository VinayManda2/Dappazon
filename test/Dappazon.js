const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether');
}

// Global constants for listing an item
const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("dappazon", () => {
    let dappazon;
    let deployer, buyer;

    beforeEach(async () => {
        // Setup accounts
        [deployer, buyer] = await ethers.getSigners();
        
        // Deploy contract
        dappazon = await ethers.deployContract("Dappazon");

    //     const contractBalance = await ethers.provider.getBalance(dappazon);
    
    // console.log(`dappazon Contract Balance: ${contractBalance}`);


    });

    describe("Deployment", () => {
        it('sets the owner', async () => {
            const owner = await dappazon.owner();
            expect(owner).to.equal(deployer.address);
        });
    });

    describe("Listening", () => {
        let transaction;

        beforeEach(async () => {
            transaction = await dappazon.connect(deployer).list(
                ID,
                NAME,
                CATEGORY,
                IMAGE,
                COST,
                RATING,
                STOCK
            );
            await transaction.wait();
        });

        it('returns item attributes', async () => {
            const item = await dappazon.items(1);
            expect(item.id).to.equal(ID);
            expect(item.name).to.equal(NAME);
            expect(item.category).to.equal(CATEGORY);
            expect(item.image).to.equal(IMAGE);
            expect(item.cost).to.equal(COST);
            expect(item.rating).to.equal(RATING);
            expect(item.stock).to.equal(STOCK);
        });

        it('emits list event', async () => {
            expect(transaction).to.emit(dappazon, "List");
        });
    });

    describe("Buying", () => {
        beforeEach(async () => {
            // List an item
            const listTransaction = await dappazon.connect(deployer).list(
                ID,
                NAME,
                CATEGORY,
                IMAGE,
                COST,
                RATING,
                STOCK
            );
            await listTransaction.wait();
            
           
        });

        it("updates the contract balance", async () => {

            // Retrieve the initial balance of the dappazon contract
            const initialBalance = await ethers.provider.getBalance(dappazon);
            // console.log(`initial balance : ${initialBalance}`)
            

             // Buy an item
            const buyTransaction = await dappazon.connect(buyer).buy(ID, { value: COST, gasLimit: 3000000, gasPrice: ethers.parseUnits('20', 'gwei')  });
            await buyTransaction.wait();
            
            //Verify Transaction Receipt
            // const receipt = await buyTransaction.wait();
            // console.log(receipt.status); // Should be 1 for success


            // Retrieve the current balance of the dappazon contract
            const result = await ethers.provider.getBalance(dappazon);
            

            // Calculate the expected balance after buying
            const expectedBalance = initialBalance + COST

            // Compare the retrieved balance with the expected balance
            
            expect(result).to.equal(expectedBalance);
        });

        it("updates buyer order count", async () => {
            const buyTransaction = await dappazon.connect(buyer).buy(ID, { value: COST, gasLimit: 3000000, gasPrice: ethers.parseUnits('20', 'gwei')  });
            await buyTransaction.wait();
            const result = await dappazon.orderCount(buyer.address)
            // Compare the retrieved balance with the expected balance
            expect(result).to.equal(1);
        });

        it("adds the order", async () => {
            const buyTransaction = await dappazon.connect(buyer).buy(ID, { value: COST, gasLimit: 3000000, gasPrice: ethers.parseUnits('20', 'gwei')  });
            await buyTransaction.wait();
            const order = await dappazon.orders(buyer.address,1)
            expect(order.time).to.be.greaterThan(0)
            expect(order.item.name).to.equal(NAME)
        });

        it("emits Purchase event", async () => {
            // Buyer purchases the item and capture the transaction
            const tx = await dappazon.connect(buyer).buy(ID, { value: COST, gasLimit: 3000000, gasPrice: ethers.parseUnits('20', 'gwei')  });
    
            // Wait for the transaction to be mined
            await tx.wait();
    
            // Check for the Purchase event
            await expect(tx).to.emit(dappazon, "Buy");

        });

    });

    describe("Withdrawing", () => {
        let balanceBefore

        beforeEach(async () => {
            
            // List a item
      let transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      // Buy a item
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST })
      await transaction.wait()

      // Get Deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      // Withdraw
      transaction = await dappazon.connect(deployer).withdraw()
      await transaction.wait()
            
        })

        it('Updates the owner balance', async () => {
            const balanceAfter = await ethers.provider.getBalance(deployer.address)
            expect(balanceAfter).to.be.greaterThan(balanceBefore)
          })
      
          it('Updates the contract balance', async () => {
            const result = await ethers.provider.getBalance(dappazon)
            expect(result).to.equal(0)
          })
        

    })
});
