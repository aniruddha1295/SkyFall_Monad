// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WeatherBets {

    // ============ ENUMS ============

    enum WeatherCondition { RAINFALL, TEMPERATURE, WIND_SPEED }
    enum Operator { ABOVE, BELOW }
    enum MarketStatus { OPEN, RESOLVED, CANCELLED }

    // ============ STRUCTS ============

    struct Market {
        uint256 id;
        string city;
        WeatherCondition condition;
        Operator operator;
        uint256 threshold;          // scaled by 100 (e.g., 10.5mm = 1050)
        uint256 resolutionTime;     // unix timestamp after which market can resolve
        uint256 createdAt;
        uint256 totalYesPool;       // total MON bet on YES
        uint256 totalNoPool;        // total MON bet on NO
        MarketStatus status;
        bool outcome;               // true = YES won, false = NO won
        address creator;
    }

    struct Bet {
        uint256 amount;
        bool isYes;                 // true = bet YES, false = bet NO
        bool claimed;
    }

    // ============ STATE ============

    address public admin;
    uint256 public marketCount;
    uint256 public platformFeePercent = 2;  // 2% fee

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public marketBettors;

    // ============ EVENTS ============

    event MarketCreated(uint256 indexed marketId, string city, uint8 condition, uint256 threshold, uint256 resolutionTime);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome, uint256 totalPool);
    event WinningsClaimed(uint256 indexed marketId, address indexed bettor, uint256 payout);
    event PositionExited(uint256 indexed marketId, address indexed bettor, uint256 originalAmount, uint256 exitPayout, uint256 feePercent);

    // ============ MODIFIERS ============

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor() {
        admin = msg.sender;
    }

    // ============ CORE FUNCTIONS ============

    /// @notice Create a new weather prediction market
    /// @param _city City name (e.g., "Nagpur")
    /// @param _condition 0=RAINFALL, 1=TEMPERATURE, 2=WIND_SPEED
    /// @param _operator 0=ABOVE, 1=BELOW
    /// @param _threshold Value scaled by 100 (10.5mm = 1050)
    /// @param _resolutionTime Unix timestamp when market can be resolved
    function createMarket(
        string memory _city,
        WeatherCondition _condition,
        Operator _operator,
        uint256 _threshold,
        uint256 _resolutionTime
    ) external returns (uint256) {
        require(_resolutionTime > block.timestamp, "Resolution must be in future");

        uint256 marketId = marketCount;
        markets[marketId] = Market({
            id: marketId,
            city: _city,
            condition: _condition,
            operator: _operator,
            threshold: _threshold,
            resolutionTime: _resolutionTime,
            createdAt: block.timestamp,
            totalYesPool: 0,
            totalNoPool: 0,
            status: MarketStatus.OPEN,
            outcome: false,
            creator: msg.sender
        });

        marketCount++;
        emit MarketCreated(marketId, _city, uint8(_condition), _threshold, _resolutionTime);
        return marketId;
    }

    /// @notice Place a bet on a market
    /// @param _marketId Market to bet on
    /// @param _isYes true = bet YES, false = bet NO
    function placeBet(uint256 _marketId, bool _isYes) external payable {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.OPEN, "Market not open");
        require(block.timestamp < market.resolutionTime, "Betting closed");
        require(msg.value > 0, "Bet must be > 0");
        require(bets[_marketId][msg.sender].amount == 0, "Already bet on this market");

        bets[_marketId][msg.sender] = Bet({
            amount: msg.value,
            isYes: _isYes,
            claimed: false
        });

        if (_isYes) {
            market.totalYesPool += msg.value;
        } else {
            market.totalNoPool += msg.value;
        }

        marketBettors[_marketId].push(msg.sender);
        emit BetPlaced(_marketId, msg.sender, _isYes, msg.value);
    }

    /// @notice Exit a position early with dynamic time-based fee
    function exitPosition(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.OPEN, "Market not open");
        require(block.timestamp < market.resolutionTime, "Betting closed");

        Bet storage userBet = bets[_marketId][msg.sender];
        require(userBet.amount > 0, "No bet placed");
        require(!userBet.claimed, "Already claimed");

        // Calculate dynamic fee based on time remaining
        uint256 timeRemaining = market.resolutionTime - block.timestamp;
        uint256 feePercent;

        if (timeRemaining > 6 hours) {
            feePercent = 3;     // Low fee — plenty of time left
        } else if (timeRemaining > 2 hours) {
            feePercent = 5;     // Moderate fee — getting closer
        } else {
            feePercent = 10;    // High fee — close to resolution
        }

        // Calculate exit value based on current pool ratio
        uint256 totalPool = market.totalYesPool + market.totalNoPool;
        uint256 userPool = userBet.isYes ? market.totalYesPool : market.totalNoPool;

        // Exit value: proportional share adjusted by pool balance
        uint256 exitValue = (userBet.amount * totalPool) / (2 * userPool);

        // Apply dynamic fee
        uint256 fee = (exitValue * feePercent) / 100;
        uint256 payout = exitValue - fee;

        // Safety: can't withdraw more than original bet amount
        if (payout > userBet.amount) {
            payout = userBet.amount;
        }

        // Safety: ensure contract has enough balance
        require(address(this).balance >= payout, "Insufficient contract balance");

        // Update pools
        if (userBet.isYes) {
            market.totalYesPool -= userBet.amount;
        } else {
            market.totalNoPool -= userBet.amount;
        }

        uint256 originalAmount = userBet.amount;
        userBet.amount = 0;
        userBet.claimed = true;

        payable(msg.sender).transfer(payout);
        emit PositionExited(_marketId, msg.sender, originalAmount, payout, feePercent);
    }

    /// @notice Resolve a market with the actual weather outcome (admin only)
    /// @param _marketId Market to resolve
    /// @param _outcome true = YES condition met, false = NO
    function resolveMarket(uint256 _marketId, bool _outcome) external onlyAdmin {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.OPEN, "Market not open");
        require(block.timestamp >= market.resolutionTime, "Too early to resolve");

        market.status = MarketStatus.RESOLVED;
        market.outcome = _outcome;

        emit MarketResolved(_marketId, _outcome, market.totalYesPool + market.totalNoPool);
    }

    /// @notice Claim winnings from a resolved market
    /// @param _marketId Market to claim from
    function claimWinnings(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.RESOLVED, "Market not resolved");

        Bet storage userBet = bets[_marketId][msg.sender];
        require(userBet.amount > 0, "No bet placed");
        require(!userBet.claimed, "Already claimed");

        userBet.claimed = true;

        // Check if user won
        if (userBet.isYes == market.outcome) {
            uint256 totalPool = market.totalYesPool + market.totalNoPool;
            uint256 platformFee = (totalPool * platformFeePercent) / 100;
            uint256 distributablePool = totalPool - platformFee;

            uint256 winningPool = market.outcome ? market.totalYesPool : market.totalNoPool;
            uint256 payout = (userBet.amount * distributablePool) / winningPool;

            // Transfer platform fee to admin
            payable(admin).transfer(platformFee / marketBettors[_marketId].length);

            // Transfer payout to winner
            payable(msg.sender).transfer(payout);
            emit WinningsClaimed(_marketId, msg.sender, payout);
        }
        // Losers get nothing — their funds are in the pool
    }

    // ============ VIEW FUNCTIONS ============

    /// @notice Get market details
    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }

    /// @notice Get current odds for a market (returns YES percentage scaled by 100)
    function getOdds(uint256 _marketId) external view returns (uint256 yesPercent, uint256 noPercent) {
        Market storage market = markets[_marketId];
        uint256 total = market.totalYesPool + market.totalNoPool;
        if (total == 0) return (50, 50); // Default 50/50 when no bets

        yesPercent = (market.totalYesPool * 100) / total;
        noPercent = 100 - yesPercent;
    }

    /// @notice Get user's bet on a specific market
    function getUserBet(uint256 _marketId, address _user) external view returns (Bet memory) {
        return bets[_marketId][_user];
    }

    /// @notice Get all active markets count
    function getActiveMarketCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < marketCount; i++) {
            if (markets[i].status == MarketStatus.OPEN) count++;
        }
    }

    /// @notice Get potential payout for a bet amount on a side
    function getPotentialPayout(uint256 _marketId, bool _isYes, uint256 _amount) external view returns (uint256) {
        Market storage market = markets[_marketId];
        uint256 newYesPool = market.totalYesPool + (_isYes ? _amount : 0);
        uint256 newNoPool = market.totalNoPool + (_isYes ? 0 : _amount);
        uint256 totalPool = newYesPool + newNoPool;
        uint256 distributable = totalPool - (totalPool * platformFeePercent / 100);
        uint256 winningPool = _isYes ? newYesPool : newNoPool;
        return (_amount * distributable) / winningPool;
    }

    /// @notice Calculate exit value and fee for a position
    function getExitInfo(uint256 _marketId, address _user) external view returns (
        uint256 exitValue,
        uint256 feePercent,
        uint256 payout
    ) {
        Market storage market = markets[_marketId];
        Bet storage userBet = bets[_marketId][_user];

        if (userBet.amount == 0 || userBet.claimed || market.status != MarketStatus.OPEN) {
            return (0, 0, 0);
        }

        uint256 timeRemaining = market.resolutionTime > block.timestamp
            ? market.resolutionTime - block.timestamp
            : 0;

        if (timeRemaining > 6 hours) {
            feePercent = 3;
        } else if (timeRemaining > 2 hours) {
            feePercent = 5;
        } else {
            feePercent = 10;
        }

        uint256 totalPool = market.totalYesPool + market.totalNoPool;
        uint256 userPool = userBet.isYes ? market.totalYesPool : market.totalNoPool;

        exitValue = (userBet.amount * totalPool) / (2 * userPool);
        uint256 fee = (exitValue * feePercent) / 100;
        payout = exitValue - fee;

        if (payout > userBet.amount) {
            payout = userBet.amount;
        }
    }
}
