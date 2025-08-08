// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title KleoNFT
 * @dev NFT contract for Kleo platform on Ripple EVM Sidechain
 * @author Kleo Team
 * @notice Optimized for Ripple EVM with XRPL integration
 */
contract KleoNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Spam prevention (optimized for Ripple EVM)
    uint256 public mintFee = 0.001 ether; // 0.001 XRP equivalent
    uint256 public maxMintsPerUser = 10;
    uint256 public mintCooldown = 300; // 5 minutes
    mapping(address => uint256) public userMintCount;
    mapping(address => uint256) public lastMintTime;
    
    // XRPL integration
    mapping(uint256 => string) private _xrplAddresses; // Link to XRPL address
    mapping(uint256 => uint256) private _xrplRewards; // XRPL reward points
    
    // Metadata
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => string) private _ipfsCIDs;
    
    // Events
    event NFTMinted(
        address indexed owner, 
        uint256 indexed tokenId, 
        string ipfsCID,
        string xrplAddress,
        uint256 xrplRewards
    );
    event XRPLRewardsUpdated(uint256 indexed tokenId, uint256 rewards);
    event MintFeeUpdated(uint256 newFee);
    event MaxMintsUpdated(uint256 newMax);
    event CooldownUpdated(uint256 newCooldown);
    
    constructor() ERC721("Kleo Stories", "KLEO") {
        // Set initial owner
        _transferOwnership(msg.sender);
    }
    
    /**
     * @dev Mint NFT for a Kleo post with XRPL integration
     * @param ipfsCID IPFS CID of the post
     * @param metadata JSON metadata string
     * @param xrplAddress Associated XRPL address
     * @param xrplRewards XRPL reward points earned
     */
    function mintNFT(
        string memory ipfsCID, 
        string memory metadata,
        string memory xrplAddress,
        uint256 xrplRewards
    ) 
        external 
        payable 
        nonReentrant 
    {
        require(msg.value >= mintFee, "Insufficient mint fee");
        require(userMintCount[msg.sender] < maxMintsPerUser, "Mint limit reached");
        require(block.timestamp - lastMintTime[msg.sender] >= mintCooldown, "Cooldown active");
        require(bytes(ipfsCID).length > 0, "Invalid IPFS CID");
        require(bytes(xrplAddress).length > 0, "Invalid XRPL address");
        
        // Update user stats
        userMintCount[msg.sender]++;
        lastMintTime[msg.sender] = block.timestamp;
        
        // Mint NFT
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, metadata);
        _ipfsCIDs[newTokenId] = ipfsCID;
        _xrplAddresses[newTokenId] = xrplAddress;
        _xrplRewards[newTokenId] = xrplRewards;
        
        emit NFTMinted(msg.sender, newTokenId, ipfsCID, xrplAddress, xrplRewards);
    }
    
    /**
     * @dev Update XRPL rewards for a token (owner only)
     */
    function updateXRPLRewards(uint256 tokenId, uint256 newRewards) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _xrplRewards[tokenId] = newRewards;
        emit XRPLRewardsUpdated(tokenId, newRewards);
    }
    
    /**
     * @dev Get XRPL address for token
     */
    function getXRPLAddress(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _xrplAddresses[tokenId];
    }
    
    /**
     * @dev Get XRPL rewards for token
     */
    function getXRPLRewards(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _xrplRewards[tokenId];
    }
    
    /**
     * @dev Get user mint count
     */
    function getUserMintCount(address user) external view returns (uint256) {
        return userMintCount[user];
    }
    
    /**
     * @dev Get user's last mint time
     */
    function getLastMintTime(address user) external view returns (uint256) {
        return lastMintTime[user];
    }
    
    /**
     * @dev Get current mint fee
     */
    function getMintFee() external view returns (uint256) {
        return mintFee;
    }
    
    /**
     * @dev Get max mints per user
     */
    function getMaxMintsPerUser() external view returns (uint256) {
        return maxMintsPerUser;
    }
    
    /**
     * @dev Get mint cooldown
     */
    function getMintCooldown() external view returns (uint256) {
        return mintCooldown;
    }
    
    /**
     * @dev Get IPFS CID for token
     */
    function getIPFSCID(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _ipfsCIDs[tokenId];
    }
    
    /**
     * @dev Check if user can mint
     */
    function canUserMint(address user) external view returns (bool) {
        return userMintCount[user] < maxMintsPerUser && 
               (block.timestamp - lastMintTime[user] >= mintCooldown || lastMintTime[user] == 0);
    }
    
    /**
     * @dev Get user's remaining mints
     */
    function getRemainingMints(address user) external view returns (uint256) {
        return maxMintsPerUser - userMintCount[user];
    }
    
    /**
     * @dev Get time until user can mint again
     */
    function getTimeUntilMint(address user) external view returns (uint256) {
        if (lastMintTime[user] == 0) return 0;
        
        uint256 timeSinceLastMint = block.timestamp - lastMintTime[user];
        if (timeSinceLastMint >= mintCooldown) return 0;
        
        return mintCooldown - timeSinceLastMint;
    }
    
    /**
     * @dev Get total XRPL rewards across all user tokens
     */
    function getUserTotalXRPLRewards(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256 balance = balanceOf(user);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            total += _xrplRewards[tokenId];
        }
        
        return total;
    }
    
    // Admin functions
    
    /**
     * @dev Update mint fee (owner only)
     */
    function setMintFee(uint256 newFee) external onlyOwner {
        mintFee = newFee;
        emit MintFeeUpdated(newFee);
    }
    
    /**
     * @dev Update max mints per user (owner only)
     */
    function setMaxMintsPerUser(uint256 newMax) external onlyOwner {
        maxMintsPerUser = newMax;
        emit MaxMintsUpdated(newMax);
    }
    
    /**
     * @dev Update mint cooldown (owner only)
     */
    function setMintCooldown(uint256 newCooldown) external onlyOwner {
        mintCooldown = newCooldown;
        emit CooldownUpdated(newCooldown);
    }
    
    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Emergency pause (owner only)
     */
    function emergencyPause() external onlyOwner {
        maxMintsPerUser = 0;
    }
    
    /**
     * @dev Resume minting (owner only)
     */
    function resumeMinting(uint256 newMax) external onlyOwner {
        maxMintsPerUser = newMax;
    }
    
    // Override functions
    
    /**
     * @dev Get token URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }
    
    /**
     * @dev Set token URI
     */
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_exists(tokenId), "Token does not exist");
        _tokenURIs[tokenId] = uri;
    }
    
    /**
     * @dev Required override for multiple inheritance (ERC721, ERC721Enumerable)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    /**
     * @dev Required override for multiple inheritance (ERC721, ERC721Enumerable)
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721) {
        super._afterTokenTransfer(from, to, firstTokenId, batchSize);
    }
    
    /**
     * @dev Override supportsInterface
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 