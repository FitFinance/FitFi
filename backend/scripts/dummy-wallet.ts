import express, { Application, Request, Response } from 'express';
import crypto from 'crypto';

const app: Application = express();
app.use(express.json());

// In-memory storage for private keys (for demonstration purposes only)
const privateKeys: Record<string, string> = {};

// Route to store a private key for a wallet address
app.post('/store-private-key', (req: Request, res: Response): void => {
  const {
    walletAddress,
    privateKey,
  }: { walletAddress?: string; privateKey?: string } = req.body;

  if (!walletAddress || !privateKey) {
    res
      .status(400)
      .json({ error: 'Wallet address and private key are required' });
    return;
  }

  privateKeys[walletAddress.toLowerCase()] = privateKey;
  res.json({ message: 'Private key stored successfully' });
});

// Helper to generate a random 40-character hex string (Ethereum address)
function generateRandomWalletAddress(): string {
  const randomBytes: Buffer = crypto.randomBytes(20); // 20 bytes = 40 hex chars
  return '0x' + randomBytes.toString('hex');
}

// Route to get a random wallet address
app.get('/wallet-address', (_req: Request, res: Response): void => {
  const walletAddress: string = generateRandomWalletAddress();
  res.json({ walletAddress });
});

// Route to sign a nonce using the private key associated with the wallet address
app.post('/sign-nonce', (req: Request, res: Response): void => {
  const { nonce, walletAddress }: { nonce?: string; walletAddress?: string } =
    req.body;

  if (!nonce || !walletAddress) {
    res.status(400).json({ error: 'Nonce and wallet address are required' });
    return;
  }

  const privateKey: string | undefined =
    privateKeys[walletAddress.toLowerCase()];

  if (!privateKey) {
    res
      .status(404)
      .json({ error: 'Private key not found for the given wallet address' });
    return;
  }

  // Sign the nonce using the private key
  const signature: string = crypto
    .createHmac('sha256', privateKey)
    .update(walletAddress + nonce)
    .digest('hex');

  res.json({ signedNonce: signature });
});

app.all('/{*any}', (req: Request, res: Response): void => {
  res.status(404).json({
    error: `Invalid route: ${req.originalUrl}`,
    message: 'The requested route does not exist on this server.',
  });
});

const PORT: number = 4000;
app.listen(PORT, (): void => {
  console.log(`Dummy wallet server running on port ${PORT}`);
});
