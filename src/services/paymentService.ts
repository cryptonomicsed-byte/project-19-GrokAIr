import supabase, { CryptoPayment } from '../config/supabase';
import axios, { AxiosInstance } from 'axios';

export type SubscriptionTier = 'free' | 'pro' | 'elite';

export interface PriceConfig {
  tier: SubscriptionTier;
  amountUSD: number;
  currencyOptions: {
    currency: string; // USDC, ETH, SOL, etc.
    chain: string; // polygon, ethereum, solana
    amount: string; // Amount in that currency
  }[];
}

const PRICES: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 12,
  elite: 20,
};

/**
 * Traditional payment service (RevenueCat)
 */
export class RevenueCatPaymentService {
  private apiKey: string;
  private axios: AxiosInstance;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.axios = axios.create({
      baseURL: 'https://api.revenuecat.com/v1',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get available products
   */
  async getProducts(): Promise<any[]> {
    try {
      const response = await this.axios.get('/products');
      return response.data.products || [];
    } catch (error) {
      console.error('[RevenueCat] Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Start subscription purchase flow
   */
  async purchaseSubscription(
    userId: string,
    tier: SubscriptionTier
  ): Promise<string> {
    try {
      const response = await this.axios.post('/purchases', {
        user_id: userId,
        product_id: tier === 'pro' ? 'grokair_pro' : 'grokair_elite',
      });

      return response.data.transaction_id;
    } catch (error) {
      console.error('[RevenueCat] Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Verify receipt
   */
  async verifyReceipt(userId: string, receipt: string): Promise<boolean> {
    try {
      const response = await this.axios.post('/receipts', {
        user_id: userId,
        receipt_data: receipt,
      });

      return response.data.valid === true;
    } catch (error) {
      console.error('[RevenueCat] Receipt verification failed:', error);
      return false;
    }
  }

  /**
   * Get user subscription status
   */
  async getSubscriptionStatus(userId: string): Promise<any> {
    try {
      const response = await this.axios.get(`/subscribers/${userId}`);
      return response.data;
    } catch (error) {
      console.error('[RevenueCat] Error getting subscription:', error);
      return null;
    }
  }
}

/**
 * Crypto payment service (Stripe with Crypto support / Coinbase Commerce)
 */
export class CryptoPaymentService {
  private apiKey: string;
  private axios: AxiosInstance;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.axios = axios.create({
      baseURL: 'https://api.stripe.com/v1',
      auth: {
        username: apiKey,
        password: '',
      },
    });
  }

  /**
   * Get payment pricing for tier
   */
  getPricing(tier: SubscriptionTier): PriceConfig {
    const amountUSD = PRICES[tier];

    const currencyOptions = [
      {
        currency: 'USDC',
        chain: 'polygon',
        amount: (amountUSD * 1).toFixed(6),
      },
      {
        currency: 'USDC',
        chain: 'ethereum',
        amount: (amountUSD * 1).toFixed(6),
      },
      {
        currency: 'USDC',
        chain: 'solana',
        amount: (amountUSD * 1).toFixed(6),
      },
      {
        currency: 'ETH',
        chain: 'ethereum',
        amount: (amountUSD / 3500).toFixed(6), // ~3500 USD per ETH
      },
      {
        currency: 'SOL',
        chain: 'solana',
        amount: (amountUSD / 150).toFixed(3), // ~150 USD per SOL
      },
      {
        currency: 'MATIC',
        chain: 'polygon',
        amount: (amountUSD / 2).toFixed(2), // ~2 USD per MATIC
      },
    ];

    return {
      tier,
      amountUSD,
      currencyOptions,
    };
  }

  /**
   * Create crypto payment session
   */
  async createPaymentSession(
    userId: string,
    tier: SubscriptionTier,
    currency: string,
    chain: string,
    walletAddress: string
  ): Promise<CryptoPayment> {
    try {
      const pricing = this.getPricing(tier);
      const currencyOpt = pricing.currencyOptions.find(
        (c) => c.currency === currency && c.chain === chain
      );

      if (!currencyOpt) {
        throw new Error(`Unsupported currency/chain: ${currency}/${chain}`);
      }

      // Create payment record in Supabase
      const { data, error } = await supabase
        .from('crypto_payments')
        .insert({
          user_id: userId,
          tier,
          amount: currencyOpt.amount,
          currency,
          chain,
          wallet_address: walletAddress,
          status: 'pending',
          tx_hash: '',
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
        })
        .select()
        .single();

      if (error) throw error;

      return data as CryptoPayment;
    } catch (error) {
      console.error('[CryptoPayment] Session creation failed:', error);
      throw error;
    }
  }

  /**
   * Verify transaction on-chain
   */
  async verifyTransaction(
    paymentId: string,
    txHash: string
  ): Promise<boolean> {
    try {
      // Get payment record
      const { data: payment, error: fetchError } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (fetchError || !payment) {
        console.error('[CryptoPayment] Payment not found');
        return false;
      }

      // Verify transaction based on chain
      const isValid = await this.verifyTransactionByChain(
        payment.chain,
        txHash,
        payment.wallet_address,
        payment.amount
      );

      if (isValid) {
        // Update payment status
        const { error: updateError } = await supabase
          .from('crypto_payments')
          .update({
            status: 'confirmed',
            tx_hash: txHash,
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', paymentId);

        if (!updateError) {
          // Grant subscription
          await this.grantSubscription(payment.user_id, payment.tier);
        }
      }

      return isValid;
    } catch (error) {
      console.error('[CryptoPayment] Verification failed:', error);
      return false;
    }
  }

  /**
   * Verify transaction on specific blockchain
   */
  private async verifyTransactionByChain(
    chain: string,
    txHash: string,
    walletAddress: string,
    expectedAmount: string
  ): Promise<boolean> {
    try {
      switch (chain) {
        case 'ethereum':
          return await this.verifyEthereumTx(txHash, walletAddress);
        case 'polygon':
          return await this.verifyPolygonTx(txHash, walletAddress);
        case 'solana':
          return await this.verifySolanaTx(txHash, walletAddress);
        default:
          return false;
      }
    } catch (error) {
      console.error(`[CryptoPayment] Chain verification failed: ${chain}`, error);
      return false;
    }
  }

  /**
   * Verify Ethereum transaction
   */
  private async verifyEthereumTx(
    txHash: string,
    walletAddress: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(process.env.ETHEREUM_RPC_URL || '', {
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      });

      const receipt = response.data.result;
      if (!receipt) return false;

      return (
        receipt.status === '0x1' && receipt.from.toLowerCase() === walletAddress.toLowerCase()
      );
    } catch (error) {
      console.error('[CryptoPayment] Ethereum verification failed:', error);
      return false;
    }
  }

  /**
   * Verify Polygon transaction
   */
  private async verifyPolygonTx(
    txHash: string,
    walletAddress: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(process.env.POLYGON_RPC_URL || '', {
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      });

      const receipt = response.data.result;
      if (!receipt) return false;

      return (
        receipt.status === '0x1' && receipt.from.toLowerCase() === walletAddress.toLowerCase()
      );
    } catch (error) {
      console.error('[CryptoPayment] Polygon verification failed:', error);
      return false;
    }
  }

  /**
   * Verify Solana transaction
   */
  private async verifySolanaTx(
    txHash: string,
    walletAddress: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(process.env.SOLANA_RPC_URL || '', {
        jsonrpc: '2.0',
        method: 'getTransaction',
        params: [txHash],
        id: 1,
      });

      const tx = response.data.result;
      if (!tx?.transaction?.message?.accountKeys) return false;

      // Check if wallet is in transaction
      return tx.transaction.message.accountKeys.includes(walletAddress);
    } catch (error) {
      console.error('[CryptoPayment] Solana verification failed:', error);
      return false;
    }
  }

  /**
   * Grant subscription to user
   */
  private async grantSubscription(
    userId: string,
    tier: SubscriptionTier
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const { error } = await supabase.from('subscriptions').insert({
        user_id: userId,
        tier,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });

      if (error) throw error;

      // Update user tier
      await supabase.from('users').update({ tier }).eq('id', userId);

      console.log(`[CryptoPayment] Granted ${tier} subscription to ${userId}`);
    } catch (error) {
      console.error('[CryptoPayment] Failed to grant subscription:', error);
      throw error;
    }
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId: string): Promise<CryptoPayment[]> {
    try {
      const { data, error } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CryptoPayment[];
    } catch (error) {
      console.error('[CryptoPayment] Failed to fetch history:', error);
      return [];
    }
  }

  /**
   * Cancel pending payment
   */
  async cancelPayment(paymentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('crypto_payments')
        .update({ status: 'expired' })
        .eq('id', paymentId);

      if (error) throw error;
    } catch (error) {
      console.error('[CryptoPayment] Failed to cancel payment:', error);
      throw error;
    }
  }
}

/**
 * Unified payment service
 */
export class PaymentService {
  private revenueCat: RevenueCatPaymentService | null = null;
  private cryptoPayment: CryptoPaymentService;

  constructor(revenueCatKey?: string, stripeKey?: string) {
    if (revenueCatKey) {
      this.revenueCat = new RevenueCatPaymentService(revenueCatKey);
    }
    this.cryptoPayment = new CryptoPaymentService(stripeKey || '');
  }

  /**
   * Get available payment methods
   */
  getPaymentMethods() {
    return {
      traditional: ['apple_pay', 'google_pay', 'credit_card'],
      crypto: [
        { currency: 'USDC', chains: ['ethereum', 'polygon', 'solana'] },
        { currency: 'ETH', chains: ['ethereum'] },
        { currency: 'SOL', chains: ['solana'] },
        { currency: 'MATIC', chains: ['polygon'] },
      ],
    };
  }

  /**
   * Get pricing information
   */
  getPricing(tier: SubscriptionTier) {
    return this.cryptoPayment.getPricing(tier);
  }

  /**
   * Create crypto payment
   */
  async createCryptoPayment(
    userId: string,
    tier: SubscriptionTier,
    currency: string,
    chain: string,
    walletAddress: string
  ): Promise<CryptoPayment> {
    return this.cryptoPayment.createPaymentSession(
      userId,
      tier,
      currency,
      chain,
      walletAddress
    );
  }

  /**
   * Verify crypto payment
   */
  async verifyCryptoPayment(paymentId: string, txHash: string): Promise<boolean> {
    return this.cryptoPayment.verifyTransaction(paymentId, txHash);
  }

  /**
   * Get crypto payment history
   */
  async getCryptoPaymentHistory(userId: string): Promise<CryptoPayment[]> {
    return this.cryptoPayment.getPaymentHistory(userId);
  }

  /**
   * Start traditional purchase (RevenueCat)
   */
  async startTraditionalPurchase(
    userId: string,
    tier: SubscriptionTier
  ): Promise<string | null> {
    if (!this.revenueCat) {
      console.warn('[Payment] RevenueCat not configured');
      return null;
    }
    return this.revenueCat.purchaseSubscription(userId, tier);
  }

  /**
   * Get crypto pricing
   */
  getCryptoPricing(tier: SubscriptionTier) {
    return this.cryptoPayment.getPricing(tier);
  }
}
