Table of Contents
Application Overview
User Interface Components
Connecting a Wallet
Purchasing Tokens
Referral System
Staking Feature
Stablecoin Purchase
Token Transfer
Admin Dashboard and Controls
Mobile Responsiveness
Conclusion and Next Steps
Application Overview
The Dapp is designed to facilitate a multi-currency ICO, allowing users to purchase tokens using various payment methods, including ETH, USDT, and USDC. It also includes a staking mechanism where users can lock their tokens to earn rewards, a referral system to incentivize user growth, and support for stablecoin purchases. The application features both user and admin dashboards, providing detailed insights and controls over the smart contract's activities.

Key Features:

Multi-Currency ICO: Users can buy tokens using ETH, USDT, or USDC.
Referral System: Users earn commissions when others use their referral links to purchase tokens.
Staking: Users can stake tokens to earn rewards, with options for different staking periods and early withdrawal penalties.
Stablecoin Purchase: Users can buy USDT and USDC directly through the Dapp using ETH.
Admin Controls: Administrators can manage token prices, staking rewards, and contract balances.
User Interface Components
The application's user interface is divided into several sections, each serving a specific purpose. Below is a breakdown of the main components:

1. Top Notification Bar
Displays critical notifications and project information.
2. Header Section
Contains the project logo and a mega menu for navigation.
The mega menu provides access to sections such as "Ecosystem," "Resources," and "About."
Users can toggle between light and dark modes.
3. Hero Section
Highlights key project details, including limited pre-sale exclusivity.
Features a token purchase interface with options for ETH, USDT, and USDC.
Displays a progress bar indicating the percentage of tokens sold.
Shows the current token price and the next stage price.
4. Project Details Section
Includes a video overview of the project.
Provides information on innovative technologies and future plans.
5. Partner Section
Showcases brands and partners associated with the project.
6. Technology Section
Highlights the technologies and protocols used in the project.
7. Roadmap
Outlines the project's development phases and milestones.
8. Tokenomics
Displays token distribution details, including liquidity, staking rewards, and team allocations.
Allows users to copy the token contract address and view it on the blockchain explorer.
9. Video Section
Features videos about the project, accessible via a modal popup.
10. FAQ Section
Provides answers to frequently asked questions about the project.
11. Contact Section
Allows users to send messages or inquiries to the project team.
12. Footer
Contains additional navigation links and social media icons.
Connecting a Wallet
To interact with the Dapp, users must connect their cryptocurrency wallets. The application supports multiple wallet providers, including MetaMask, Trust Wallet, and WalletConnect.

Steps to Connect a Wallet:
Click the "Connect Wallet" button in the header or hero section.
Select a wallet provider from the popup modal (e.g., MetaMask).
Confirm the connection request in the wallet interface.
Once connected, the user's wallet address and balances (ETH, USDT, USDC, etc.) are displayed in the application.
Note: The application automatically fetches and displays the user's token balances upon connection.

Purchasing Tokens
Users can purchase the project's tokens using ETH, USDT, or USDC. The purchase process is integrated into the hero section and token sale dashboard.

Steps to Purchase Tokens:
Select Payment Method: Choose between ETH, USDT, or USDC.
Enter Amount: Input the amount of the selected currency to spend.
View Token Amount: The application calculates and displays the number of tokens the user will receive based on the current price ratio.
Confirm Transaction: Click the "Buy with [Currency]" button and confirm the transaction in the wallet.
For ERC-20 tokens (USDT, USDC), an approval transaction may be required before the purchase.
Example:

Entering 1 ETH might yield 1,000 tokens based on a price ratio of 0.006 ETH per token.
Entering 10 USDT might yield 200 tokens, depending on the configured ratio.
Important: The price ratios for each currency can be adjusted by the admin.

Referral System
The referral system allows users to earn commissions when others use their referral links or IDs to purchase tokens. Commissions are typically set at 5% of the purchased token amount.

