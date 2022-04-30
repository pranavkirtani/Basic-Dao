const { expect } = require("chai");
const { ethers } = require("hardhat");
const {MIN_DELAY,QUORUM_PERCENTAGE,VOTING_PERIOD,VOTING_DELAY,ADDRESS_ZERO }=require("../helper.config")
const {moveBlocks}=require("../move")
const {moveTime}=require("../move_time")
describe("Test governance contracts, proposals,voting and execution", function () {

    it("Testing proposal creation,voting ,execution by single user", async () => {
        [owner, addr1, addr2] = await ethers.getSigners();
      
        governanceToken = await ethers.getContractFactory("MyToken")
        deployedToken=await governanceToken.deploy();
        await deployedToken.deployed();

        transactionResponse = await deployedToken.delegate(owner.address)
        await transactionResponse.wait(1)

        timeLock = await ethers.getContractFactory("TimeLock")
      
        deployedTimeLock=await timeLock.deploy(MIN_DELAY,[],[]);

        await deployedTimeLock.deployed();
       
        governor = await ethers.getContractFactory("GovernorContract")

        deployedGovernor=await governor.deploy(deployedToken.address,deployedTimeLock.address,QUORUM_PERCENTAGE,VOTING_PERIOD,VOTING_DELAY);
        await deployedGovernor.deployed()

        box = await ethers.getContractFactory("Box")
        deployedBox=await box.deploy()
        await deployedBox.deployed()
        /** This is done so as to transfer the ownership to timelock contract so that it can execute the operation */
        const transferTx = await deployedBox.transferOwnership(deployedTimeLock.address)
        await transferTx.wait(1)
        /**
        * Granting roles to the relevant parties
        */
        const proposerRole = await deployedTimeLock.PROPOSER_ROLE()
        const executorRole = await deployedTimeLock.EXECUTOR_ROLE()
        const adminRole = await deployedTimeLock.TIMELOCK_ADMIN_ROLE()

        const proposerTx = await deployedTimeLock.grantRole(proposerRole, deployedGovernor.address)
        await proposerTx.wait(1)
      
        const executorTx = await deployedTimeLock.grantRole(executorRole, ADDRESS_ZERO)
        await executorTx.wait(1)
        const revokeTx = await deployedTimeLock.revokeRole(adminRole, owner.address)
        await revokeTx.wait(1)
      
        const proposalDescription="propose this data"
        let encodedFunctionCall = box.interface.encodeFunctionData("store", [77])
        transactionResponse = await deployedToken.delegate(owner.address)
        await transactionResponse.wait(1)


        const proposeTx = await deployedGovernor.propose([deployedBox.address],[0],[encodedFunctionCall],proposalDescription);

        await moveBlocks(VOTING_DELAY + 1)
        const proposeReceipt = await proposeTx.wait(1)
        proposalId = proposeReceipt.events[0].args.proposalId
        console.log(`Proposed with proposal ID:\n  ${proposalId}`)

        let proposalState = await deployedGovernor.state(proposalId)
        const proposalSnapShot = await deployedGovernor.proposalSnapshot(proposalId)
        const proposalDeadline = await deployedGovernor.proposalDeadline(proposalId)

                // The state of the proposal. 1 is not passed. 0 is passed.
        console.log(`Current Proposal State: ${proposalState}`)
        // What block # the proposal was snapshot
        console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
        // The block number the proposal voting expires
        console.log(`Current Proposal Deadline: ${proposalDeadline}`)
        const voteWay = 1
        const reason = "I vote yes"
            
        console.log("delegates",await deployedToken.delegates(owner.address))
        //console.log("deployedGovernor",deployedGovernor)
        let voteTx = await deployedGovernor.castVoteWithReason(proposalId, voteWay, reason)
        let voteTxReceipt = await voteTx.wait(1)
        console.log(voteTxReceipt.events[0].args.reason)
        proposalState = await deployedGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)
        /**
         * Moving blocks to simulate completion of voting period
         */
        await moveBlocks(VOTING_PERIOD + 1)




        const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalDescription))


        console.log("Queueing...")
        const votes=await deployedGovernor.getVotes(owner.address,12)
        console.log("votes",votes)
        console.log(`Checkpoints: ${await deployedToken.numCheckpoints(owner.address)}`)
     
        const quorum=await deployedGovernor.quorum(12)
        console.log("quorum",quorum)
        proposalState = await deployedGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)
        const queueTx = await deployedGovernor.queue([deployedBox.address],[0],[encodedFunctionCall],descriptionHash)
        await queueTx.wait(1)

        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)


        console.log("Executing...")
    
        const executeTx = await deployedGovernor.execute(
        [deployedBox.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
        )
        await executeTx.wait(1)
        const value=await deployedBox.retrieve();
        console.log(value)
        })

  
    it("Create another user, issue token, both users voting to match 90% quorum and execution", async () => {
        [owner, addr1, addr2] = await ethers.getSigners();
    
        governanceToken = await ethers.getContractFactory("MyToken")
        deployedToken=await governanceToken.deploy();
        await deployedToken.deployed();

        transactionResponse = await deployedToken.delegate(owner.address)
        await transactionResponse.wait(1)

        timeLock = await ethers.getContractFactory("TimeLock")

        deployedTimeLock=await timeLock.deploy(MIN_DELAY,[],[]);

        await deployedTimeLock.deployed();
    
        governor = await ethers.getContractFactory("GovernorContract")

        deployedGovernor=await governor.deploy(deployedToken.address,deployedTimeLock.address,QUORUM_PERCENTAGE,VOTING_PERIOD,VOTING_DELAY);
        await deployedGovernor.deployed()

        box = await ethers.getContractFactory("Box")
        deployedBox=await box.deploy()
        await deployedBox.deployed()
        /** This is done so as to transfer the ownership to timelock contract so that it can execute the operation */
        const transferTx = await deployedBox.transferOwnership(deployedTimeLock.address)
        await transferTx.wait(1)
        /**
        * Granting roles to the relevant parties
        */
        const proposerRole = await deployedTimeLock.PROPOSER_ROLE()
        const executorRole = await deployedTimeLock.EXECUTOR_ROLE()
        const adminRole = await deployedTimeLock.TIMELOCK_ADMIN_ROLE()

        const proposerTx = await deployedTimeLock.grantRole(proposerRole, deployedGovernor.address)
        await proposerTx.wait(1)
      
        const executorTx = await deployedTimeLock.grantRole(executorRole, ADDRESS_ZERO)
        await executorTx.wait(1)
        const revokeTx = await deployedTimeLock.revokeRole(adminRole, owner.address)
        await revokeTx.wait(1)
      
        const proposalDescription="propose this data"
        let encodedFunctionCall = box.interface.encodeFunctionData("store", [77])
        transactionResponse = await deployedToken.delegate(owner.address)
        await transactionResponse.wait(1)

        /**
         * Adding second user
         */
        const signer=await ethers.getSigner(addr1.address);
        const deployedTokenUser2=await deployedToken.connect(signer)
        await deployedTokenUser2.issueToken(addr1.address,200)
        transactionResponse = await deployedTokenUser2.delegate(addr1.address)
        await transactionResponse.wait(1)

        const proposeTx = await deployedGovernor.propose([deployedBox.address],[0],[encodedFunctionCall],proposalDescription);

        await moveBlocks(VOTING_DELAY + 1)
        const proposeReceipt = await proposeTx.wait(1)
        proposalId = proposeReceipt.events[0].args.proposalId
        console.log(`Proposed with proposal ID:\n  ${proposalId}`)

        let proposalState = await deployedGovernor.state(proposalId)
        const proposalSnapShot = await deployedGovernor.proposalSnapshot(proposalId)
        const proposalDeadline = await deployedGovernor.proposalDeadline(proposalId)

                // The state of the proposal. 1 is not passed. 0 is passed.
        console.log(`Current Proposal State: ${proposalState}`)
        // What block # the proposal was snapshot
        console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
        // The block number the proposal voting expires
        console.log(`Current Proposal Deadline: ${proposalDeadline}`)
        const voteWay = 1
        const reason = "I vote yes"
            
       
 
        let voteTx = await deployedGovernor.castVoteWithReason(proposalId, voteWay, reason)
        let voteTxReceipt = await voteTx.wait(1)
        console.log(voteTxReceipt.events[0].args.reason)
        proposalState = await deployedGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)
        /**
        * Second user voting
        */
        const deployedGovernorUser2=await deployedGovernor.connect(signer)
        voteTx = await deployedGovernorUser2.castVoteWithReason(proposalId, voteWay, reason)
        voteTxReceipt = await voteTx.wait(1)
        console.log(voteTxReceipt.events[0].args.reason)
        proposalState = await deployedGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)
        /**
         * Moving blocks to simulate completion of voting period
         */
        await moveBlocks(VOTING_PERIOD + 1)




        const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalDescription))


        console.log("Queueing...")
        const votes=await deployedGovernor.getVotes(owner.address,37)
        console.log("votes",votes)
        console.log(`Checkpoints: ${await deployedToken.numCheckpoints(owner.address)}`)
     
        const quorum=await deployedGovernor.quorum(37)
        console.log("quorum",quorum)
        proposalState = await deployedGovernor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)
        const queueTx = await deployedGovernor.queue([deployedBox.address],[0],[encodedFunctionCall],descriptionHash)
        await queueTx.wait(1)

        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)


        console.log("Executing...")
    
        const executeTx = await deployedGovernor.execute(
        [deployedBox.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
        )
        await executeTx.wait(1)
        const value=await deployedBox.retrieve();
        console.log(value)
        })



  
});