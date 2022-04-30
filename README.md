# Basic Dao
This repository shows how to build a basic DAO (Decentralized autonomous organization). It includes tests that show how to create a proposal, how to give new users voting powers and tokens, as well as show have them vote and execute a proposal.

This repository is made using code from [OpenZeppelin](https://docs.openzeppelin.com/contracts/4.x/api/governance) and Patrick Collin's [DAO template.](https://github.com/PatrickAlphaC/dao-template)

This code also does on-chain governance ,however this repo has some additional flows such as issuing governance tokens to new users and granting them voting power.

# Getting Started 

This project uses Hardhat,If your new to Hardhat, I recommend you checkout their [documentation](https://hardhat.org/getting-started/). 

## Installation

1. Clone this repo:
```
git clone https://github.com/pranavkirtani/Basic-Dao
cd basic-dao
```

2. Install dependencies:
   
``` 
   yarn
```
3. Run Tests:

``` 
   yarn hardhat test
```
4. Check the accounts present
``` 
yarn hardhat accounts
```

## Scenarios covered by the tests
The tests cover two scenarios 
- A single participant with 100% of the vote share creating a proposal, voting on and executing the proposal.
- Adding another participant, issuing them new governance tokens, delegating voting power, creating a proposal and having both participants vote on it and then executing that proposal.