How the Referral System Works:
Generate Referral Link: Users can generate a unique referral link or ID from their dashboard.
Share Link: Share the link with others. When someone clicks the link and connects their wallet, the referral is automatically registered.
Earn Commissions: When the referred user purchases tokens, the referrer receives a 5% commission in tokens.
Steps to Use the Referral System:
Connect your wallet.
Navigate to the "Referral" section in the user dashboard.
Copy your referral link or ID.
Share the link with potential buyers.
When a referred user makes a purchase, the commission is automatically credited to your wallet.
Note: Referral commissions are tracked and displayed in the user's dashboard.

Staking Feature
The staking feature allows users to lock their tokens in the smart contract to earn rewards. The rewards are based on the staking duration, with longer periods offering higher returns.

Key Staking Parameters:
Minimum Stake: The minimum number of tokens required to stake (e.g., 100 tokens).
Staking Periods: Users can choose durations (e.g., 30, 90, 180, 365 days), each with a corresponding reward percentage.
Early Withdrawal Penalty: Users who withdraw before the staking period ends incur a penalty (e.g., 5% of the staked amount).
Steps to Stake Tokens:
Navigate to the "Staking" section in the dashboard.
Enter the number of tokens to stake.
Select the staking duration.
View the expected reward based on the selected duration.
Click "Stake Tokens" and confirm the transaction.
Managing Staked Tokens:
Harvest Rewards: Users can claim earned rewards at any time without unstaking.
Unstake Tokens: Users can withdraw staked tokens, but early withdrawal incurs a penalty.
Example:

Staking 200 tokens for 180 days might offer a 24% return.
Early withdrawal incurs a 5% penalty on the staked amount.
Stablecoin Purchase
The Dapp allows users to purchase stablecoins (USDT and USDC) directly using ETH, useful for users who need stablecoins to buy tokens.

Steps to Purchase Stablecoins:
Navigate to the "Stablecoin Purchase" section.
Select the stablecoin to purchase (USDT or USDC).
Enter the amount of ETH to spend.
View the amount of stablecoins to be received based on the current exchange rate.
Click "Buy with ETH" and confirm the transaction.
Note: The exchange rate for purchasing stablecoins can be adjusted by the admin.

Token Transfer
Users can transfer tokens (including the project's token, USDT, and USDC) to any wallet address directly from the Dapp.

Steps to Transfer Tokens:
Navigate to the "Token Transfer" section.
Select the token to transfer (e.g., project's token, USDT, USDC).
Enter the recipient's wallet address.
Enter the amount to transfer.
Click "Transfer Token" and confirm the transaction.
Note: All transfer transactions are recorded and displayed in the user's transaction history.

Admin Dashboard and Controls
The admin dashboard provides tools for managing the smart contract, including setting token prices, managing staking rewards, and withdrawing funds.

Key Admin Features:
Price and Ratio Management:
Update the price of the project's token.
Set exchange rates for purchasing stablecoins with ETH.
Adjust token-to-currency ratios for purchases.
Token Balance Monitoring:
View the remaining supply of tokens in the contract.
Monitor the contract's balances of USDT, USDC, and ETH.
Transaction Monitoring:
Track all transactions, including token purchases, staking, and referrals.
Admin Functions:
Initialize the token for sale.
Set the addresses for USDT and USDC.
Update staking reward percentages and minimum staking amounts.
Block specific wallet addresses from interacting with the contract.
Withdraw Tokens:
Withdraw tokens (including USDT and USDC) from the contract to the admin's wallet.
Important: Only the admin wallet can access and use these controls.

Mobile Responsiveness
The application is fully responsive and optimized for mobile devices. Key features include:

A collapsible side menu for easy navigation.
Touch-friendly interfaces for purchasing, staking, and transferring tokens.
Pop-up modals for wallet connections and transaction confirmations.
Users can perform all actions, including purchasing tokens and managing stakes, directly from their mobile devices.
