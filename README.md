# LearnIC DAO

## Introduction

This is a Decentralized Autonomous Organization (DAO) for the LearnIC community. The DAO is a smart contract that allows the community to vote on proposals and make decisions on how to manage the community resources. The DAO has it's own token called the LearnIC token (LIP) which is used to vote on proposals. There are 3 roles on the DAO atm, Student, Graduate, and Mentor. Only mentors are allowed to create proposals and vote.

The DAO also allows students to submit their own projects and get reviewed by mentors. The DAO is a place where students can learn and grow their skills.

The DAO is implemented using the Motoko programming language and the Internet Computer. The frontend is implemented using the React framework and the Internet Identity for authentication.

## How to use the DAO

The DAO is a smart contract that can be interacted with using the LearnIC token. The token is used to vote on proposals and to create proposals. The DAO has a few functions that can be called to interact with it. The main functions are:

- `createProposal`: This function is used to create a new proposal. The proposal can be to change the DAO parameters, or add new mentor.
- `vote`: This function is used to vote on a proposal. Only mentors are allowed to vote. Proposals need to reach a certain amount of votes to be executed.
- `registerMember`: This function is used to register a new member to the DAO. The member is given a student role, and assigned a certain amount of LIP tokens.
- `graduate`: This function is used to promote a student to a graduate role. Only mentors are allowed to promote students.
- `getAllProjects`: This function is used to get all the projects that are on the DAO. Projects are created by mentors and students can submit their work to them.
- `createSubmission`: This function is used to submit a project to a project. Only students are allowed to submit projects.

## Technical Details

I paid attention to some security and upgradeability details when creating the DAO.

- The DAO is upgradeable. This means that the DAO can be updated to add new features or fix bugs. The DAO is implemented using the `upgradable` pattern. High use of `Vector` for faster dynamic array operations and stable memory usage. Also added `postupgrade` and `preupgrade` functions to handle the upgrade process.

- Checks are done on the frontend and very well in the smart contract to make sure that only certain actions are allowed by certain roles. Data is also validated to make sure that it is correct.

- I implemented a basic token `LIP` for the DAO. This token is used to vote on proposals and to create proposals. It has it's own burn mechanism to reduce the supply of the token. Utilized intercanister calls to the token canister to get the balance of the user, thanks to the ICP documentation on how to get that.

- Internet Identity: The II is utilized by the dapp to securely identify users and manage their session. Internet Identity makes it easy for users to easily create and use their unique identities to login on the dapp.

- User Interface: It's very easy to understand and make use of the application has a newbie.

## Demo Images

### Become a member

[![Become a member](https://i.imgur.com/7Z3Z3Zm.png)](https://i.imgur.com/7Z3Z3Zm.png)

### View Projects

[![View Projects](https://i.imgur.com/7Z3Z3Zm.png)](https://i.imgur.com/7Z3Z3Zm.png)

### Make Submission

[![Make Submission](https://i.imgur.com/7Z3Z3Zm.png)](https://i.imgur.com/7Z3Z3Zm.png)

### Create Proposal

[![Create Proposal](https://i.imgur.com/7Z3Z3Zm.png)](https://i.imgur.com/7Z3Z3Zm.png)

## Demo Video

[![Demo Video](https://img.youtube.com/vi/)]

## Future Goals of the DAO

The DAO is a work in progress and there are many features that can be added to it. Some of the future goals of the DAO are:

- Add a reputation system to the DAO
- Make it fully decentralized using SNS in IC
- Better project review.
- Allow graduates and mentors to vote on projects created by mentors
- Add proposal to remove a mentor
- More proposals to change the DAO parameters
- Better UI
- Ways to earn LIP tokens
