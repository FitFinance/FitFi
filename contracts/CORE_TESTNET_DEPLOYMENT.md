DIRECTIONAL READ ME FOR CORE TESTNET DEPLOYMENT

## Holesky FitFiSignup (with value encoding) – Deployed Aug 9 2025

New deployment (adds valueEncodingBase + issueOtpWithEncodedValue):

- Address: 0x66BFeb903E8Aa24eF374EdAF716B796595DB2819
- Network: Holesky (chainId 17000)
- Deployer: 0xdA344FCAEc1F6E7F09d97A701C7436844F0deb95
- Features:
  - valueEncodingBase (default 1000)
  - issueOtpWithEncodedValue (sends otpNumeric \* base wei, 1 gwei fallback)
  - Existing ping functionality unchanged
- Verification: Pending (Etherscan API key not configured)

Set SIGNUP_CONTRACT_ADDRESS in backend .env to this address to enable new OTP value encoding path.
