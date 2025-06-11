import React, { useState, useEffect, useMemo, useRef } from "react";
import { FaEthereum } from "react-icons/fa";
import { SiTether } from "react-icons/si";
import { IoWalletOutline } from "react-icons/io5";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { BsFillInfoCircleFill, BsCurrencyDollar } from "react-icons/bs";
import { RiUsdCircleFill } from "react-icons/ri";
import { CustomConnectButton } from "../index";
import { useWeb3 } from "../../context/Web3Provider";
import { ethers } from "ethers";

const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;
const TOKEN_SYMBOL = process.env.NEXT_PUBLIC_TOKEN_SYMBOL;
const TOKEN_SUPPLY = process.env.NEXT_PUBLIC_TOKEN_SUPPLY;
const PER_TOKEN_USD_PRICE = process.env.NEXT_PUBLIC_PER_TOKEN_USD_PRICE;
const NEXT_PER_TOKEN_USD_PRICE =
  process.env.NEXT_PUBLIC_NEXT_PER_TOKEN_USD_PRICE;
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY;
const BLOCKCHAIN = process.env.NEXT_PUBLIC_BLOCKCHAIN;

const HeroSection = ({ isDarkMode, setIsReferralPopupOpen }) => {
  const {
    account,
    isConnected,
    contractInfo,
    tokenBalances,
    buyWithETH,
    buyWithUSDT,
    buyWithUSDC,
    addtokenToMetaMask,
    getReferralInfo,
    checkReferralCode,
    registerReferrer,
  } = useWeb3();

  const [selectedToken, setSelectedToken] = useState("ETH");
  const [inputAmount, setInputAmount] = useState("0");
  const [tokenAmount, setTokenAmount] = useState("0");
  const [hasSufficientBalance, setHasSufficientBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedRegistration, setHasAttemptedRegistration] =
    useState(false);
  const registrationRef = useRef(false);

  // Calculate progress percentage based on sold tokens vs total supply
  const calculateProgressPercentage = () => {
    if (!contractInfo?.totalSold || !contractInfo?.fsxBalance) return 0;

    const availbleSupply =
      Number(contractInfo?.totalSold) + Number(contractInfo?.fsxBalance);
    const soldAmount = parseFloat(contractInfo.totalSold) || 0;
    const totalSupply = parseFloat(availbleSupply) || 1; // Prevent division by zero

    // Calculate percentage with a maximum of 100%
    const percentage = Math.min((soldAmount / totalSupply) * 100, 100);

    // Return percentage with maximum 2 decimal places
    return parseFloat(percentage.toFixed(2));
  };

  // Properly handle the price calculations with useMemo to avoid recalculations
  const prices = useMemo(() => {
    // Default fallback values
    const defaultEthPrice = contractInfo?.ethPrice;
    const defaultUsdtRatio = contractInfo?.usdtTokenRatio;
    const defaultUsdcRatio = contractInfo?.usdcTokenRatio;

    let ethPrice, usdtRatio, usdcRatio;

    try {
      // Handle ETH price
      if (contractInfo?.ethPrice) {
        // If it's already a BigNumber or a BigNumber-compatible object
        if (
          typeof contractInfo.ethPrice === "object" &&
          contractInfo.ethPrice._isBigNumber
        ) {
          ethPrice = contractInfo.ethPrice;
        } else {
          // If it's a string, convert it
          ethPrice = ethers.utils.parseEther(contractInfo.ethPrice.toString());
        }
      } else {
        // Default fallback
        ethPrice = ethers.utils.parseEther(defaultEthPrice);
      }

      // Handle USDT ratio
      usdtRatio = contractInfo?.usdtTokenRatio
        ? parseFloat(contractInfo.usdtTokenRatio)
        : defaultUsdtRatio;

      // Handle USDC ratio
      usdcRatio = contractInfo?.usdcTokenRatio
        ? parseFloat(contractInfo.usdcTokenRatio)
        : defaultUsdcRatio;
    } catch (error) {
      console.error("Error parsing prices:", error);
      ethPrice = ethers.utils.parseEther(defaultEthPrice);
      usdtRatio = defaultUsdtRatio;
      usdcRatio = defaultUsdcRatio;
    }

    return { ethPrice, usdtRatio, usdcRatio };
  }, [contractInfo]);

  // Start loading effect when component mounts
  useEffect(() => {
    setIsLoading(true);

    // Set a timeout to hide the loader after 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Clean up the timer if component unmounts
    return () => clearTimeout(timer);
  }, []);

  // Check if user has enough balance and if token supply is sufficient
  useEffect(() => {
    if (!isConnected || !tokenBalances) {
      setHasSufficientBalance(false);
      return;
    }

    // Check if FSX balance is below threshold
    const lowTokenSupply = parseFloat(tokenBalances?.fsxBalance || "0") < 20;

    if (lowTokenSupply) {
      setHasSufficientBalance(false);
      return;
    }

    const inputAmountFloat = parseFloat(inputAmount) || 0;
    let hasBalance = false;

    switch (selectedToken) {
      case "ETH":
        const ethBalance = parseFloat(tokenBalances?.userEthBalance || "0");
        hasBalance = ethBalance >= inputAmountFloat && inputAmountFloat > 0;
        break;
      case "USDT":
        const usdtBalance = parseFloat(tokenBalances?.userUSDTBalance || "0");
        hasBalance = usdtBalance >= inputAmountFloat && inputAmountFloat > 0;
        break;
      case "USDC":
        const usdcBalance = parseFloat(tokenBalances?.userUSDCBalance || "0");
        hasBalance = usdcBalance >= inputAmountFloat && inputAmountFloat > 0;
        break;
      default:
        hasBalance = false;
    }

    setHasSufficientBalance(hasBalance);
  }, [isConnected, inputAmount, selectedToken, tokenBalances]);

  useEffect(() => {
    const initReferral = async () => {
      // Only proceed if we haven't already attempted registration in this component instance
      if (isConnected && account && !hasAttemptedRegistration) {
        // Immediately set the flag to prevent duplicate calls
        setHasAttemptedRegistration(true);

        console.log("Attempting referral registration...");

        try {
          // Get current referral info
          const referralInfo = await getReferralInfo(account);

          // Only process if user doesn't already have a referrer
          if (
            !referralInfo?.referrer ||
            referralInfo.referrer ===
              "0x0000000000000000000000000000000000000000"
          ) {
            // Check for referral code
            const referralCode = checkReferralCode();

            if (referralCode && ethers.utils.isAddress(referralCode)) {
              // Make sure it's not the user's own address
              if (referralCode.toLowerCase() !== account.toLowerCase()) {
                // Register the referrer
                await registerReferrer(referralCode);
                console.log("Referrer registration complete");
              }
            }
          }
        } catch (error) {
          console.error("Error in referral process:", error);
        }
      }
    };

    // Create a dedicated initialization function that uses a ref to track execution
    const safeInitReferral = () => {
      if (!registrationRef.current && isConnected && account) {
        registrationRef.current = true;
        initReferral();
      }
    };

    // Call the safe initialization function once
    safeInitReferral();

    // Cleanup function to reset the ref if needed (e.g., when account changes)
    return () => {
      // Optional: You can decide whether to reset based on your needs
      // registrationRef.current = false;
    };
  }, [isConnected, account, getReferralInfo, registerReferrer]);

  // Calculate token amount based on input amount and selected token
  const calculateTokenAmount = (amount, token) => {
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return "0";

    let calculatedAmount;
    try {
      switch (token) {
        case "ETH":
          // Convert ETH value to tokens based on contract's formula
          const amountInWei = ethers.utils.parseEther(amount);
          const tokensPerEth = ethers.utils.formatEther(prices.ethPrice);
          calculatedAmount = parseFloat(amount) / parseFloat(tokensPerEth);
          break;
        case "USDT":
          calculatedAmount = parseFloat(amount) * prices.usdtRatio;
          break;
        case "USDC":
          calculatedAmount = parseFloat(amount) * prices.usdcRatio;
          break;
        default:
          calculatedAmount = 0;
      }
    } catch (error) {
      console.error(`Error calculating token amount:`, error);
      calculatedAmount = 0;
    }

    return calculatedAmount.toFixed(6);
  };

  // Handle input amount changes
  const handleAmountChange = (value) => {
    setInputAmount(value);
    setTokenAmount(calculateTokenAmount(value, selectedToken));
  };

  // Handle token selection change
  const handleTokenSelection = (token) => {
    setSelectedToken(token);
    setTokenAmount(calculateTokenAmount(inputAmount, token));
  };

  // Execute purchase based on selected token
  const executePurchase = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (parseFloat(inputAmount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    if (!hasSufficientBalance) {
      if (parseFloat(tokenBalances?.fsxBalance || "0") < 20) {
        alert("Insufficient token supply. Please try again later.");
      } else {
        alert(`Insufficient ${selectedToken} balance`);
      }
      return;
    }

    try {
      let tx;
      console.log(`Buying with ${inputAmount} ${selectedToken}`);

      switch (selectedToken) {
        case "ETH":
          tx = await buyWithETH(inputAmount);
          break;
        case "USDT":
          tx = await buyWithUSDT(inputAmount);
          break;
        case "USDC":
          tx = await buyWithUSDC(inputAmount);
          break;
        default:
          alert("Please select a token to purchase with");
          return;
      }

      console.log(tx);
      alert(`Successfully purchased ${tokenAmount} ${TOKEN_SYMBOL} tokens!`);

      // Reset amounts
      setInputAmount("0");
      setTokenAmount("0");
    } catch (error) {
      console.error(`Error buying with ${selectedToken}:`, error);
      alert("Transaction failed. Please try again.");
    }
  };

  // Get current balance based on selected token
  const getCurrentBalance = () => {
    if (!tokenBalances) return "0";

    switch (selectedToken) {
      case "ETH":
        return tokenBalances?.userEthBalance || "0";
      case "USDT":
        return tokenBalances?.userUSDTBalance || "0";
      case "USDC":
        return tokenBalances?.userUSDCBalance || "0";
      default:
        return "0";
    }
  };

  // Determine button state message
  const getButtonMessage = () => {
    if (parseFloat(tokenBalances?.fsxBalance || "0") < 20) {
      return "INSUFFICIENT TOKEN SUPPLY";
    }
    return hasSufficientBalance
      ? `BUY WITH ${selectedToken}`
      : `INSUFFICIENT ${selectedToken} BALANCE`;
  };

  // Get token icon/logo based on selected token
  const getTokenIcon = (token) => {
    switch (token) {
      case "ETH":
        return <FaEthereum className="text-blue-400" />;
      case "USDT":
        return <SiTether className="text-green-400" />;
      case "USDC":
        return <img src="/usdc.svg" className="w-5 h-5" alt="USDC" />;
      default:
        return null;
    }
  };

  // Theme variables
  const bgColor = isDarkMode ? "bg-[#0E0B12]" : "bg-[#F5F7FA]";
  const textColor = isDarkMode ? "text-white" : "text-gray-800";
  const secondaryTextColor = isDarkMode ? "text-gray-400" : "text-gray-600";
  const cardBg = isDarkMode ? "bg-[#13101A]" : "bg-white/95";
  const cardBorder = isDarkMode ? "border-gray-800/30" : "border-gray-100";
  const inputBg = isDarkMode
    ? "bg-gray-900/60 border-gray-800/50"
    : "bg-gray-100 border-gray-200/70";
  const primaryGradient = "from-teal-400 to-indigo-500";
  const primaryGradientHover = "from-teal-500 to-indigo-600";
  const accentColor = "text-teal-500";

  // Token button styling
  const getTokenButtonStyle = (token) => {
    const isSelected = selectedToken === token;
    const baseClasses =
      "flex-1 flex items-center justify-center rounded-lg py-2.5 transition-all duration-300";

    if (isSelected) {
      let selectedColorClass;
      switch (token) {
        case "ETH":
          selectedColorClass = "bg-gradient-to-r from-blue-500 to-indigo-600";
          break;
        case "USDT":
          selectedColorClass = "bg-gradient-to-r from-green-500 to-teal-600";
          break;
        case "USDC":
          selectedColorClass = "bg-gradient-to-r from-blue-400 to-blue-600";
          break;
        default:
          selectedColorClass = "";
      }
      return `${baseClasses} ${selectedColorClass} text-white shadow-lg`;
    }

    return `${baseClasses} ${
      isDarkMode
        ? "bg-gray-800/40 hover:bg-gray-800/60 text-gray-300"
        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
    }`;
  };

  return (
    <div className={`relative mt-12 w-full overflow-hidden ${bgColor}`}>
      {/* Background with glowing animated pattern */}
      <div className="absolute inset-0 z-0">
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-gradient-to-b from-[#0E0B12]/80 via-transparent to-[#0E0B12]/80"
              : "bg-gradient-to-b from-[#f3f3f7]/80 via-transparent to-[#f3f3f7]/80"
          }`}
        ></div>

        {/* Animated glowing grid pattern */}
        <div className="absolute inset-0 grid-pattern"></div>

        {/* Moving light effects */}
        <div className="absolute inset-0 light-rays">
          <div className="light-ray ray1"></div>
          <div className="light-ray ray2"></div>
          <div className="light-ray ray3"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-28 md:py-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
          {/* Left side content - Text and graphics */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Header content */}
            <div className="inline-block p-2 px-4 rounded-full bg-gradient-to-r from-teal-400/10 to-indigo-500/10 mb-6">
              <p className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-500">
                Presale Now Live
              </p>
            </div>

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold ${textColor} mb-4`}
            >
              {TOKEN_NAME}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-500">
                {TOKEN_SYMBOL}
              </span>
            </h1>

            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-500">
                Token
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                {" "}
                Sale
              </span>
              <span className={textColor}> Stage 1</span>
            </h2>

            <p
              className={`${secondaryTextColor} text-base md:text-lg max-w-md mb-8 leading-relaxed`}
            >
              Revolutionizing intelligence through decentralized innovation.
              Join the future of blockchain technology today.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div
                className={`px-4 py-2 rounded-full ${
                  isDarkMode ? "bg-teal-500/10" : "bg-teal-100"
                } ${
                  isDarkMode ? "text-teal-300" : "text-teal-700"
                } text-sm font-medium flex items-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Limited Presale
              </div>
              <div
                className={`px-4 py-2 rounded-full ${
                  isDarkMode ? "bg-indigo-500/10" : "bg-indigo-100"
                } ${
                  isDarkMode ? "text-indigo-300" : "text-indigo-700"
                } text-sm font-medium flex items-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Exclusive Benefits
              </div>
            </div>

            {/* Referral button - Mobile only */}
            <button
              onClick={() => setIsReferralPopupOpen(true)}
              className={`md:hidden w-full bg-transparent ${
                isDarkMode
                  ? "border-gray-700 hover:border-gray-600 hover:bg-gray-800/20"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-100"
              } border-2 rounded-lg py-3 mb-4 ${textColor} transition-all duration-200 font-medium`}
            >
              REFER A FRIEND
            </button>

            {/* Background decorative elements */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-r from-teal-400/10 to-indigo-500/10 rounded-full blur-3xl -z-10"></div>
          </div>

          {/* Right side content - Token purchase card */}
          <div className="w-full md:w-1/2 max-w-md mx-auto relative">
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                </div>
              </div>
            )}

            {/* Main card */}
            <div
              className={`${cardBg} backdrop-blur-sm rounded-xl ${cardBorder} border shadow-xl overflow-hidden transform transition duration-500 hover:shadow-2xl`}
            >
              <div className="p-6 md:p-8">
                {tokenBalances?.userFsxBalance > 0 && (
                  <div
                    className={`text-center text-xs ${secondaryTextColor} mb-4 bg-gradient-to-r from-teal-400/5 to-indigo-500/5 py-2 px-4 rounded-lg`}
                  >
                    Can't find tokens in your wallet?
                    <button
                      onClick={addtokenToMetaMask}
                      className="ml-2 text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Add to MetaMask
                    </button>
                  </div>
                )}

                {/* Card header */}
                <div className="text-center">
                  <div className="inline-block p-1.5 px-3 rounded-full bg-gradient-to-r from-teal-400/10 to-indigo-500/10 mb-2">
                    <p className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-500">
                      Limited Time Offer
                    </p>
                  </div>
                  <h3 className="text-xl text-center font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-500">
                    Stage 1 - Buy {TOKEN_SYMBOL} Now
                  </h3>

                  <div
                    className={`text-center text-sm ${secondaryTextColor} mb-4`}
                  >
                    Until price increase
                  </div>
                </div>

                {/* Price information */}
                <div className="flex justify-between items-center text-sm mb-3 px-1">
                  <div className={`${secondaryTextColor} flex flex-col`}>
                    <span className="text-xs mb-1">Current Price</span>
                    <span className={`${textColor} font-medium`}>
                      $ {PER_TOKEN_USD_PRICE}
                    </span>
                  </div>
                  <div className="h-10 w-px bg-gradient-to-b from-transparent via-gray-500/20 to-transparent"></div>
                  <div
                    className={`${secondaryTextColor} flex flex-col text-right`}
                  >
                    <span className="text-xs mb-1">Next Stage Price</span>
                    <span className={`${textColor} font-medium`}>
                      $ {NEXT_PER_TOKEN_USD_PRICE}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className={`w-full h-4 ${
                    isDarkMode ? "bg-gray-800/70" : "bg-gray-200/70"
                  } rounded-full mb-3 overflow-hidden`}
                >
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${primaryGradient} animated-progress relative`}
                    style={{
                      width: `${calculateProgressPercentage()}%`,
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 shimmer-effect"></div>
                  </div>
                </div>

                {/* Progress stats */}
                <div className="flex justify-between text-xs mb-6 px-1">
                  <div className={secondaryTextColor}>
                    Total Raised:{" "}
                    <span className={`${textColor} font-medium`}>
                      ${" "}
                      {parseFloat(contractInfo?.totalSold || 0) *
                        parseFloat(PER_TOKEN_USD_PRICE || 0) >
                      0
                        ? (
                            parseFloat(contractInfo?.totalSold || 0) *
                            parseFloat(PER_TOKEN_USD_PRICE || 0)
                          ).toFixed(2)
                        : "0"}
                    </span>
                  </div>
                  <div className={`${secondaryTextColor} font-medium`}>
                    <span className="text-teal-400 font-semibold">
                      {calculateProgressPercentage()}%
                    </span>{" "}
                    Complete
                  </div>
                </div>

                {/* Divider */}
                <div
                  className={`border-t ${
                    isDarkMode ? "border-gray-800/50" : "border-gray-200/50"
                  } my-5`}
                ></div>

                {/* Token price */}
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400/20 to-indigo-500/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
                      1
                    </span>
                  </div>
                  <span className={`${textColor} text-lg font-medium`}>
                    {TOKEN_SYMBOL} ={" "}
                  </span>
                  <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-teal-400/10 to-indigo-500/10">
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
                      ${PER_TOKEN_USD_PRICE}
                    </span>
                  </div>
                </div>

                {/* Token selection */}
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => handleTokenSelection("ETH")}
                    className={getTokenButtonStyle("ETH")}
                  >
                    <FaEthereum
                      className={`mr-2 ${
                        selectedToken === "ETH" ? "text-white" : ""
                      }`}
                      size={18}
                    />
                    {CURRENCY}
                  </button>
                  <button
                    onClick={() => handleTokenSelection("USDT")}
                    className={getTokenButtonStyle("USDT")}
                  >
                    <SiTether
                      className={`mr-2 ${
                        selectedToken === "USDT" ? "text-white" : ""
                      }`}
                      size={18}
                    />
                    USDT
                  </button>
                  <button
                    onClick={() => handleTokenSelection("USDC")}
                    className={getTokenButtonStyle("USDC")}
                  >
                    <img
                      className={`mr-2 w-4 h-4 ${
                        selectedToken === "USDC" ? "filter brightness-200" : ""
                      }`}
                      src="/usdc.svg"
                      alt="USDC"
                    />
                    USDC
                  </button>
                </div>

                {/* Balance display */}
                <div
                  className={`text-sm ${secondaryTextColor} text-center mb-6 py-2 px-4 rounded-lg ${
                    isDarkMode ? "bg-gray-800/30" : "bg-gray-100/70"
                  }`}
                >
                  <span className="mr-2">{selectedToken} Balance:</span>
                  <span className={`${textColor} font-medium`}>
                    {getCurrentBalance()}
                  </span>
                  <span className="ml-1">{selectedToken}</span>
                </div>

                {/* Amount inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label
                      className={`block ${secondaryTextColor} text-xs mb-1 font-medium`}
                    >
                      Pay with {selectedToken}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className={`w-full ${inputBg} rounded-lg border px-4 py-3 ${textColor} focus:ring-1 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200`}
                      />
                      <div
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2`}
                      >
                        <span className={`text-xs ${secondaryTextColor}`}>
                          {selectedToken}
                        </span>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center">
                          {getTokenIcon(selectedToken)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block ${secondaryTextColor} text-xs mb-1 font-medium`}
                    >
                      Receive {TOKEN_SYMBOL}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tokenAmount}
                        readOnly
                        className={`w-full ${inputBg} rounded-lg border px-4 py-3 ${textColor}`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <span className={`text-xs ${secondaryTextColor}`}>
                          {TOKEN_SYMBOL}
                        </span>
                        <div className="w-6 h-6 flex items-center justify-center">
                          <img
                            src="/CryptoKing.png"
                            alt={TOKEN_SYMBOL}
                            className="w-5 h-5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                {isConnected ? (
                  <button
                    onClick={executePurchase}
                    disabled={!hasSufficientBalance}
                    className={`w-full ${
                      hasSufficientBalance
                        ? `bg-gradient-to-r ${primaryGradient} hover:${primaryGradientHover}`
                        : isDarkMode
                        ? "bg-gray-700/70 cursor-not-allowed"
                        : "bg-gray-300 cursor-not-allowed"
                    } text-white rounded-lg py-4 mb-4 flex items-center justify-center transition-all duration-300 font-medium shadow-lg ${
                      hasSufficientBalance
                        ? "hover:shadow-indigo-500/20 hover:scale-[1.01]"
                        : ""
                    }`}
                  >
                    {getButtonMessage()}
                  </button>
                ) : (
                  <CustomConnectButton childStyle="w-full mb-4 py-4 rounded-lg flex items-center justify-center gap-2 font-medium" />
                )}

                {/* Refer a friend button */}
                <button
                  onClick={() => setIsReferralPopupOpen(true)}
                  className={`w-full bg-transparent ${
                    isDarkMode
                      ? "border-gray-700/70 hover:border-teal-400/30 hover:bg-gray-800/20 text-gray-300"
                      : "border-gray-300 hover:border-teal-400/50 hover:bg-gray-100 text-gray-700"
                  } border-2 rounded-lg py-3.5 mb-4 font-medium transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-[1.01]`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>REFER A FRIEND</span>
                </button>

                {/* Help links */}
                <div className="flex flex-col space-y-2 text-xs">
                  <div
                    className={`p-3 rounded-lg ${
                      isDarkMode ? "bg-gray-800/30" : "bg-gray-100/70"
                    } mb-1`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <AiOutlineQuestionCircle
                        className={`text-lg ${accentColor}`}
                      />
                      <h4 className={`font-medium ${textColor}`}>Need Help?</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="#"
                        className={`${secondaryTextColor} hover:${textColor} flex items-center text-xs transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-700/20`}
                      >
                        <span className="mr-1">•</span>
                        How to Buy
                      </a>
                      <a
                        href="#"
                        className={`${secondaryTextColor} hover:${textColor} flex items-center text-xs transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-700/20`}
                      >
                        <span className="mr-1">•</span>
                        Wallet Connection
                      </a>
                      <a
                        href="#"
                        className={`${secondaryTextColor} hover:${textColor} flex items-center text-xs transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-700/20`}
                      >
                        <span className="mr-1">•</span>
                        Token Info
                      </a>
                      <a
                        href="#"
                        className={`${secondaryTextColor} hover:${textColor} flex items-center text-xs transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-700/20`}
                      >
                        <span className="mr-1">•</span>
                        FAQ
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-indigo-500 hover:from-teal-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110`}
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        .animated-progress {
          animation: progress 1.5s ease-out;
        }
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: ${calculateProgressPercentage()}%;
          }
        }

        .grid-pattern {
          background-image: ${isDarkMode
            ? "linear-gradient(rgba(56, 189, 248, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.06) 1px, transparent 1px)"
            : "linear-gradient(rgba(79, 70, 229, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.08) 1px, transparent 1px)"};
          background-size: 35px 35px;
          animation: pulse-grid 8s ease-in-out infinite alternate;
        }

        @keyframes pulse-grid {
          0% {
            opacity: 0.7;
            background-size: 35px 35px;
          }
          100% {
            opacity: 1;
            background-size: 36px 36px;
          }
        }

        .light-rays {
          overflow: hidden;
          opacity: ${isDarkMode ? "0.4" : "0.3"};
        }

        .light-ray {
          position: absolute;
          width: 200%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            ${isDarkMode
              ? "rgba(56, 189, 248, 0.05) 45%, rgba(79, 70, 229, 0.1) 50%, rgba(56, 189, 248, 0.05) 55%"
              : "rgba(56, 189, 248, 0.03) 45%, rgba(79, 70, 229, 0.07) 50%, rgba(56, 189, 248, 0.03) 55%"},
            transparent 100%
          );
          transform: rotate(45deg);
          top: -50%;
          left: -50%;
        }

        .ray1 {
          animation: moveRay 15s linear infinite;
        }

        .ray2 {
          animation: moveRay 20s linear 5s infinite;
        }

        .ray3 {
          animation: moveRay 25s linear 10s infinite;
        }

        @keyframes moveRay {
          0% {
            transform: rotate(45deg) translateX(-100%);
          }
          100% {
            transform: rotate(45deg) translateX(100%);
          }
        }

        .shimmer-effect {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
