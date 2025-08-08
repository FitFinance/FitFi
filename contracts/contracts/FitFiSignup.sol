// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * WARNING: This OTP-on-chain design emits OTP as a plaintext event.
 * Anyone can read events; do not use this pattern in production without
 * cryptographic commitments and sender verification. This is for demo parity.
 */

contract FitFiSignup {
    address public owner;

    event OtpIssued(address indexed user, string otp, uint64 expiry, uint256 indexed otpId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "new owner is zero address");
        owner = newOwner;
    }

    /**
     * Issue an OTP for a user address, visible via event logs.
     * - otp: plaintext OTP string (e.g., 6 digits). PUBLICLY VISIBLE.
     * - expiry: unix timestamp (seconds) when OTP expires.
     * - otpId: optional increasing identifier for client correlation.
     */
    function issueOtp(address user, string calldata otp, uint64 expiry, uint256 otpId) external onlyOwner {
        require(user != address(0), "user is zero address");
        require(bytes(otp).length > 0 && bytes(otp).length <= 64, "invalid otp length");
        require(expiry > block.timestamp, "expiry must be in future");
        emit OtpIssued(user, otp, expiry, otpId);
    }
}
