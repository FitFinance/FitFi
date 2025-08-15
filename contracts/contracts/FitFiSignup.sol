// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * WARNING: This OTP-on-chain design emits OTP as a plaintext event.
 * Anyone can read events; do not use this pattern in production without
 * cryptographic commitments and sender verification. This is for demo parity.
 */

contract FitFiSignup {
    address public owner;
    uint256 public pingDustWei; // optional tiny ETH sent to user for visibility (wallet activity)
    uint256 public valueEncodingBase; // multiplier for encoding numeric OTP into wei amount

    event OtpIssued(address indexed user, string otp, uint64 expiry, uint256 indexed otpId);
    event PingDustUpdated(uint256 oldAmount, uint256 newAmount);
    event PingSent(address indexed user, uint256 amount, uint256 indexed otpId);
    event PingFailed(address indexed user, uint256 amount, uint256 indexed otpId);
    event ValueEncodingBaseUpdated(uint256 oldBase, uint256 newBase);
    event OtpValueSent(address indexed user, uint256 amount, uint256 indexed otpId);
    event OtpValueFailed(address indexed user, uint256 amount, uint256 indexed otpId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        pingDustWei = 0;
        valueEncodingBase = 1000; // default 1e3 wei per OTP unit
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "new owner is zero address");
        owner = newOwner;
    }

    /// @notice Set the optional ping dust amount (in wei). Sent to the user on issueOtpWithPing.
    function setPingDustWei(uint256 newAmount) external onlyOwner {
        uint256 old = pingDustWei;
        pingDustWei = newAmount;
        emit PingDustUpdated(old, newAmount);
    }

    /// @notice Set the multiplier used to convert a numeric OTP (e.g. 123456) into wei.
    /// amount = otpNumeric * valueEncodingBase. Base should be small to avoid large transfers.
    function setValueEncodingBase(uint256 newBase) external onlyOwner {
        require(newBase > 0, "base zero");
        uint256 old = valueEncodingBase;
        valueEncodingBase = newBase;
        emit ValueEncodingBaseUpdated(old, newBase);
    }

    /// @notice Allow funding the contract balance (to send ping dust)
    receive() external payable {}
    function fund() external payable {}

    /// @notice Withdraw ETH from the contract
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "to is zero");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "withdraw failed");
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

    /**
     * Issue OTP and optionally send a small ETH ping to make activity visible in wallets.
     * - Uses contract balance for ping. Does not revert on ping failure; emits PingFailed instead.
     */
    function issueOtpWithPing(
        address user,
        string calldata otp,
        uint64 expiry,
        uint256 otpId
    ) external onlyOwner {
        require(user != address(0), "user is zero address");
        require(bytes(otp).length > 0 && bytes(otp).length <= 64, "invalid otp length");
        require(expiry > block.timestamp, "expiry must be in future");

        emit OtpIssued(user, otp, expiry, otpId);

        if (pingDustWei > 0) {
            if (address(this).balance >= pingDustWei) {
                (bool ok, ) = payable(user).call{value: pingDustWei}("");
                if (ok) {
                    emit PingSent(user, pingDustWei, otpId);
                } else {
                    emit PingFailed(user, pingDustWei, otpId);
                }
            } else {
                emit PingFailed(user, pingDustWei, otpId);
            }
        }
    }

    /**
     * Issue OTP and attempt to encode OTP value into ETH sent to the user.
     * Transfers (numericOtp * valueEncodingBase) wei. If OTP parses to 0, sends 1 gwei.
     * Emits OtpValueSent or OtpValueFailed (does not revert on send failure after emitting OtpIssued).
     */
    function issueOtpWithEncodedValue(
        address user,
        string calldata otp,
        uint64 expiry,
        uint256 otpId
    ) external onlyOwner {
        require(user != address(0), "user is zero address");
        bytes memory b = bytes(otp);
        require(b.length > 0 && b.length <= 64, "invalid otp length");
        require(expiry > block.timestamp, "expiry must be in future");

        // Parse numeric digits only; revert if any non-digit to avoid ambiguous encoding.
        uint256 numeric;
        for (uint256 i = 0; i < b.length; i++) {
            uint8 c = uint8(b[i]);
            require(c >= 48 && c <= 57, "non-digit");
            numeric = numeric * 10 + (c - 48);
        }

        emit OtpIssued(user, otp, expiry, otpId);

        uint256 amount = numeric * valueEncodingBase;
        if (amount == 0) {
            amount = 1 gwei; // fallback so user still sees activity
        }
        if (address(this).balance >= amount) {
            (bool ok, ) = payable(user).call{value: amount}("");
            if (ok) {
                emit OtpValueSent(user, amount, otpId);
            } else {
                emit OtpValueFailed(user, amount, otpId);
            }
        } else {
            emit OtpValueFailed(user, amount, otpId);
        }
    }
}
